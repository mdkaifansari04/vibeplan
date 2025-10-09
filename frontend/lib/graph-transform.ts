import type { AppNode, AppEdge, DependencyGraphData, DependencyGraphStats, FileNodeData, FolderNodeData } from "@/components/container/depedency-graph/types";

export interface GraphTransformOptions {
  // Hierarchy options
  groupByFolders: boolean;
  maxFolderDepth: number;
  showOnlyImportantFiles: boolean;

  // Layout options
  nodeSpacing: { x: number; y: number };
  levelSpacing: number;

  // Filtering options
  minConnections: number; // Only show files with at least N connections
  excludeFileTypes: string[];
  includeOnlyFileTypes?: string[];

  // Visual options
  showStats: boolean;
  compactMode: boolean;
}

export const defaultTransformOptions: GraphTransformOptions = {
  groupByFolders: true,
  maxFolderDepth: 2,
  showOnlyImportantFiles: true,
  nodeSpacing: { x: 300, y: 150 },
  levelSpacing: 200,
  minConnections: 1,
  excludeFileTypes: ["documentation", "config"],
  showStats: true,
  compactMode: false,
};

/**
 * Transform raw dependency data into a clean, hierarchical graph
 */
export function transformToCleanGraph(rawData: DependencyGraphData, options: Partial<GraphTransformOptions> = {}): DependencyGraphData {
  const opts = { ...defaultTransformOptions, ...options };

  // Step 1: Filter and categorize nodes
  const filteredNodes = filterImportantNodes(rawData.nodes, rawData.edges, opts);

  // Step 2: Create folder hierarchy if enabled
  const hierarchicalNodes = opts.groupByFolders ? createFolderHierarchy(filteredNodes, opts) : filteredNodes;

  // Step 3: Apply intelligent layout
  const layoutNodes = applyIntelligentLayout(hierarchicalNodes, rawData.edges, opts);

  // Step 4: Filter and clean edges
  const cleanEdges = filterAndCleanEdges(rawData.edges, layoutNodes, opts);

  // Step 5: Update stats
  const updatedStats = updateStats(rawData.stats, layoutNodes, cleanEdges);

  return {
    nodes: layoutNodes,
    edges: cleanEdges,
    stats: updatedStats,
  };
}

/**
 * Filter nodes to show only important/connected files
 */
function filterImportantNodes(nodes: AppNode[], edges: AppEdge[], options: GraphTransformOptions): AppNode[] {
  // Count connections for each node
  const connectionCount = new Map<string, number>();

  edges.forEach((edge) => {
    connectionCount.set(edge.source, (connectionCount.get(edge.source) || 0) + 1);
    connectionCount.set(edge.target, (connectionCount.get(edge.target) || 0) + 1);
  });

  return nodes.filter((node) => {
    // Type guard to check if this is a FileNode
    const isFileNode = node.type === "file" && "fileType" in node.data;
    const isFolderNode = node.type === "folder" && "path" in node.data;

    // Skip built-in nodes that don't have our custom data
    if (!isFileNode && !isFolderNode) return false;

    // Filter by file type (only for file nodes)
    if (isFileNode) {
      const fileData = node.data as FileNodeData;
      if (options.excludeFileTypes.includes(fileData.fileType)) return false;
      if (options.includeOnlyFileTypes && !options.includeOnlyFileTypes.includes(fileData.fileType)) return false;
    }

    // Filter by connections
    const connections = connectionCount.get(node.id) || 0;
    if (connections < options.minConnections) return false;

    // If showing only important files, prioritize entry points and highly connected files
    if (options.showOnlyImportantFiles) {
      if (isFileNode) {
        const fileData = node.data as FileNodeData;
        const isEntryPoint = fileData.fileType === "component" || node.id.includes("page.") || node.id.includes("index.");
        const isHighlyConnected = connections >= 3;
        const isImportantFile = fileData.functions > 5 || fileData.lines > 100;

        return isEntryPoint || isHighlyConnected || isImportantFile;
      } else if (isFolderNode) {
        // Always keep folder nodes if they have connections
        return connections >= 1;
      }
    }

    return true;
  });
}

/**
 * Create folder hierarchy and group related files
 */
function createFolderHierarchy(nodes: AppNode[], options: GraphTransformOptions): AppNode[] {
  const folderMap = new Map<string, AppNode[]>();
  const folderNodes: AppNode[] = [];
  const fileNodes: AppNode[] = [];

  // Group files by folder
  nodes.forEach((node) => {
    const pathParts = node.id.split("/");
    if (pathParts.length > 1) {
      const folderPath = pathParts.slice(0, Math.min(pathParts.length - 1, options.maxFolderDepth)).join("/");

      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, []);

        // Create folder node
        const folderNode: AppNode = {
          id: `folder-${folderPath}`,
          type: "folder",
          position: { x: 0, y: 0 },
          data: {
            label: pathParts[pathParts.length - 2] || folderPath,
            path: folderPath,
            childCount: 0,
            isExpanded: true,
          },
        };
        folderNodes.push(folderNode);
      }

      folderMap.get(folderPath)!.push(node);
    } else {
      fileNodes.push(node);
    }
  });

  // Update folder child counts
  folderNodes.forEach((folder) => {
    const folderData = folder.data as FolderNodeData;
    const folderPath = folderData.path;
    const children = folderMap.get(folderPath) || [];
    folderData.childCount = children.length;
  });

  // Return only important folders (with multiple files) and standalone files
  const importantFolders = folderNodes.filter((folder) => {
    const folderData = folder.data as FolderNodeData;
    return folderData.childCount >= 2;
  });
  const representativeFiles = Array.from(folderMap.entries())
    .filter(([folderPath, files]) => {
      const hasFolder = importantFolders.some((f) => {
        const folderData = f.data as FolderNodeData;
        return folderData.path === folderPath;
      });
      return !hasFolder && files.length > 0;
    })
    .map(([, files]) => {
      // Pick the most important file from each small folder
      return files.reduce((best, current) => {
        const bestData = best.data as FileNodeData;
        const currentData = current.data as FileNodeData;
        return currentData.functions + currentData.lines > bestData.functions + bestData.lines ? current : best;
      });
    });

  return [...importantFolders, ...representativeFiles, ...fileNodes];
}

