import pinecone from "../../../libs/pinecone";
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
  };
}

interface RelevantContext {
  files: Array<{
    path: string;
    content: string;
    metadata: any;
    similarity: number;
    language?: string;
    description?: string;
  }>;
  dependencyInfo: any;
  repoStructure: any;
  totalFilesFound: number;
}

interface ContextFile {
  path: string;
  content: string;
  metadata: any;
  similarity: number;
  language?: string;
  description?: string;
}

export class VectorService {
  private indexName = baseConfig.indexName;

  constructor() {}

  /**
   * Find relevant context based on user prompt and query type
   */
  async findRelevantContext(namespace: string, userPrompt: string, queryType: string): Promise<RelevantContext> {
    // Different search strategies based on query type
    let searchQueries: string[] = [];
    let topK = 10;

    switch (queryType) {
      case "specific":
        // For specific queries, focus on exact matches
        searchQueries = [userPrompt];
        topK = 15;
        break;

      case "improvement":
        // For improvements, look for patterns and anti-patterns
        searchQueries = [userPrompt, "performance optimization", "error handling", "code quality issues", "security vulnerabilities"];
        topK = 20;
        break;

      case "refactor":
        // For refactoring, focus on structure and organization
        searchQueries = [userPrompt, "code organization", "duplicate code", "complex functions", "coupling dependencies"];
        topK = 15;
        break;

      case "debug":
        // For debugging, look for error-prone areas
        searchQueries = [userPrompt, "error handling", "exception handling", "try catch", "validation"];
        topK = 12;
        break;

      case "feature":
        // For features, understand existing patterns
        searchQueries = [userPrompt, "similar functionality", "existing patterns", "related components"];
        topK = 15;
        break;

      default:
        searchQueries = [userPrompt];
        topK = 10;
    }

    // Execute multiple searches and combine results
    const allResults: any[] = [];
    const index = pinecone.index(this.indexName);

    for (const query of searchQueries) {
      try {
        // Search using metadata filtering (text-based search)
        const results = await index.namespace(namespace).query({
          vector: new Array(1536).fill(0.1), // Dummy vector for metadata search
          topK: Math.ceil(topK / searchQueries.length),
          includeMetadata: true,
          filter: {
            $and: [
              { type: { $ne: "summary" } }, // Exclude repo summaries
              {
                $or: [{ searchable_text: { $regex: `(?i)${this.escapeRegex(query)}` } }, { file_path: { $regex: `(?i)${this.escapeRegex(query)}` } }, { description: { $regex: `(?i)${this.escapeRegex(query)}` } }, { language: { $eq: query.toLowerCase() } }],
              },
            ],
          },
        });

        if (results.matches) {
          allResults.push(...results.matches);
        }
      } catch (error) {
        console.warn(`Search failed for query "${query}":`, error);
        // Continue with other queries even if one fails
      }
    }

    // Deduplicate and rank results
    const uniqueResults = this.deduplicateResults(allResults);
    const topResults = uniqueResults.slice(0, topK);

    // Format results for LLM consumption
    const contextFiles: ContextFile[] = topResults.map((match) => ({
      path: match.metadata?.file_path || "unknown",
      content:
        typeof match.metadata?.content === "string"
          ? match.metadata.content.slice(0, 1500) // Limit content size
          : match.metadata?.searchable_text?.slice(0, 1500) || "No content available",
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
  }

  /**
   * Remove duplicate results and rank by similarity
   */
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

    // Sort by similarity score (descending)
    return unique.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  /**
   * Get dependency information for the repository
   */
  private async getDependencyInfo(namespace: string): Promise<any> {
    try {
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: new Array(1536).fill(0.1), // Dummy vector
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

  /**
   * Get repository structure overview
   */
  private async getRepoStructure(namespace: string): Promise<any> {
    try {
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: new Array(1536).fill(0.1), // Dummy vector
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

  /**
   * Escape special regex characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Get all files in a namespace for comprehensive analysis
   */
  async getAllFiles(namespace: string, limit: number = 100): Promise<ContextFile[]> {
    try {
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: new Array(1536).fill(0.1), // Dummy vector
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
