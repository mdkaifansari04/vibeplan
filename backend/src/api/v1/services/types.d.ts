export interface ChunkMetadata {
  repoName: string;
  repoUrl: string;
  branch: string;
  filePath?: string;
  chunkType: "repo_summary" | "file_analysis" | "file_content";
  language?: string;
  chunkIndex: number;
  totalChunks: number;
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

export interface TextRecord {
  id: string;
  metadata: {
    type: string;
    repoName: string;
    repoUrl?: string;
    branch?: string;
    filePath?: string;
    language?: string;
    description?: string;
    linesOfCode?: number;
    functions?: number;
    classes?: number;
    content: string;
    searchableText: string;
    totalFiles?: number;

    complexityScore?: number;
    hasIssues?: boolean;
    priority?: string;
    summaryType?: string;
    importsCount?: number;
    exportsCount?: number;
    fileSize?: number;
    fullCode?: string;

    functionName?: string;
    isAsync?: boolean;
    isExported?: boolean;
    parameterCount?: number;

    className?: string;
    methodsCount?: number;
    propertiesCount?: number;

    issuesCount?: number;
    criticalIssues?: number;
    highIssues?: number;
    issueTypes?: string;
  };
}

export interface ContextFile {
  path: string;
  content: string;
  metadata: any;
  similarity: number;
  language?: string;
  description?: string;
}
