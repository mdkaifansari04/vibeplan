export interface ChunkMetadata {
  repo_name: string;
  repo_url: string;
  branch: string;
  file_path?: string;
  chunk_type: "repo_summary" | "file_analysis" | "file_content";
  language?: string;
  chunk_index: number;
  total_chunks: number;
}

export interface ProcessedChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  repo_name: string;
  repo_url: string;
  branch: string;
  file_path?: string;
  chunk_type: "repo_summary" | "file_analysis" | "file_content";
  language?: string;
  chunk_index: number;
  total_chunks: number;
}

export interface ProcessedChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

export interface PromptAnalysis {
  queryType: "specific" | "improvement" | "refactor" | "debug" | "feature";
  intent: string;
  targetAreas: string[];
  complexity: "low" | "medium" | "high";
  keywords: string[];
}

export interface RelevantContext {
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

export interface Phase {
  id: string;
  title: string;
  description: string;
  relevantFiles: string[];
  dependencies: string[];
  estimatedComplexity: "low" | "medium" | "high";
  priority: "low" | "medium" | "high";
  category: "bug_fix" | "feature" | "refactor" | "improvement" | "documentation";
  reasoning: string;
}
