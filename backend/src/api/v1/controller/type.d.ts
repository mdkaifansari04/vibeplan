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
  files: Array<{
    file_path: string;
    relative_path: string;
    language: string;
    imports: string[];
    exports: string[];
    classes: Array<{
      name: string;
      methods: string[];
      properties: string[];
      isExported: boolean;
    }>;
    functions: Array<{
      name: string;
      parameters: string[];
      returnType: string;
      isAsync: boolean;
      isExported: boolean;
    }>;
    variables: string[];
    description: string;
    lines_of_code: number;
    metadata: {
      size_bytes: number;
      last_modified: string;
    };
  }>;
}