/**
 * Apply intelligent layout algorithm
 */
function applyIntelligentLayout(nodes: AppNode[], edges: AppEdge[], options: GraphTransformOptions): AppNode[] {
  // Categorize nodes by type and importance
  const entryPoints = nodes.filter((n) => {
    if (n.type === "file" && "fileType" in n.data) {
      const fileData = n.data as FileNodeData;
      return fileData.fileType === "component" || n.id.includes("page.");
    }
    return false;
  });

  const components = nodes.filter((n) => {
    if (n.type === "folder") return true;
    if (n.type === "file" && "fileType" in n.data) {
      const fileData = n.data as FileNodeData;
      return fileData.fileType === "function";
    }
    return false;
  });

  const utilities = nodes.filter((n) => !entryPoints.includes(n) && !components.includes(n));

  const layoutNodes: AppNode[] = [];
  let currentY = 0;

  // Layout entry points at the top
  entryPoints.forEach((node, index) => {
    layoutNodes.push({
      ...node,
      position: {
        x: index * options.nodeSpacing.x,
        y: currentY,
      },
    });
  });

  currentY += options.levelSpacing;

  // Layout main components in the middle
  const componentsPerRow = Math.ceil(Math.sqrt(components.length));
  components.forEach((node, index) => {
    const row = Math.floor(index / componentsPerRow);
    const col = index % componentsPerRow;

    layoutNodes.push({
      ...node,
      position: {
        x: col * options.nodeSpacing.x,
        y: currentY + row * options.nodeSpacing.y,
      },
    });
  });

  currentY += Math.ceil(components.length / componentsPerRow) * options.nodeSpacing.y + options.levelSpacing;

  // Layout utilities at the bottom
  const utilitiesPerRow = Math.ceil(Math.sqrt(utilities.length));
  utilities.forEach((node, index) => {
    const row = Math.floor(index / utilitiesPerRow);
    const col = index % utilitiesPerRow;

    layoutNodes.push({
      ...node,
      position: {
        x: col * options.nodeSpacing.x,
        y: currentY + row * options.nodeSpacing.y,
      },
    });
  });

  return layoutNodes;
}

/**
 * Filter and clean edges to only show relevant connections
 */
function filterAndCleanEdges(edges: AppEdge[], nodes: AppNode[], options: GraphTransformOptions): AppEdge[] {
  const nodeIds = new Set(nodes.map((n) => n.id));

  return edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .filter((edge) => edge.source !== edge.target) // Remove self-references
    .map((edge) => ({
      ...edge,
      type: "smoothstep" as const,
      animated: false,
      style: { strokeWidth: 2 },
    })) as AppEdge[];
}

/**
 * Update stats based on filtered data
 */
function updateStats(originalStats: DependencyGraphStats, nodes: AppNode[], edges: AppEdge[]): DependencyGraphStats {
  const languages = new Set<string>();
  const entryPoints: string[] = [];

  nodes.forEach((node) => {
    if (node.type === "file" && "language" in node.data) {
      const fileData = node.data as FileNodeData;
      languages.add(fileData.language);

      if (fileData.fileType === "component" || node.id.includes("page.")) {
        entryPoints.push(node.id);
      }
    }
  });

  return {
    totalFiles: nodes.length,
    totalDependencies: edges.length,
    languages: Array.from(languages),
    entryPoints: entryPoints.slice(0, 5), // Limit to top 5
  };
}

/**
 * Quick preset transformations
 */
export const GraphPresets = {
  overview: (data: DependencyGraphData) =>
    transformToCleanGraph(data, {
      groupByFolders: true,
      maxFolderDepth: 2,
      showOnlyImportantFiles: true,
      minConnections: 2,
      excludeFileTypes: ["documentation", "config", "test"],
    }),

  detailed: (data: DependencyGraphData) =>
    transformToCleanGraph(data, {
      groupByFolders: false,
      showOnlyImportantFiles: true,
      minConnections: 1,
      excludeFileTypes: ["documentation"],
      nodeSpacing: { x: 250, y: 120 },
    }),

  folders: (data: DependencyGraphData) =>
    transformToCleanGraph(data, {
      groupByFolders: true,
      maxFolderDepth: 1,
      showOnlyImportantFiles: false,
      minConnections: 0,
      includeOnlyFileTypes: ["component", "function"],
    }),

  minimal: (data: DependencyGraphData) =>
    transformToCleanGraph(data, {
      groupByFolders: true,
      maxFolderDepth: 1,
      showOnlyImportantFiles: true,
      minConnections: 3,
      excludeFileTypes: ["documentation", "config", "test", "style"],
      compactMode: true,
    }),
};
