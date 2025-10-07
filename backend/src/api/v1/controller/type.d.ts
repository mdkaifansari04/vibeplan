export interface FileInfo {
  name: string;
  path: string;
  fullPath: string;
  extension: string;
}

export interface AnalysisResult {
  repoName: string;
  repoUrl: string;
  branch: string;
  stats: {
    totalFiles: number;
    codeFiles: number;
    analyzedFiles: number;
    skippedDirs: string[];
    includedExtensions: string[];
  };
  files: EnhancedFileData[];
}

export interface EnhancedFileData {
  filePath: string;
  relativePath: string;
  language: string;
  imports: string[];
  exports: string[];
  classes: any[];
  functions: any[];
  variables: string[];
  description: string;
  linesOfCode: number;
  metadata: {
    sizeBytes: number;
    lastModified: string;
  };

  analysisEnhanced?: {
    complexityScore: number;
    detectedIssues: CodeIssue[];
    semanticTags: string[];
    needsAiSummary: boolean;
    priority: "low" | "medium" | "high" | "critical";
    summaryType: "rule-based" | "ai-generated" | "pending";
    codeSnippet?: string; // first 2000 chars for context
    fullContent?: string; // full content if needed
  };
}

export interface CodeIssue {
  type: "security" | "performance" | "maintainability" | "best-practice";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  line?: number;
  category: string;
}

export interface FileForSummary {
  path: string;
  content: string;
  language: string;
  analysis: any;
}

export interface AISummaryResult {
  path: string;
  summary: string;
  generated: boolean;
  error?: string;
}

export interface ProcessingStats {
  totalFiles: number;
  aiSummariesGenerated: number;
  ruleBasedSummaries: number;
  issuesDetected: number;
  processingTimeMs: number;
  summaryStrategy: "parallel" | "rate-limited" | "chunked" | "batch-api";
}
