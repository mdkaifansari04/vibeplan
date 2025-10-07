import pinecone from "../../../libs/pinecone";
import { baseConfig } from "../../../libs/constant";
import { ContextFile, RelevantContext } from "./types";
import { EmbeddingService } from "./embedding.service";

export class VectorService {
  private indexName = baseConfig.indexName;
  private readonly embeddingService: EmbeddingService;
  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async findRelevantContext(namespace: string, userPrompt: string, queryType: string): Promise<RelevantContext> {
    const index = pinecone.index(this.indexName);
    const minSimilarity = 0.1; // Minimum similarity threshold
    let topK = 20; // Increased for better results

    // Enhanced query expansion based on type
    const expandedQuery = this.expandQuery(userPrompt, queryType);

    try {
      // Primary search with expanded query
      const queryEmbedding = await this.embeddingService.getEmbedding(expandedQuery);
      const results = await index.namespace(namespace).query({
        vector: queryEmbedding,
        topK: topK * 2, // Get more results to filter from
        includeMetadata: true,
        filter: {
          $and: [{ type: { $eq: "file" } }, { file_path: { $exists: true } }],
        },
      });

      let allResults = results.matches || [];

      // Fallback search with original query if primary didn't return enough results
      if (allResults.length < 5 && expandedQuery !== userPrompt) {
        console.log("Primary search returned few results, trying fallback...");
        const fallbackEmbedding = await this.embeddingService.getEmbedding(userPrompt);
        const fallbackResults = await index.namespace(namespace).query({
          vector: fallbackEmbedding,
          topK: topK,
          includeMetadata: true,
          filter: {
            $and: [{ type: { $eq: "file" } }, { file_path: { $exists: true } }],
          },
        });

        // Merge results, giving priority to primary search
        const fallbackMatches = fallbackResults.matches || [];
        const existingPaths = new Set(allResults.map((r) => r.metadata?.file_path));
        const newMatches = fallbackMatches.filter((match) => !existingPaths.has(match.metadata?.file_path));
        allResults = [...allResults, ...newMatches];
      }

      // Filter by similarity threshold and remove low-quality results
      const filteredResults = allResults.filter((match) => {
        if ((match.score || 0) < minSimilarity) return false;

        const filePath = (match.metadata?.file_path as string) || "";
        const searchableText = (match.metadata?.searchable_text as string) || "";

        // Filter out documentation-only files for technical queries
        const isDocFile = /\.(md|txt|rst|doc|pdf)$/i.test(filePath) || filePath.toLowerCase().includes("readme") || filePath.toLowerCase().includes("doc");

        // For technical queries, prefer code files unless it's explicitly a documentation query
        if (this.isTechnicalQuery(userPrompt, queryType) && isDocFile) {
          // Only keep doc files if they have substantial technical content
          const technicalKeywords = ["api", "implementation", "algorithm", "architecture", "design"];
          return technicalKeywords.some((keyword) => searchableText.toLowerCase().includes(keyword) || filePath.toLowerCase().includes(keyword));
        }

        return true;
      });

      const uniqueResults = this.deduplicateResults(filteredResults);
      const rankedResults = this.rankResults(uniqueResults, userPrompt, queryType);
      const topResults = rankedResults.slice(0, topK);

      console.log(`Vector search for "${userPrompt}": ${topResults.length} results found`);
      if (topResults.length > 0) {
        console.log("Top result:", {
          path: topResults[0].metadata?.file_path,
          similarity: topResults[0].score,
          language: topResults[0].metadata?.language,
        });
      }

      const contextFiles: ContextFile[] = topResults.map((match) => ({
        path: match.metadata?.file_path || "unknown",
        content: typeof match.metadata?.content === "string" ? match.metadata.content.slice(0, 1500) : match.metadata?.searchable_text?.slice(0, 1500) || "No content available",
        metadata: match.metadata || {},
        similarity: match.score || 0,
        language: match.metadata?.language,
        description: match.metadata?.description,
      }));

      return {
        files: contextFiles,
        dependencyInfo: await this.getDependencyInfo(namespace),
        repoStructure: await this.getRepoStructure(namespace),
        totalFilesFound: contextFiles.length,
      };
    } catch (error) {
      console.error("Error finding relevant context:", error);
      return {
        files: [],
        dependencyInfo: {},
        repoStructure: {},
        totalFilesFound: 0,
      };
    }
  }

  private expandQuery(userPrompt: string, queryType: string): string {
    const prompt = userPrompt.toLowerCase();
    let expandedTerms: string[] = [userPrompt];

    // Add context-specific terms based on query type and content
    switch (queryType) {
      case "improvement":
        if (prompt.includes("process") || prompt.includes("scheduling")) {
          expandedTerms.push("task management", "workflow", "job queue", "background processing", "async processing");
        }
        if (prompt.includes("performance")) {
          expandedTerms.push("optimization", "caching", "indexing", "database queries");
        }
        if (prompt.includes("security")) {
          expandedTerms.push("authentication", "authorization", "encryption", "validation");
        }
        break;

      case "feature":
        if (prompt.includes("scheduling") || prompt.includes("process")) {
          expandedTerms.push("cron jobs", "background tasks", "queue processing", "job scheduling", "task runner");
        }
        break;

      case "debug":
        expandedTerms.push("error handling", "logging", "monitoring", "debugging");
        break;

      case "refactor":
        expandedTerms.push("code organization", "modularity", "separation of concerns");
        break;
    }

    // Add semantic alternatives for common terms
    if (prompt.includes("scheduling")) {
      expandedTerms.push("scheduler", "cron", "job", "task", "queue", "worker");
    }
    if (prompt.includes("process")) {
      expandedTerms.push("processing", "workflow", "pipeline", "handler", "executor");
    }
    if (prompt.includes("api")) {
      expandedTerms.push("endpoint", "route", "controller", "service");
    }
    if (prompt.includes("database")) {
      expandedTerms.push("db", "model", "repository", "query", "schema");
    }

    return expandedTerms.join(" ");
  }

