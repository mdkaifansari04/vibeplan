export interface FileInfo {
  name: string;
  path: string;
  fullPath: string;
  extension: string;
}

export interface AnalysisResult {
  repo_name: string;
  repo_url: string;
  branch: string;
  stats: {
    total_files: number;
    code_files: number;
    analyzed_files: number;
    skipped_dirs: string[];
    included_extensions: string[];
  };
  files: EnhancedFileData[];
}

export interface EnhancedFileData {
  file_path: string;
  relative_path: string;
  language: string;
  imports: string[];
  exports: string[];
  classes: any[];
  functions: any[];
  variables: string[];
  description: string;
  lines_of_code: number;
  metadata: {
    size_bytes: number;
    last_modified: string;
  };

  analysis_enhanced?: {
    complexity_score: number;
    detected_issues: CodeIssue[];
    semantic_tags: string[];
    needs_ai_summary: boolean;
    priority: "low" | "medium" | "high" | "critical";
    summary_type: "rule-based" | "ai-generated" | "pending";
    code_snippet?: string; // first 2000 chars for context
    full_content?: string; // full content if needed
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
  total_files: number;
  ai_summaries_generated: number;
  rule_based_summaries: number;
  issues_detected: number;
  processing_time_ms: number;
  summary_strategy: "parallel" | "rate-limited" | "chunked" | "batch-api";
}
