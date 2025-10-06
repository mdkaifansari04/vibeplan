import pinecone from "../../../libs/pinecone";
import { EmbeddingService } from "./embedding.service";
import { AnalysisResult } from "../controller/type";
import { baseConfig } from "../../../libs/constant";
import { ProcessedChunk } from "./types";

export class RepositoryEmbeddingService {
  private embeddingService: EmbeddingService;
  private indexName = baseConfig.indexName;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  generateNamespace(repoUrl: string, branch: string): string {
    const urlParts = repoUrl.replace(".git", "").split("/");
    const username = urlParts[urlParts.length - 2];
    const repoName = urlParts[urlParts.length - 1];
    return `${username}-${repoName}-${branch}`;
  }

  async namespaceExists(namespace: string): Promise<boolean> {
    try {
      const index = pinecone.index(this.indexName);
      const stats = await index.namespace(namespace).describeIndexStats();
      return stats.totalRecordCount ? stats.totalRecordCount > 0 : false;
    } catch (error) {
      console.log("Namespace check error:", error);
      return false;
    }
  }

  createChunks(analysisResult: AnalysisResult): ProcessedChunk[] {
    const chunks: ProcessedChunk[] = [];
    const namespace = this.generateNamespace(analysisResult.repo_url, analysisResult.branch);

    const repoSummary = {
      repo_name: analysisResult.repo_name,
      repo_url: analysisResult.repo_url,
      branch: analysisResult.branch,
      stats: analysisResult.stats,
      total_files: analysisResult.files.length,
      languages: this.getLanguageStats(analysisResult.files),
    };

    chunks.push({
      id: `${namespace}-repo-summary`,
      content: `Repository: ${analysisResult.repo_name}\nURL: ${analysisResult.repo_url}\nBranch: ${analysisResult.branch}\nTotal Files: ${analysisResult.stats.total_files}\nCode Files: ${analysisResult.stats.code_files}\nAnalyzed Files: ${analysisResult.stats.analyzed_files}\nLanguages: ${Object.entries(this.getLanguageStats(analysisResult.files))
        .map(([lang, count]) => `${lang}(${count})`)
        .join(", ")}\nDescription: This repository contains ${analysisResult.stats.total_files} files with ${analysisResult.stats.code_files} code files across multiple programming languages.`,
      metadata: {
        repo_name: analysisResult.repo_name,
        repo_url: analysisResult.repo_url,
        branch: analysisResult.branch,
        chunk_type: "repo_summary",
        chunk_index: 0,
        total_chunks: 0, // Will be updated later
      },
    });

    // Group files by language and directory for better chunking
    const fileGroups = this.groupFiles(analysisResult.files);

    let chunkIndex = 1;

    // Process each file group
    for (const [groupKey, files] of fileGroups.entries()) {
      const groupContent = this.createFileGroupContent(files);

      // Split large groups into smaller chunks
      const groupChunks = this.splitContentIntoChunks(groupContent, 6000); // ~6k chars per chunk

      groupChunks.forEach((chunkContent, idx) => {
        chunks.push({
          id: `${namespace}-group-${groupKey}-${idx}`,
          content: chunkContent,
          metadata: {
            repo_name: analysisResult.repo_name,
            repo_url: analysisResult.repo_url,
            branch: analysisResult.branch,
            chunk_type: "file_analysis",
            language: files[0]?.language,
            chunk_index: chunkIndex++,
            total_chunks: 0, // Will be updated later
          },
        });
      });
    }

    // Process individual significant files
    analysisResult.files
      .filter((file) => this.isSignificantFile(file))
      .forEach((file) => {
        const fileContent = this.createDetailedFileContent(file);
        const fileChunks = this.splitContentIntoChunks(fileContent, 6000);

        fileChunks.forEach((chunkContent, idx) => {
          chunks.push({
            id: `${namespace}-file-${file.file_path.replace(/[^a-zA-Z0-9]/g, "-")}-${idx}`,
            content: chunkContent,
            metadata: {
              repo_name: analysisResult.repo_name,
              repo_url: analysisResult.repo_url,
              branch: analysisResult.branch,
              file_path: file.file_path,
              chunk_type: "file_content",
              language: file.language,
              chunk_index: chunkIndex++,
              total_chunks: 0, // Will be updated later
            },
          });
        });
      });

    // Update total chunks count
    chunks.forEach((chunk) => {
      chunk.metadata.total_chunks = chunks.length;
    });

    return chunks;
  }

