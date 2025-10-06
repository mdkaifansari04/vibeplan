const { Project } = require("ts-morph");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { config } = require("dotenv");
config();

const OWNER = "mdkaifansari04";
const REPO = "post0";
const BRANCH = "main";
const REPO_URL = `https://github.com/${OWNER}/${REPO}.git`;
const TEMP_DIR = "./tmp_repo";

const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git", ".next", "coverage", ".nuxt", "vendor", "__pycache__", ".pytest_cache", ".vscode", ".idea", "target", "bin", "obj", ".gradle", ".cache", ".expo", ".turbo", ".parcel-cache", ".hg", ".svn", ".egg-info", ".mypy_cache", ".ruff_cache", "Pods"]);

const INCLUDE_EXTENSIONS = new Set([".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".py", ".pyc", ".pyo", ".ipynb", ".java", ".class", ".jar", ".go", ".rb", ".erb", ".php", ".cpp", ".c", ".cc", ".cxx", ".h", ".hpp", ".cs", ".swift", ".kt", ".kts", ".rs", ".dart", ".scala", ".sh", ".bat", ".ps1", ".html", ".htm", ".css", ".scss", ".sass", ".less", ".json", ".yaml", ".yml", ".toml", ".ini", ".env", ".lock", ".md", ".markdown", ".xml", ".sql", ".sqlite", ".r", ".pl", ".pm", ".lua", ".jl", ".asm", ".dockerfile", ".gradle", ".pom", ".makefile", "Makefile", ".gradle", ".gemspec", ".lock"]);

async function cloneRepository() {
  console.log(`🔄 Cloning repository ${OWNER}/${REPO}...`);

  if (await fs.pathExists(TEMP_DIR)) {
    await fs.remove(TEMP_DIR);
  }

  try {
    execSync(`git clone --depth 1 --branch ${BRANCH} ${REPO_URL} ${TEMP_DIR}`, {
      stdio: "inherit",
    });
    console.log(`✅ Repository cloned to ${TEMP_DIR}`);
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

async function getAllFiles(dirPath = TEMP_DIR, relativePath = "") {
  const files = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativeFilePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        console.log(`⏭️  Skipping directory: ${relativeFilePath}`);
        continue;
      }

      const subFiles = await getAllFiles(fullPath, relativeFilePath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();

      if (INCLUDE_EXTENSIONS.has(ext)) {
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

function getLanguage(extension) {
  const languageMap = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".json": "json",
    ".md": "markdown",
    ".yml": "yaml",
    ".yaml": "yaml",
  };
  return languageMap[extension] || "unknown";
}

function generateFileDescription(functions, classes, variables, imports, exports) {
  const parts = [];

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
    if (imports.length > 0) {
      return `Imports modules: ${imports.join(", ")}`;
    }
    if (exports.length > 0) {
      return `Exports: ${exports.join(", ")}`;
    }
    return "File contains basic code structure";
  }

  return `Contains ${parts.join(" and ")}.`;
}

async function analyzeRepo(allFiles) {
  console.log(`🔍 Analyzing ${allFiles.length} files...`);

  const project = new Project();

  const codeFiles = allFiles.filter((file) => INCLUDE_EXTENSIONS.includes(file.extension));

  console.log(`📊 Found ${codeFiles.length} code files to analyze`);

  const validSourceFiles = [];
  for (const file of codeFiles) {
    try {
      const sourceFile = project.addSourceFileAtPath(file.fullPath);
      validSourceFiles.push({ sourceFile, fileInfo: file });
    } catch (error) {
      console.warn(`⚠️  Could not add file to project: ${file.path} - ${error.message}`);
    }
  }

  console.log(`✅ Successfully loaded ${validSourceFiles.length} source files into ts-morph`);

  const analysisResult = {
    repo_name: REPO,
    repo_url: REPO_URL.replace(".git", ""),
    branch: BRANCH,
    stats: {
      total_files: allFiles.length,
      code_files: codeFiles.length,
      analyzed_files: validSourceFiles.length,
      skipped_dirs: Array.from(SKIP_DIRS),
      included_extensions: Array.from(INCLUDE_EXTENSIONS),
    },
    files: [],
  };

  for (const file of allFiles) {
    try {
      const stats = await fs.stat(file.fullPath);

      const fileData = {
        file_path: file.path,
        relative_path: file.path,
        language: getLanguage(file.extension),
        imports: [],
        exports: [],
        classes: [],
        functions: [],
        variables: [],
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
          fileData.lines_of_code = sourceFile.getFullText().split("\n").length;

          const imports = sourceFile.getImportDeclarations();
          fileData.imports = imports.map((imp) => imp.getModuleSpecifierValue());

          const exports = sourceFile.getExportDeclarations();
          const exportedNames = [];

          exports.forEach((exp) => {
            const namedExports = exp.getNamedExports();
            namedExports.forEach((ne) => exportedNames.push(ne.getName()));
          });

          const exportedFunctions = sourceFile.getFunctions().filter((f) => f.isExported());
          exportedFunctions.forEach((f) => {
            const name = f.getName();
            if (name) exportedNames.push(name);
          });

          const exportedClasses = sourceFile.getClasses().filter((c) => c.isExported());
          exportedClasses.forEach((c) => exportedNames.push(c.getName()));

          const exportedVars = sourceFile.getVariableDeclarations().filter((v) => v.isExported());
          exportedVars.forEach((v) => exportedNames.push(v.getName()));

          fileData.exports = [...new Set(exportedNames)];

          const functions = sourceFile.getFunctions();
          fileData.functions = functions.map((func) => ({
            name: func.getName() || "<anonymous>",
            parameters: func.getParameters().map((p) => p.getName()),
            returnType: func.getReturnTypeNode()?.getText() || "unknown",
            isAsync: func.isAsync(),
            isExported: func.isExported(),
          }));

          const classes = sourceFile.getClasses();
          fileData.classes = classes.map((cls) => ({
            name: cls.getName(),
            methods: cls.getMethods().map((m) => m.getName()),
            properties: cls.getProperties().map((p) => p.getName()),
            isExported: cls.isExported(),
          }));

          const variableDeclarations = sourceFile.getVariableDeclarations();
          fileData.variables = variableDeclarations.map((v) => v.getName());

          fileData.description = generateFileDescription(fileData.functions, fileData.classes, fileData.variables, fileData.imports, fileData.exports);
        } catch (error) {
          console.warn(`⚠️  Error analyzing source file ${file.path}: ${error.message}`);
          fileData.description = "Could not analyze file content";
        }
      } else {
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

      analysisResult.files.push(fileData);
    } catch (error) {
      console.warn(` Error processing file ${file.path}: ${error.message}`);
    }
  }

  return analysisResult;
}

// 🧹 Cleanup temporary directory
async function cleanup() {
  try {
    if (await fs.pathExists(TEMP_DIR)) {
      await fs.remove(TEMP_DIR);
      console.log(`🧹 Cleaned up temporary directory: ${TEMP_DIR}`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not clean up temporary directory: ${error.message}`);
  }
}

(async () => {
  try {
    console.log(`Starting repository analysis for ${OWNER}/${REPO}`);
    console.log(`Configuration:`);
    console.log(`Repository: ${REPO_URL}`);
    console.log(`Branch: ${BRANCH}`);
    console.log(`Temporary directory: ${TEMP_DIR}`);
    console.log(`Skip directories: ${Array.from(SKIP_DIRS).join(", ")}`);
    console.log(`Include extensions: ${Array.from(INCLUDE_EXTENSIONS).join(", ")}`);

    // Step 1: Clone repository
    await cloneRepository();

    // Step 2: Get all relevant files
    console.log(`Scanning for files...`);
    const files = await getAllFiles();
    console.log(`Found ${files.length} relevant files`);

    // Step 3: Analyze with ts-morph and generate JSON
    console.log(`Performing comprehensive analysis...`);
    const analysisResult = await analyzeRepo(files);

    // Step 4: Save JSON output
    const outputFile = `./analysis_${REPO}_${Date.now()}.json`;
    await fs.writeJson(outputFile, analysisResult, { spaces: 2 });
    console.log(`Analysis saved to: ${outputFile}`);

    // Step 5: Display summary
    console.log(`Analysis Summary:`);
    console.log(` Repository: ${analysisResult.repo_name}`);
    console.log(` Total files: ${analysisResult.stats.total_files}`);
    console.log(` Code files: ${analysisResult.stats.code_files}`);
    console.log(` Successfully analyzed: ${analysisResult.stats.analyzed_files}`);

    // File type breakdown
    const fileTypes = {};
    analysisResult.files.forEach((file) => {
      fileTypes[file.language] = (fileTypes[file.language] || 0) + 1;
    });
    console.log(
      `   • Languages: ${Object.entries(fileTypes)
        .map(([lang, count]) => `${lang}(${count})`)
        .join(", ")}`
    );

    // Step 6: Cleanup (optional - comment out if you want to keep the repo)
    await cleanup();

    console.log(`Analysis completed successfully!`);
    console.log(`JSON output available at: ${outputFile}`);
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack trace:", error.stack);

    // Attempt cleanup on error
    try {
      await cleanup();
    } catch (cleanupError) {
      console.warn(`Cleanup failed: ${cleanupError.message}`);
    }

    process.exit(1);
  }
})();
