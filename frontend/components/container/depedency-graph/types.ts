import { Node, Edge, BuiltInNode, BuiltInEdge } from "@xyflow/react";

// Custom node data types
export type FileNodeData = {
  label: string;
  language: string;
  functions: number;
  classes: number;
  lines: number;
  fileType: string;
};

export type FolderNodeData = {
  label: string;
  path: string;
  childCount: number;
  isExpanded?: boolean;
};

// Custom node types
export type FileNode = Node<FileNodeData, "file">;
export type FolderNode = Node<FolderNodeData, "folder">;

// Node union type (includes built-in nodes)
export type AppNode = BuiltInNode | FileNode | FolderNode;

// Edge union type (using built-in edges for now)
export type AppEdge = BuiltInEdge;

export interface DependencyGraphStats {
  totalFiles: number;
  totalDependencies: number;
  languages: string[];
  entryPoints: string[];
}

export interface DependencyGraphData {
  nodes: AppNode[];
  edges: AppEdge[];
  stats: DependencyGraphStats;
}
