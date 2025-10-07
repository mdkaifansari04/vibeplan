import pinecone from "../../../libs/pinecone";
import { AnalysisResult } from "../controller/type";
import { baseConfig } from "../../../libs/constant";

interface TextRecord {
  id: string;
  metadata: {
    type: string;
    repo_name: string;
    repo_url?: string;
    branch?: string;
    file_path?: string;
    language?: string;
    description?: string;
    lines_of_code?: number;
    functions?: number;
    classes?: number;
    content: string;
    searchable_text: string;
    total_files?: number;
    // Enhanced metadata for better chunking and search
    complexity_score?: number;
    has_issues?: boolean;
    priority?: string;
    summary_type?: string;
    imports_count?: number;
    exports_count?: number;
    file_size?: number;
    full_code?: string;
    // Function-specific metadata
    function_name?: string;
    is_async?: boolean;
    is_exported?: boolean;
    parameter_count?: number;
    // Class-specific metadata
    class_name?: string;
    methods_count?: number;
    properties_count?: number;
    // Issue-specific metadata
    issues_count?: number;
    critical_issues?: number;
    high_issues?: number;
    issue_types?: string;
  };
}

export class TextSearchService {
  private readonly indexName = baseConfig.indexName;
  private readonly dimension = baseConfig.indexDimension; // Use a standard dimension for dummy vectors
  constructor() {}

  // Generate namespace from repo URL
  generateNamespace(repoUrl: string, branch: string): string {
    const urlParts = repoUrl.replace(".git", "").split("/");
    const username = urlParts[urlParts.length - 2];
    const repoName = urlParts[urlParts.length - 1];
    return `${username}-${repoName}-${branch}`;
  }

  // Check if namespace already exists
  async namespaceExists(namespace: string): Promise<boolean> {
    try {
      // First check if the index exists
      const indexes = await pinecone.listIndexes();
      const indexExists = indexes.indexes?.some((idx) => idx.name === this.indexName);

      if (!indexExists) {
        console.log(`Pinecone index '${this.indexName}' does not exist. Creating it...`);
        await this.createIndexIfNotExists();
        return false;
      }

      const index = pinecone.index(this.indexName);
      const stats = await index.namespace(namespace).describeIndexStats();
      return stats.totalRecordCount ? stats.totalRecordCount > 0 : false;
    } catch (error: any) {
      if (error.status === 404) {
        console.log(`Pinecone index '${this.indexName}' not found. Creating it...`);
        await this.createIndexIfNotExists();
        return false;
      }
      console.log("Namespace check error:", error);
      return false;
    }
  }