  // Group files by language and directory structure
  private groupFiles(files: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    files.forEach((file) => {
      const dirPath = file.file_path.split("/").slice(0, -1).join("/") || "root";
      const key = `${file.language}-${dirPath}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(file);
    });

    return groups;
  }

  // Create content for a group of files
  private createFileGroupContent(files: any[]): string {
    const language = files[0]?.language || "unknown";
    const directory = files[0]?.file_path.split("/").slice(0, -1).join("/") || "root";

    let content = `Directory: ${directory}\nLanguage: ${language}\nFiles: ${files.length}\n\n`;

    files.forEach((file) => {
      content += `File: ${file.file_path}\n`;
      content += `Description: ${file.description}\n`;
      content += `Lines: ${file.lines_of_code}\n`;

      if (file.functions.length > 0) {
        content += `Functions: ${file.functions.map((f: any) => f.name).join(", ")}\n`;
      }

      if (file.classes.length > 0) {
        content += `Classes: ${file.classes.map((c: any) => c.name).join(", ")}\n`;
      }

      if (file.imports.length > 0) {
        content += `Imports: ${file.imports.join(", ")}\n`;
      }

      content += "\n";
    });

    return content;
  }

  // Create detailed content for significant files
  private createDetailedFileContent(file: any): string {
    let content = `File: ${file.file_path}\n`;
    content += `Language: ${file.language}\n`;
    content += `Description: ${file.description}\n`;
    content += `Lines of Code: ${file.lines_of_code}\n`;
    content += `Size: ${file.metadata.size_bytes} bytes\n`;
    content += `Last Modified: ${file.metadata.last_modified}\n\n`;

    if (file.imports.length > 0) {
      content += `Imports:\n${file.imports.map((imp: string) => `- ${imp}`).join("\n")}\n\n`;
    }

    if (file.exports.length > 0) {
      content += `Exports:\n${file.exports.map((exp: string) => `- ${exp}`).join("\n")}\n\n`;
    }

    if (file.functions.length > 0) {
      content += `Functions:\n`;
      file.functions.forEach((func: any) => {
        content += `- ${func.name}(${func.parameters.join(", ")}) -> ${func.returnType}`;
        if (func.isAsync) content += " (async)";
        if (func.isExported) content += " (exported)";
        content += "\n";
      });
      content += "\n";
    }

    if (file.classes.length > 0) {
      content += `Classes:\n`;
      file.classes.forEach((cls: any) => {
        content += `- ${cls.name}`;
        if (cls.isExported) content += " (exported)";
        content += `\n  Methods: ${cls.methods.join(", ")}\n`;
        if (cls.properties.length > 0) {
          content += `  Properties: ${cls.properties.join(", ")}\n`;
        }
      });
      content += "\n";
    }

    if (file.variables.length > 0) {
      content += `Variables:\n${file.variables.map((v: string) => `- ${v}`).join("\n")}\n\n`;
    }

    return content;
  }

  // Check if file is significant enough for detailed processing
  private isSignificantFile(file: any): boolean {
    return file.functions.length > 2 || file.classes.length > 0 || file.lines_of_code > 50 || file.language === "typescript" || file.language === "javascript" || file.file_path.includes("index") || file.file_path.includes("main") || file.file_path.includes("app");
  }

  // Split content into chunks of specified size
  private splitContentIntoChunks(content: string, maxSize: number): string[] {
    if (content.length <= maxSize) {
      return [content];
    }

    const chunks: string[] = [];
    const sentences = content.split("\n");
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence + "\n";
      } else {
        currentChunk += sentence + "\n";
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Get language statistics
  private getLanguageStats(files: any[]): Record<string, number> {
    const stats: Record<string, number> = {};
    files.forEach((file) => {
      stats[file.language] = (stats[file.language] || 0) + 1;
    });
    return stats;
  }

  // Store embeddings in Pinecone
  async storeEmbeddings(chunks: ProcessedChunk[], namespace: string): Promise<void> {
    try {
      const index = pinecone.index(this.indexName);

      // Generate embeddings for all chunks
      const contents = chunks.map((chunk) => chunk.content);
      const embeddings = await this.embeddingService.generateBatchEmbeddings(contents);

      // Prepare vectors for upsert
      const vectors = chunks.map((chunk, idx) => ({
        id: chunk.id,
        values: embeddings[idx],
        metadata: {
          ...chunk.metadata,
          content: chunk.content.substring(0, 1000), // Store first 1000 chars in metadata
        },
      }));

      // Upsert in batches
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.namespace(namespace).upsert(batch);
      }

      console.log(`Successfully stored ${vectors.length} embeddings in namespace: ${namespace}`);
    } catch (error) {
      console.error("Error storing embeddings:", error);
      throw error;
    }
  }

  async processRepository(analysisResult: AnalysisResult): Promise<string> {
    const namespace = this.generateNamespace(analysisResult.repo_url, analysisResult.branch);

    if (await this.namespaceExists(namespace)) {
      console.log(`Repository already processed in namespace: ${namespace}`);
      return namespace;
    }

    const chunks = this.createChunks(analysisResult);
    console.log(`Created ${chunks.length} chunks for repository`);

    await this.storeEmbeddings(chunks, namespace);

    return namespace;
  }
}
