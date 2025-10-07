import pinecone from "../../../libs/pinecone";
import { baseConfig } from "../../../libs/constant";
import { ContextFile, RelevantContext } from "./types";

export class VectorService {
  private indexName = baseConfig.indexName;

  constructor() {}

  async findRelevantContext(namespace: string, userPrompt: string, queryType: string): Promise<RelevantContext> {
    let searchQueries: string[] = [];
    let topK = 10;

    switch (queryType) {
      case "specific":
        searchQueries = [userPrompt];
        topK = 15;
        break;

      case "improvement":
        searchQueries = [userPrompt, "performance optimization", "error handling", "code quality issues", "security vulnerabilities"];
        topK = 20;
        break;

      case "refactor":
        searchQueries = [userPrompt, "code organization", "duplicate code", "complex functions", "coupling dependencies"];
        topK = 15;
        break;

      case "debug":
        searchQueries = [userPrompt, "error handling", "exception handling", "try catch", "validation"];
        topK = 12;
        break;

      case "feature":
        searchQueries = [userPrompt, "similar functionality", "existing patterns", "related components"];
        topK = 15;
        break;

      default:
        searchQueries = [userPrompt];
        topK = 10;
    }

    const allResults: any[] = [];
    const index = pinecone.index(this.indexName);

    for (const query of searchQueries) {
      try {
        const results = await index.namespace(namespace).query({
          vector: new Array(1536).fill(0.1),
          topK: Math.ceil(topK / searchQueries.length),
          includeMetadata: true,
          filter: {
            $and: [
              { type: { $ne: "summary" } },
              {
                $or: [{ language: { $eq: query.toLowerCase() } }, { file_path: { $exists: true } }],
              },
            ],
          },
        });

        if (results.matches) {
          const filteredMatches = results.matches.filter((match) => {
            const searchableText = (match.metadata?.searchable_text as string) || "";
            const filePath = (match.metadata?.file_path as string) || "";
            const description = (match.metadata?.description as string) || "";
            const language = (match.metadata?.language as string) || "";

            const queryLower = query.toLowerCase();
            return searchableText.toLowerCase().includes(queryLower) || filePath.toLowerCase().includes(queryLower) || description.toLowerCase().includes(queryLower) || language.toLowerCase() === queryLower;
          });

          allResults.push(...filteredMatches);
        }
      } catch (error) {
        console.warn(`Search failed for query "${query}":`, error);
      }
    }

    const uniqueResults = this.deduplicateResults(allResults);
    const topResults = uniqueResults.slice(0, topK);

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
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: new Array(1536).fill(0.1),
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
          vector: new Array(1536).fill(0.1),
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
      const results = await pinecone
        .index(this.indexName)
        .namespace(namespace)
        .query({
          vector: new Array(1536).fill(0.1),
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