  private isTechnicalQuery(userPrompt: string, queryType: string): boolean {
    const technicalTypes = ["improvement", "debug", "refactor", "feature"];
    const technicalKeywords = ["implement", "code", "function", "class", "method", "api", "service", "database", "algorithm", "performance", "bug", "error", "process", "scheduling", "authentication", "validation", "optimization"];

    return technicalTypes.includes(queryType) || technicalKeywords.some((keyword) => userPrompt.toLowerCase().includes(keyword));
  }

  private rankResults(results: any[], userPrompt: string, queryType: string): any[] {
    const prompt = userPrompt.toLowerCase();

    return results
      .map((result) => {
        let score = result.score || 0;
        const metadata = result.metadata || {};
        const filePath = ((metadata.file_path as string) || "").toLowerCase();
        const searchableText = ((metadata.searchable_text as string) || "").toLowerCase();
        const language = (metadata.language as string) || "";

        // Boost score based on file relevance
        if (prompt.includes("scheduling") || prompt.includes("process")) {
          if (filePath.includes("scheduler") || filePath.includes("queue") || filePath.includes("job") || filePath.includes("task") || filePath.includes("worker") || filePath.includes("cron")) {
            score += 0.3;
          }
          if (searchableText.includes("schedule") || searchableText.includes("queue") || searchableText.includes("background") || searchableText.includes("async")) {
            score += 0.2;
          }
        }

        // Boost implementation files over config/docs for technical queries
        if (this.isTechnicalQuery(userPrompt, queryType)) {
          const isImplementationFile = /\.(js|ts|py|java|go|cpp|c|php|rb)$/i.test(filePath);
          const isConfigFile = /\.(json|yaml|yml|xml|ini|env)$/i.test(filePath);
          const isTestFile = filePath.includes("test") || filePath.includes("spec");

          if (isImplementationFile && !isTestFile) {
            score += 0.15;
          } else if (isConfigFile) {
            score -= 0.1;
          }
        }

        // Language-specific boosts
        if (language === "typescript" || language === "javascript") {
          score += 0.05;
        }

        // File size/content quality indicators
        const contentLength = searchableText.length;
        if (contentLength > 500 && contentLength < 10000) {
          score += 0.05; // Sweet spot for meaningful content
        }

        return { ...result, score };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private deduplicateResults(results: any[]): any[] {
    const seen = new Set<string>();
    const unique: any[] = [];

    for (const result of results) {
      const key = result.metadata?.file_path;
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private async getDependencyInfo(namespace: string): Promise<any> {
    try {
      // Use a generic embedding for dependency information
      const queryEmbedding = await this.embeddingService.getEmbedding("dependencies package.json requirements");
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: queryEmbedding,
          topK: 1,
          includeMetadata: true,
          filter: { type: "dependency_graph" },
        });

      return results.matches?.[0]?.metadata || {};
    } catch (error) {
      console.warn("Failed to get dependency info:", error);
      return {};
    }
  }

  private async getRepoStructure(namespace: string): Promise<any> {
    try {
      // Use a generic embedding for repository structure
      const queryEmbedding = await this.embeddingService.getEmbedding("repository structure project overview");
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: queryEmbedding,
          topK: 1,
          includeMetadata: true,
          filter: { type: "repo_summary" },
        });

      return results.matches?.[0]?.metadata || {};
    } catch (error) {
      console.warn("Failed to get repo structure:", error);
      return {};
    }
  }

  async getAllFiles(namespace: string, limit: number = 100): Promise<ContextFile[]> {
    try {
      // Use a broad embedding to get all files
      const queryEmbedding = await this.embeddingService.getEmbedding("code files source implementation");
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: queryEmbedding,
          topK: limit,
          includeMetadata: true,
          filter: {
            $and: [{ type: { $ne: "summary" } }, { type: { $ne: "dependency_graph" } }, { file_path: { $exists: true } }],
          },
        });

      return (
        results.matches?.map((match) => ({
          path: typeof match.metadata?.file_path === "string" ? match.metadata.file_path : "unknown",
          content: typeof match.metadata?.content === "string" ? match.metadata.content.slice(0, 1000) : typeof match.metadata?.searchable_text === "string" ? match.metadata.searchable_text.slice(0, 1000) : "No content available",
          metadata: match.metadata || {},
          similarity: match.score || 0,
          language: typeof match.metadata?.language === "string" ? match.metadata.language : undefined,
          description: typeof match.metadata?.description === "string" ? match.metadata.description : undefined,
        })) || []
      );
    } catch (error) {
      console.warn("Failed to get all files:", error);
      return [];
    }
  }
}
