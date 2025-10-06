import { Project } from "ts-morph";
import * as fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
import type { Response, NextFunction } from "express";
import { CustomRequest } from "../../../types";
import { AnalysisResult, FileInfo } from "./type";
import { TextSearchService } from "../services/text-search.service";

class IndexingController {
  private readonly SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git", ".next", "coverage", ".nuxt", "vendor", "__pycache__", ".pytest_cache", ".vscode", ".idea", "target", "bin", "obj", ".gradle", ".cache", ".expo", ".turbo", ".parcel-cache"]);
  private readonly INCLUDE_EXTENSIONS = new Set([".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".py", ".java", ".go", ".rb", ".php", ".cpp", ".c", ".cs", ".swift", ".kt", ".rs", ".dart", ".scala", ".html", ".css", ".scss", ".json", ".yaml", ".yml", ".md"]);
  private textSearchService: TextSearchService;

  constructor() {
    this.textSearchService = new TextSearchService();
  }

  public indexCodeRepository = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const tempDir = `./tmp_${Date.now()}`;
    const { repoUrl, branch = "main" } = req.value;

    try {
      const namespace = this.textSearchService.generateNamespace(repoUrl, branch);
      const namespaceExists = await this.textSearchService.namespaceExists(namespace);

      if (namespaceExists) {
        console.log(`Repository already indexed in namespace: ${namespace}`);
        return res.json({
          success: true,
          data: namespace,
          message: "Repository already indexed",
          cached: true,
        });
      }

      // Process repository if not cached
      console.log(`Processing repository: ${repoUrl} (branch: ${branch})`);
      await this.cloneRepository(repoUrl, branch, tempDir);
      const files = await this.getAllFiles(tempDir);
      const result = await this.analyzeRepository(files, repoUrl, branch, tempDir);

      // Store repository using text search service
      console.log("Storing repository data in Pinecone...");
      await this.textSearchService.storeRepositoryAsText(result);

      res.json({
        success: true,
        data: namespace,
        message: "Repository indexed successfully",
        cached: false,
        stats: result.stats,
      });
    } catch (error) {
      console.error("Error indexing repository:", error);
      next(error);
    } finally {
      await this.cleanup(tempDir);
    }
  };

  private async cloneRepository(repoUrl: string, branch: string, tempDir: string): Promise<void> {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }

    execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} ${tempDir}`, {
      stdio: "pipe",
    });
  }

  private async getAllFiles(dirPath: string, relativePath: string = ""): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        if (this.SKIP_DIRS.has(entry.name)) {
          continue;
        }
        const subFiles = await this.getAllFiles(fullPath, relativeFilePath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (this.INCLUDE_EXTENSIONS.has(ext)) {
          files.push({
            name: entry.name,
            path: relativeFilePath,
            fullPath: fullPath,
            extension: ext,
          });
        }
      }
    }

    return files;
  }

  private getLanguage(extension: string): string {
    const languageMap: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".py": "python",
      ".java": "java",
      ".go": "go",
      ".rb": "ruby",
      ".php": "php",
      ".cpp": "cpp",
      ".c": "c",
      ".cs": "csharp",
      ".swift": "swift",
      ".kt": "kotlin",
      ".rs": "rust",
      ".dart": "dart",
      ".scala": "scala",
      ".html": "html",
      ".css": "css",
      ".scss": "scss",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".md": "markdown",
    };
    return languageMap[extension] || "unknown";
  }

  private generateDescription(functions: any[], classes: any[], variables: string[], imports: string[], exports: string[]): string {
    const parts: string[] = [];

    if (functions.length > 0) {
      parts.push(`functions ${functions.map((f) => f.name).join(", ")}`);
    }
    if (classes.length > 0) {
      parts.push(`classes ${classes.map((c) => c.name).join(", ")}`);
    }
    if (variables.length > 0) {
      parts.push(`variables ${variables.join(", ")}`);
    }

    if (parts.length === 0) {
      if (imports.length > 0) return `Imports modules: ${imports.join(", ")}`;
      if (exports.length > 0) return `Exports: ${exports.join(", ")}`;
      return "File contains basic code structure";
    }

    return `Contains ${parts.join(" and ")}.`;
  }

  private async analyzeRepository(allFiles: FileInfo[], repoUrl: string, branch: string, tempDir: string): Promise<AnalysisResult> {
    const project = new Project();
    const codeFiles = allFiles.filter((file) => [".ts", ".tsx", ".js", ".jsx"].includes(file.extension));

    const validSourceFiles = [];
    for (const file of codeFiles) {
      try {
        const sourceFile = project.addSourceFileAtPath(file.fullPath);
        validSourceFiles.push({ sourceFile, fileInfo: file });
      } catch (error) {
        // skipping files that can't be parsed
      }
    }

    const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "unknown";

    const result: AnalysisResult = {
      repo_name: repoName,
      repo_url: repoUrl.replace(".git", ""),
      branch,
      stats: {
        total_files: allFiles.length,
        code_files: codeFiles.length,
        analyzed_files: validSourceFiles.length,
        skipped_dirs: Array.from(this.SKIP_DIRS),
        included_extensions: Array.from(this.INCLUDE_EXTENSIONS),
      },
      files: [],
    };

    for (const file of allFiles) {
      try {
        const stats = await fs.stat(file.fullPath);
        const fileData = {
          file_path: file.path,
          relative_path: file.path,
          language: this.getLanguage(file.extension),
          imports: [] as string[],
          exports: [] as string[],
          classes: [] as any[],
          functions: [] as any[],
          variables: [] as string[],
          description: "",
          lines_of_code: 0,
          metadata: {
            size_bytes: stats.size,
            last_modified: stats.mtime.toISOString(),
          },
        };

        const sourceFileEntry = validSourceFiles.find((sf) => sf.fileInfo.fullPath === file.fullPath);

        if (sourceFileEntry) {
          const sourceFile = sourceFileEntry.sourceFile;

          try {
            // Analyze code file with ts-morph
            fileData.lines_of_code = sourceFile.getFullText().split("\n").length;

            // Get imports
            fileData.imports = sourceFile.getImportDeclarations().map((imp) => imp.getModuleSpecifierValue());

            // Get exports
            const exportedNames = new Set<string>();

            sourceFile.getExportDeclarations().forEach((exp) => {
              exp.getNamedExports().forEach((ne) => exportedNames.add(ne.getName()));
            });

            sourceFile
              .getFunctions()
              .filter((f) => f.isExported())
              .forEach((f) => {
                const name = f.getName();
                if (name) exportedNames.add(name);
              });

            sourceFile
              .getClasses()
              .filter((c) => c.isExported())
              .forEach((c) => {
                exportedNames.add(c.getName() ?? "<unknown>");
              });

            fileData.exports = Array.from(exportedNames);

            // Get functions
            fileData.functions = sourceFile.getFunctions().map((func) => ({
              name: func.getName() || "<anonymous>",
              parameters: func.getParameters().map((p) => p.getName()),
              returnType: func.getReturnTypeNode()?.getText() || "unknown",
              isAsync: func.isAsync(),
              isExported: func.isExported(),
            }));

            // Get classes
            fileData.classes = sourceFile.getClasses().map((cls) => ({
              name: cls.getName(),
              methods: cls.getMethods().map((m) => m.getName()),
              properties: cls.getProperties().map((p) => p.getName()),
              isExported: cls.isExported(),
            }));

            // Get variables
            fileData.variables = sourceFile.getVariableDeclarations().map((v) => v.getName());

            fileData.description = this.generateDescription(fileData.functions, fileData.classes, fileData.variables, fileData.imports, fileData.exports);
          } catch (error) {
            fileData.description = "Could not analyze file content";
          }
        } else {
          // Handle non-code files
          try {
            const content = await fs.readFile(file.fullPath, "utf-8");
            fileData.lines_of_code = content.split("\n").length;

            if (file.extension === ".json") {
              fileData.description = "JSON configuration or data file";
            } else if (file.extension === ".md") {
              fileData.description = "Markdown documentation file";
            } else if ([".yml", ".yaml"].includes(file.extension)) {
              fileData.description = "YAML configuration file";
            } else {
              fileData.description = "Non-code file";
            }
          } catch (error) {
            fileData.description = "Could not read file content";
          }
        }

        result.files.push(fileData);
      } catch (error) {
        // Skip files that can't be processed
      }
    }

    return result;
  }

  public searchRepository = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { repoUrl, branch = "main", query, limit = 10 } = req.value;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      console.log(`Searching in repository: ${repoUrl} (branch: ${branch}) for: "${query}"`);

      const namespace = this.textSearchService.generateNamespace(repoUrl, branch);
      const results = await this.textSearchService.searchRepository(namespace, query, limit);

      res.json({
        success: true,
        data: results,
        message: "Search completed successfully",
        query,
        resultCount: results.length,
      });
    } catch (error) {
      console.error("Error searching repository:", error);
      next(error);
    }
  };

  private async cleanup(tempDir: string): Promise<void> {
    try {
      if (await fs.pathExists(tempDir)) {
        await fs.remove(tempDir);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

export default new IndexingController();
