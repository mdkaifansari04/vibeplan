import { AnalysisResult } from "../controller/type";
import { DependencyGraph, ReactFlowEdge, ReactFlowNode } from "./types";


export class DependencyGraphService {
  private readonly NODE_WIDTH = 200;
  private readonly NODE_HEIGHT = 80;
  private readonly LEVEL_HEIGHT = 120;
  private readonly NODE_SPACING = 250;

  constructor() {}

  /**
   * Generate a React Flow compatible dependency graph from repository analysis
   */
  generateDependencyGraph(analysisResult: AnalysisResult): DependencyGraph {
    console.log(`Generating dependency graph for ${analysisResult.repo_name}`);

    // Build file dependency map
    const dependencyMap = this.buildDependencyMap(analysisResult);

    // Create nodes for each file
    const nodes = this.createNodes(analysisResult, dependencyMap);

    // Create edges based on dependencies
    const edges = this.createEdges(dependencyMap);

    // Calculate positions using hierarchical layout
    const positionedNodes = this.calculateNodePositions(nodes, edges);

    const stats = this.calculateStats(analysisResult, edges);

    return {
      nodes: positionedNodes,
      edges,
      stats,
    };
  }

  /**
   * Build a map of file dependencies based on imports/exports
   */
  private buildDependencyMap(analysisResult: AnalysisResult): Map<string, Set<string>> {
    const dependencyMap = new Map<string, Set<string>>();
    const fileMap = new Map<string, any>();

    // Create a map of file paths to file data
    analysisResult.files.forEach((file) => {
      fileMap.set(file.file_path, file);
      dependencyMap.set(file.file_path, new Set<string>());
    });

    // Analyze imports to build dependency relationships
    analysisResult.files.forEach((file) => {
      const dependencies = dependencyMap.get(file.file_path)!;

      file.imports.forEach((importPath) => {
        // Try to resolve relative imports
        const resolvedPath = this.resolveImportPath(file.file_path, importPath, fileMap);
        if (resolvedPath && fileMap.has(resolvedPath)) {
          dependencies.add(resolvedPath);
        }
      });
    });

    return dependencyMap;
  }

  /**
   * Resolve relative import paths to actual file paths
   */
  private resolveImportPath(currentFile: string, importPath: string, fileMap: Map<string, any>): string | null {
    // Skip external modules (non-relative imports)
    if (!importPath.startsWith(".")) {
      return null;
    }

    const currentDir = currentFile.split("/").slice(0, -1).join("/");
    let resolvedPath = importPath;

    // Handle relative paths
    if (importPath.startsWith("./")) {
      resolvedPath = currentDir + "/" + importPath.substring(2);
    } else if (importPath.startsWith("../")) {
      const parts = currentDir.split("/");
      const importParts = importPath.split("/");

      // Count how many levels up we go
      let levelsUp = 0;
      for (const part of importParts) {
        if (part === "..") {
          levelsUp++;
        } else {
          break;
        }
      }

      // Remove levels from current path and add remaining import path
      const basePath = parts.slice(0, -levelsUp).join("/");
      const remainingPath = importParts.slice(levelsUp).join("/");
      resolvedPath = basePath + "/" + remainingPath;
    }

    // Try common file extensions
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];
    for (const ext of extensions) {
      const pathWithExt = resolvedPath + ext;
      if (fileMap.has(pathWithExt)) {
        return pathWithExt;
      }

      // Try index files
      const indexPath = resolvedPath + "/index" + ext;
      if (fileMap.has(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  /**
   * Create React Flow nodes from file data
   */
  private createNodes(analysisResult: AnalysisResult, dependencyMap: Map<string, Set<string>>): ReactFlowNode[] {
    const nodes: ReactFlowNode[] = [];

    analysisResult.files.forEach((file) => {
      const fileName = file.file_path.split("/").pop() || file.file_path;
      const isEntryPoint = this.isEntryPoint(file.file_path, dependencyMap);

      const node: ReactFlowNode = {
        id: file.file_path,
        type: isEntryPoint ? "input" : "default",
        position: { x: 0, y: 0 }, // Will be calculated later
        data: {
          label: fileName,
          language: file.language,
          functions: file.functions.length,
          classes: file.classes.length,
          lines: file.lines_of_code,
          fileType: this.getFileType(file),
        },
        sourcePosition: "right",
        targetPosition: "left",
      };

      nodes.push(node);
    });

    return nodes;
  }

  /**
   * Determine if a file is an entry point (not imported by others)
   */
  private isEntryPoint(filePath: string, dependencyMap: Map<string, Set<string>>): boolean {
    for (const [, dependencies] of dependencyMap) {
      if (dependencies.has(filePath)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine file type for styling
   */
  private getFileType(file: any): string {
    if (file.language === "typescript" || file.language === "javascript") {
      if (file.classes.length > 0) return "class";
      if (file.functions.length > 0) return "function";
      return "module";
    }

    if (file.language === "json") return "config";
    if (file.language === "markdown") return "documentation";
    if (file.language === "yaml") return "config";

    return "file";
  }

  /**
   * Create React Flow edges from dependency map
   */
  private createEdges(dependencyMap: Map<string, Set<string>>): ReactFlowEdge[] {
    const edges: ReactFlowEdge[] = [];

    dependencyMap.forEach((dependencies, sourceFile) => {
      dependencies.forEach((targetFile) => {
        const edge: ReactFlowEdge = {
          id: `${sourceFile}->${targetFile}`,
          source: sourceFile,
          target: targetFile,
          type: "smoothstep",
          animated: false,
        };

        edges.push(edge);
      });
    });

    return edges;
  }

  /**
   * Calculate hierarchical positions for nodes
   */
  private calculateNodePositions(nodes: ReactFlowNode[], edges: ReactFlowEdge[]): ReactFlowNode[] {
    // Build adjacency list for topological sorting
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize
    nodes.forEach((node) => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build graph
    edges.forEach((edge) => {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Topological sort to determine levels
    const levels: string[][] = [];
    const queue: string[] = [];

    // Start with nodes that have no incoming edges
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const currentLevel: string[] = [...queue];
      levels.push(currentLevel);
      queue.length = 0;

      currentLevel.forEach((nodeId) => {
        adjacencyList.get(nodeId)?.forEach((neighbor) => {
          const newDegree = (inDegree.get(neighbor) || 0) - 1;
          inDegree.set(neighbor, newDegree);

          if (newDegree === 0) {
            queue.push(neighbor);
          }
        });
      });
    }

    // Position nodes based on levels
    const positionedNodes = nodes.map((node) => {
      const levelIndex = levels.findIndex((level) => level.includes(node.id));
      const positionInLevel = levels[levelIndex]?.indexOf(node.id) || 0;
      const levelSize = levels[levelIndex]?.length || 1;

      // Calculate positions
      const x = levelIndex * this.NODE_SPACING;
      const y = (positionInLevel - (levelSize - 1) / 2) * this.LEVEL_HEIGHT;

      return {
        ...node,
        position: { x, y },
      };
    });

    return positionedNodes;
  }

  /**
   * Calculate statistics for the dependency graph
   */
  private calculateStats(analysisResult: AnalysisResult, edges: ReactFlowEdge[]) {
    const languages = [...new Set(analysisResult.files.map((f) => f.language))];
    const entryPoints = analysisResult.files.filter((file) => !edges.some((edge) => edge.target === file.file_path)).map((file) => file.file_path);

    return {
      totalFiles: analysisResult.files.length,
      totalDependencies: edges.length,
      languages,
      entryPoints,
    };
  }
}
