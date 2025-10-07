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

export interface ReactFlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    language?: string;
    functions?: number;
    classes?: number;
    lines?: number;
    fileType?: string;
  };
  sourcePosition?: string;
  targetPosition?: string;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
}

export interface DependencyGraph {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  stats: {
    totalFiles: number;
    totalDependencies: number;
    languages: string[];
    entryPoints: string[];
  };
}

export interface PhaseGenerationRequest {
  namespace: string;
  userPrompt: string;
  contextType?: "specific" | "improvement" | "refactor" | "debug" | "feature";
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

export interface PromptAnalysis {
  queryType: "specific" | "improvement" | "refactor" | "debug" | "feature";
  intent: string;
  targetAreas: string[];
  complexity: "low" | "medium" | "high";
  keywords: string[];
}

export interface TextRecord {
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

    complexity_score?: number;
    has_issues?: boolean;
    priority?: string;
    summary_type?: string;
    imports_count?: number;
    exports_count?: number;
    file_size?: number;
    full_code?: string;

    function_name?: string;
    is_async?: boolean;
    is_exported?: boolean;
    parameter_count?: number;

    class_name?: string;
    methods_count?: number;
    properties_count?: number;

    issues_count?: number;
    critical_issues?: number;
    high_issues?: number;
    issue_types?: string;
  };
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

export interface ContextFile {
  path: string;
  content: string;
  metadata: any;
  similarity: number;
  language?: string;
  description?: string;
}
