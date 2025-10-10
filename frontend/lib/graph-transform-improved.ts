import type { AppNode, AppEdge, DependencyGraphData, DependencyGraphStats, FileNodeData, FolderNodeData } from "@/components/container/depedency-graph/types";

function debugData(label: string, nodes: AppNode[], edges: AppEdge[]) {
  console.log(`[${label}]`, {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    sampleNode: nodes[0],
    sampleEdge: edges[0],
  });
}

function applyIntelligentLayout(nodes: AppNode[], edges: AppEdge[], direction: "LR" | "TB" = "LR"): { nodes: AppNode[]; edges: AppEdge[] } {
  if (nodes.length === 0) {
    console.warn("No nodes to layout");
    return { nodes: [], edges: [] };
  }

  const nodeSpacing = { x: 300, y: 150 };
  const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));

  const layoutedNodes = nodes.map((node, index) => {
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;

    return {
      ...node,
      position: {
        x: col * nodeSpacing.x,
        y: row * nodeSpacing.y,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

/**
 * Calculate stats for transformed data
 */
function calculateStats(nodes: AppNode[], edges: AppEdge[], originalData?: DependencyGraphData): DependencyGraphStats {
  const languages = new Set<string>();
  const entryPoints: string[] = [];

  const targetNodes = new Set(edges.map((e) => e.target));

  nodes.forEach((node) => {
    if (node.type === "file" && "language" in node.data) {
      const fileData = node.data as FileNodeData;
      languages.add(fileData.language);

      const hasOutgoing = edges.some((e) => e.source === node.id);
      const hasIncoming = targetNodes.has(node.id);

      if (hasOutgoing && !hasIncoming) {
        entryPoints.push(node.id);
      }
    }
  });

  return {
    totalFiles: nodes.length,
    totalDependencies: edges.length,
    languages: Array.from(languages),
    entryPoints,
  };
}

/**
 * Quick preset transformations with robust fallbacks
 */
export const GraphPresets = {
  /**
   * OVERVIEW: Show only connected files (files with at least one dependency)
   * This is the most useful default view
   */
  overview: (data: DependencyGraphData) => {
    console.log("Overview transform - Input:", {
      nodes: data.nodes.length,
      edges: data.edges.length,
    });

    if (!data.edges || data.edges.length === 0) {
      console.warn("No edges found - showing all nodes");
      const limitedNodes = data.nodes.slice(0, 50);
      return {
        nodes: limitedNodes,
        edges: [],
        stats: calculateStats(limitedNodes, [], data),
      };
    }

    const connectedIds = new Set<string>();
    data.edges.forEach((edge) => {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    });

    console.log("Connected IDs:", connectedIds.size);

    const connectedNodes = data.nodes.filter((node) => connectedIds.has(node.id));

    console.log("Connected nodes:", connectedNodes.length);

    if (connectedNodes.length === 0) {
      console.error("No connected nodes found! Falling back to all nodes");
      const fallbackNodes = data.nodes.slice(0, 50);
      return {
        nodes: fallbackNodes,
        edges: data.edges,
        stats: calculateStats(fallbackNodes, data.edges, data),
      };
    }

    const layouted = applyIntelligentLayout(connectedNodes, data.edges);
    const stats = calculateStats(layouted.nodes, layouted.edges, data);

    debugData("Overview result", layouted.nodes, layouted.edges);

    return {
      ...layouted,
      stats,
    };
  },

  /**
   * DETAILED: Show more nodes, including important ones without direct dependencies
   */
  detailed: (data: DependencyGraphData) => {
    console.log("Detailed transform - Input:", {
      nodes: data.nodes.length,
      edges: data.edges.length,
    });

    const connectedIds = new Set<string>();
    data.edges.forEach((edge) => {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    });

    const importantNodes = data.nodes.filter((node) => {
      if (connectedIds.has(node.id)) return true;

      const path = node.id.toLowerCase();
      const fileData = node.type === "file" && "lines" in node.data ? (node.data as FileNodeData) : null;

      return path.includes("index") || path.includes("main") || path.includes("app") || path.includes("config") || path.endsWith(".config.ts") || path.endsWith(".config.js") || (fileData && fileData.lines && fileData.lines > 100);
    });

    console.log("Detailed nodes:", importantNodes.length);

    const limitedNodes = importantNodes.slice(0, 80);
    const limitedNodeIds = new Set(limitedNodes.map((n) => n.id));

    const relevantEdges = data.edges.filter((edge) => limitedNodeIds.has(edge.source) && limitedNodeIds.has(edge.target));

    const layouted = applyIntelligentLayout(limitedNodes, relevantEdges);
    const stats = calculateStats(layouted.nodes, layouted.edges, data);

    return {
      ...layouted,
      stats,
    };
  },

  /**
   * FOLDERS: Group by folder structure
   */
  folders: (data: DependencyGraphData) => {
    console.log("Folders transform - Input:", {
      nodes: data.nodes.length,
      edges: data.edges.length,
    });

    const folderMap = new Map<string, AppNode[]>();

    data.nodes.forEach((node) => {
      const pathParts = node.id.split("/");
      const folderPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "root";

      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, []);
      }
      folderMap.get(folderPath)!.push(node);
    });

    console.log("Folders found:", folderMap.size);

    const folderNodes: AppNode[] = [];
    const folderEdgeMap = new Map<string, Set<string>>();

    Array.from(folderMap.entries()).forEach(([folderPath, files]) => {
      const folderName = folderPath.split("/").pop() || "root";
      const totalLines = files.reduce((sum, f) => {
        const fileData = f.type === "file" && "lines" in f.data ? (f.data as FileNodeData) : null;
        return sum + (fileData?.lines || 0);
      }, 0);

      folderNodes.push({
        id: folderPath,
        type: "folder",
        position: { x: 0, y: 0 },
        data: {
          label: folderName,
          path: folderPath,
          childCount: files.length,
          isExpanded: true,
        },
      });
    });

    data.edges.forEach((edge) => {
      const sourceParts = edge.source.split("/");
      const targetParts = edge.target.split("/");

      const sourceFolder = sourceParts.length > 1 ? sourceParts.slice(0, -1).join("/") : "root";
      const targetFolder = targetParts.length > 1 ? targetParts.slice(0, -1).join("/") : "root";

      if (sourceFolder !== targetFolder) {
        if (!folderEdgeMap.has(sourceFolder)) {
          folderEdgeMap.set(sourceFolder, new Set());
        }
        folderEdgeMap.get(sourceFolder)!.add(targetFolder);
      }
    });

    const folderEdges: AppEdge[] = [];
    folderEdgeMap.forEach((targets, source) => {
      targets.forEach((target) => {
        const edgeCount = data.edges.filter((e) => e.source.startsWith(source + "/") && e.target.startsWith(target + "/")).length;

        folderEdges.push({
          id: `${source}->${target}`,
          source,
          target,
          type: "smoothstep",
          animated: false,
          label: `${edgeCount}`,
        });
      });
    });

    console.log("Folder nodes:", folderNodes.length);
    console.log("Folder edges:", folderEdges.length);

    if (folderNodes.length === 0) {
      console.warn("No folders created, falling back to overview");
      return GraphPresets.overview(data);
    }

    const layouted = applyIntelligentLayout(folderNodes, folderEdges);
    const stats = calculateStats(layouted.nodes, layouted.edges, data);

    return {
      ...layouted,
      stats,
    };
  },

  /**
   * MINIMAL: Show only entry points and their immediate dependencies
   */
  minimal: (data: DependencyGraphData) => {
    console.log("Minimal transform - Input:", {
      nodes: data.nodes.length,
      edges: data.edges.length,
    });

    if (data.edges.length === 0) {
      const limitedNodes = data.nodes.slice(0, 20);
      return {
        nodes: limitedNodes,
        edges: [],
        stats: calculateStats(limitedNodes, [], data),
      };
    }

    const targetNodes = new Set(data.edges.map((e) => e.target));
    const entryPoints = data.nodes.filter((node) => {
      const hasOutgoing = data.edges.some((e) => e.source === node.id);
      const hasIncoming = targetNodes.has(node.id);
      return hasOutgoing && !hasIncoming;
    });

    console.log("Entry points found:", entryPoints.length);

    let selectedNodes: AppNode[];
    if (entryPoints.length === 0) {
      const outgoingCount = new Map<string, number>();
      data.edges.forEach((edge) => {
        outgoingCount.set(edge.source, (outgoingCount.get(edge.source) || 0) + 1);
      });

      selectedNodes = data.nodes
        .map((node) => ({
          node,
          count: outgoingCount.get(node.id) || 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
        .map((item) => item.node);
    } else {
      const immediateIds = new Set<string>();
      entryPoints.forEach((ep) => {
        immediateIds.add(ep.id);
        data.edges.filter((e) => e.source === ep.id).forEach((e) => immediateIds.add(e.target));
      });

      selectedNodes = data.nodes.filter((node) => immediateIds.has(node.id));
    }

    selectedNodes = selectedNodes.slice(0, 25);
    const selectedIds = new Set(selectedNodes.map((n) => n.id));

    const relevantEdges = data.edges.filter((edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target));

    console.log("Minimal nodes:", selectedNodes.length);
    console.log("Minimal edges:", relevantEdges.length);

    const layouted = applyIntelligentLayout(selectedNodes, relevantEdges);
    const stats = calculateStats(layouted.nodes, layouted.edges, data);

    return {
      ...layouted,
      stats,
    };
  },
};

export function transformToCleanGraph(rawData: DependencyGraphData): DependencyGraphData {
  return GraphPresets.overview(rawData);
}
