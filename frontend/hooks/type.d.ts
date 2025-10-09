import { AppEdge, AppNode } from "@/components/container/depedency-graph";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IndexRepositoryResponse {
  namespace: string;
  dependencyGraph: {
    nodes: AppNode[];
    edges: AppEdge[];
    stats: {
      totalFiles: 120;
      totalDependencies: 36;
      languages: string[];
      entryPoints: string[];
    };
  };
  stats: {
    repository: {
      totalFiles: number;
      codeFiles: number;
      analyzedFiles: number;
      skippedDirs: string[];
      totalLines: number;
      totalFunctions: number;
      totalClasses: number;
    };
  };
  graph: {
    totalFiles: number;
    totalDependencies: number;
    languages: string[];
    entryPoints: string[];
  };
  enhancedAnalysis: {
    aiSummariesGenerated: 37;
    ruleBasedSummaries: 83;
    filesWithIssues: 22;
    criticalFiles: 0;
    highPriorityFiles: 7;
  };
}
