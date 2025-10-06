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