  // Create Pinecone index for text storage (no vectors needed)
  private async createIndexIfNotExists(): Promise<void> {
    try {
      console.log(`Creating Pinecone index: ${this.indexName} (text-only)`);
      await pinecone.createIndex({
        name: this.indexName,
        dimension: this.dimension, // Minimal dimension since we're using metadata search
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });

      // Wait for index to be ready
      let isReady = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!isReady && attempts < maxAttempts) {
        await this.sleep(10000);
        try {
          const description = await pinecone.describeIndex(this.indexName);
          isReady = description.status?.ready === true;
          attempts++;
          console.log(`Waiting for index to be ready... (${attempts}/${maxAttempts})`);
        } catch (error) {
          attempts++;
          await this.sleep(5000);
        }
      }

      if (isReady) {
        console.log(`✅ Pinecone index '${this.indexName}' created and ready!`);
      } else {
        throw new Error(`Index creation timed out after ${maxAttempts} attempts`);
      }
    } catch (error) {
      console.error("Error creating Pinecone index:", error);
      throw error;
    }
  }

  // Store repository analysis as text records
  async storeRepositoryAsText(analysisResult: AnalysisResult): Promise<string> {
    const namespace = this.generateNamespace(analysisResult.repo_url, analysisResult.branch);

    try {
      console.log(`Storing repository as text records in namespace: ${namespace}`);
      const index = pinecone.index(this.indexName);

      // Create text-based records
      const records = this.createTextRecords(analysisResult);
      console.log(`Created ${records.length} text records`);

      // Store in Pinecone with dummy vectors (since we only care about metadata)
      const dummyVector = new Array(1536).fill(0.1); // Create 1536-dimensional dummy vector
      const vectors = records.map((record) => ({
        id: record.id,
        values: dummyVector,
        metadata: record.metadata,
      }));

      // Upsert in batches
      const batchSize = 50;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(vectors.length / batchSize);

        console.log(`Storing batch ${batchNum}/${totalBatches} (${batch.length} records)`);
        await index.namespace(namespace).upsert(batch);

        if (i + batchSize < vectors.length) {
          await this.sleep(500);
        }
      }

      console.log(`✅ Successfully stored ${vectors.length} text records in namespace: ${namespace}`);
      return namespace;
    } catch (error) {
      console.error("Error storing text records:", error);
      throw error;
    }
  }

  // Search repository using metadata filtering
  async searchRepository(namespace: string, query: string, limit = 10) {
    try {
      const index = pinecone.index(this.indexName);

      // Search using metadata filter
      const dummySearchVector = new Array(1536).fill(0.1); // Create 1536-dimensional dummy vector
      const results = await index.namespace(namespace).query({
        vector: dummySearchVector,
        topK: limit,
        includeMetadata: true,
        filter: {
          $or: [
            { searchable_text: { $regex: `(?i)${query}` } }, // Case insensitive
            { file_path: { $regex: `(?i)${query}` } },
            { language: { $eq: query.toLowerCase() } },
            { description: { $regex: `(?i)${query}` } },
          ],
        },
      });

      return (
        results.matches?.map((match) => ({
          id: match.id,
          score: match.score,
          type: match.metadata?.type,
          file_path: match.metadata?.file_path,
          language: match.metadata?.language,
          description: match.metadata?.description,
          lines_of_code: match.metadata?.lines_of_code,
          functions: match.metadata?.functions,
          classes: match.metadata?.classes,
          content_preview: typeof match.metadata?.content === "string" ? match.metadata.content.substring(0, 200) + "..." : "No content available",
        })) || []
      );
    } catch (error) {
      console.error("Error searching repository:", error);
      throw error;
    }
  }

  // Create text records from analysis result
  private createTextRecords(analysisResult: AnalysisResult): TextRecord[] {
    const records: TextRecord[] = [];

    // Repository overview record
    const languageStats = this.getLanguageStats(analysisResult.files);
    const repoOverview = `Repository: ${analysisResult.repo_name}. ${analysisResult.stats.total_files} total files, ${analysisResult.stats.code_files} code files. Languages: ${Object.entries(languageStats)
      .map(([lang, count]) => `${lang}(${count})`)
      .join(", ")}`;

    records.push({
      id: `${analysisResult.repo_name}-overview`,
      metadata: {
        type: "repository_overview",
        repo_name: analysisResult.repo_name,
        repo_url: analysisResult.repo_url,
        branch: analysisResult.branch,
        total_files: analysisResult.stats.total_files,
        content: repoOverview,
        searchable_text: `${analysisResult.repo_name} repository overview statistics ${Object.keys(languageStats).join(" ")}`,
      },
    });

    // File records - prioritize significant files with enhanced metadata
    const significantFiles = analysisResult.files.filter((file) => this.isSignificantFile(file)).slice(0, 100); // Limit to 100 most significant files

    significantFiles.forEach((file, index) => {
      const functionNames = file.functions.map((f) => f.name).filter((name) => name !== "<anonymous>");
      const classNames = file.classes.map((c) => c.name);

      // Enhanced searchable content with more metadata
      const searchableContent = [
        file.file_path,
        file.language,
        file.description,
        ...functionNames,
        ...classNames,
        ...file.variables,
        ...file.imports,
        ...file.exports,
        // Add enhanced analysis data
        ...(file.analysis_enhanced?.semantic_tags || []),
        ...(file.analysis_enhanced?.detected_issues.map((issue) => `${issue.type} ${issue.severity}`) || []),
      ]
        .filter(Boolean)
        .join(" ");

      // More detailed content summary with enhanced analysis
      let contentSummary = `File: ${file.file_path} (${file.language}). ${file.description}. ${file.lines_of_code} lines.`;

      if (functionNames.length > 0) {
        contentSummary += ` Functions: ${functionNames.join(", ")}.`;
      }

      if (classNames.length > 0) {
        contentSummary += ` Classes: ${classNames.join(", ")}.`;
      }

      // Add enhanced analysis insights
      if (file.analysis_enhanced) {
        if (file.analysis_enhanced.complexity_score > 10) {
          contentSummary += ` High complexity (${file.analysis_enhanced.complexity_score}).`;
        }

        if (file.analysis_enhanced.detected_issues.length > 0) {
          const criticalIssues = file.analysis_enhanced.detected_issues.filter((i) => i.severity === "critical");
          if (criticalIssues.length > 0) {
            contentSummary += ` Critical issues: ${criticalIssues.map((i) => i.type).join(", ")}.`;
          }
        }

        if (file.analysis_enhanced.semantic_tags.length > 0) {
          contentSummary += ` Tags: ${file.analysis_enhanced.semantic_tags.join(", ")}.`;
        }
      }

      records.push({
        id: `${analysisResult.repo_name}-file-${index}`,
        metadata: {
          type: "file",
          repo_name: analysisResult.repo_name,
          file_path: file.file_path,
          language: file.language,
          description: file.description,
          lines_of_code: file.lines_of_code,
          functions: file.functions.length,
          classes: file.classes.length,
          content: contentSummary,
          searchable_text: searchableContent.toLowerCase(),
          // Add enhanced metadata for better chunking
          complexity_score: file.analysis_enhanced?.complexity_score || 0,
          has_issues: (file.analysis_enhanced?.detected_issues.length || 0) > 0,
          priority: file.analysis_enhanced?.priority || "low",
          summary_type: file.analysis_enhanced?.summary_type || "rule-based",
          imports_count: file.imports.length,
          exports_count: file.exports.length,
          file_size: file.metadata?.size_bytes || 0,
          // Store full content for AI phase generation if available
          full_code: file.analysis_enhanced?.full_content || "",
        },
      });

      // Create granular records for complex files with functions and classes
      if (file.analysis_enhanced?.priority === "high" || file.analysis_enhanced?.priority === "critical") {
        // Function-level records for complex files
        file.functions.forEach((func, funcIndex) => {
          if (func.name && func.name !== "<anonymous>") {
            records.push({
              id: `${analysisResult.repo_name}-func-${index}-${funcIndex}`,
              metadata: {
                type: "function",
                repo_name: analysisResult.repo_name,
                file_path: file.file_path,
                language: file.language,
                content: `Function: ${func.name} in ${file.file_path}. Parameters: ${func.parameters.join(", ")}. Return type: ${func.returnType}. ${func.isAsync ? "Async" : "Sync"} function.`,
                searchable_text: `${func.name} function ${func.parameters.join(" ")} ${func.returnType} ${file.file_path}`.toLowerCase(),
                function_name: func.name,
                is_async: func.isAsync,
                is_exported: func.isExported,
                parameter_count: func.parameters.length,
              },
            });
          }
        });

        // Class-level records for complex files
        file.classes.forEach((cls, clsIndex) => {
          if (cls.name) {
            records.push({
              id: `${analysisResult.repo_name}-class-${index}-${clsIndex}`,
              metadata: {
                type: "class",
                repo_name: analysisResult.repo_name,
                file_path: file.file_path,
                language: file.language,
                content: `Class: ${cls.name} in ${file.file_path}. Methods: ${cls.methods.join(", ")}. Properties: ${cls.properties.join(", ")}.`,
                searchable_text: `${cls.name} class ${cls.methods.join(" ")} ${cls.properties.join(" ")} ${file.file_path}`.toLowerCase(),
                class_name: cls.name,
                methods_count: cls.methods.length,
                properties_count: cls.properties.length,
                is_exported: cls.isExported,
              },
            });
          }
        });
      }

      // Create issue-specific records for files with detected problems
      if (file.analysis_enhanced?.detected_issues && file.analysis_enhanced.detected_issues.length > 0) {
        const criticalIssues = file.analysis_enhanced.detected_issues.filter((issue) => issue.severity === "critical");
        const highIssues = file.analysis_enhanced.detected_issues.filter((issue) => issue.severity === "high");

        if (criticalIssues.length > 0 || highIssues.length > 0) {
          const importantIssues = [...criticalIssues, ...highIssues];
          records.push({
            id: `${analysisResult.repo_name}-issues-${index}`,
            metadata: {
              type: "issues",
              repo_name: analysisResult.repo_name,
              file_path: file.file_path,
              language: file.language,
              content: `Issues found in ${file.file_path}: ${importantIssues.map((i) => `${i.severity} ${i.type} - ${i.description}`).join("; ")}.`,
              searchable_text: `issues problems bugs ${importantIssues.map((i) => `${i.type} ${i.severity}`).join(" ")} ${file.file_path}`.toLowerCase(),
              issues_count: importantIssues.length,
              critical_issues: criticalIssues.length,
              high_issues: highIssues.length,
              issue_types: importantIssues.map((i) => i.type).join(","),
            },
          });
        }
      }
    });

    // Language-based summary records
    Object.entries(languageStats).forEach(([language, count]) => {
      const languageFiles = analysisResult.files.filter((f) => f.language === language);
      const allFunctions = languageFiles.flatMap((f) => f.functions.map((fn) => fn.name)).filter((name) => name !== "<anonymous>");
      const allClasses = languageFiles.flatMap((f) => f.classes.map((c) => c.name));

      records.push({
        id: `${analysisResult.repo_name}-lang-${language}`,
        metadata: {
          type: "language_summary",
          repo_name: analysisResult.repo_name,
          language: language,
          content: `${language} files in repository: ${count} files. Functions: ${allFunctions.slice(0, 20).join(", ")}. Classes: ${allClasses.slice(0, 10).join(", ")}.`,
          searchable_text: `${language} programming ${allFunctions.join(" ")} ${allClasses.join(" ")}`,
          total_files: count,
        },
      });
    });

    console.log(`Created ${records.length} text records:
    - ${significantFiles.length} file records
    - ${records.filter((r) => r.metadata.type === "function").length} function records  
    - ${records.filter((r) => r.metadata.type === "class").length} class records
    - ${records.filter((r) => r.metadata.type === "issues").length} issue records
    - ${Object.keys(languageStats).length} language summaries
    - 1 repository overview`);
    return records;
  }

  // Check if file is significant for indexing
  private isSignificantFile(file: any): boolean {
    // Always include files with enhanced analysis and priority
    if (file.analysis_enhanced?.priority === "critical" || file.analysis_enhanced?.priority === "high") {
      return true;
    }

    // Include files with AI summaries
    if (file.analysis_enhanced?.summary_type === "ai-generated") {
      return true;
    }

    // Include files with detected issues
    if (file.analysis_enhanced?.detected_issues && file.analysis_enhanced.detected_issues.length > 0) {
      return true;
    }

    // Include files with high complexity
    if (file.analysis_enhanced?.complexity_score && file.analysis_enhanced.complexity_score > 10) {
      return true;
    }

    // Original significance criteria
    return file.functions.length > 0 || file.classes.length > 0 || file.lines_of_code > 20 || ["typescript", "javascript", "python", "java"].includes(file.language) || file.file_path.includes("index") || file.file_path.includes("main") || file.file_path.includes("app") || file.file_path.includes("config") || file.file_path.includes("README") || file.file_path.includes("component") || file.file_path.includes("service") || file.file_path.includes("controller") || file.file_path.includes("model") || file.file_path.includes("util") || file.file_path.includes("helper");
  }

  // Get language statistics
  private getLanguageStats(files: any[]): Record<string, number> {
    const stats: Record<string, number> = {};
    files.forEach((file) => {
      stats[file.language] = (stats[file.language] || 0) + 1;
    });
    return stats;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
