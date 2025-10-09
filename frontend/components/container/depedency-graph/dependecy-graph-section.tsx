"use client";

import React, { useCallback, useMemo, useEffect, useState } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, BackgroundVariant, Panel, type NodeTypes, type ColorMode } from "@xyflow/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/liquid-glass-button";
import { GraphPresets } from "@/lib/graph-transform";
import "./index.css";
import "@xyflow/react/dist/style.css";

import FileNode from "./file-node";
import FolderNode from "./folder-node";
import type { AppNode, AppEdge, DependencyGraphData } from "./types";

// Node types configuration
const nodeTypes: NodeTypes = {
  file: FileNode,
  folder: FolderNode,
  input: FileNode,
  default: FileNode,
  output: FileNode,
};

interface DependencyGraphSectionProps {
  data?: DependencyGraphData;
}

type ViewMode = "overview" | "detailed" | "folders" | "minimal";

function DependencyGraphSection({ data }: DependencyGraphSectionProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // Transform data based on selected view mode
  const transformedData = useMemo(() => {
    if (!data) return null;

    switch (viewMode) {
      case "overview":
        return GraphPresets.overview(data);
      case "detailed":
        return GraphPresets.detailed(data);
      case "folders":
        return GraphPresets.folders(data);
      case "minimal":
        return GraphPresets.minimal(data);
      default:
        return data;
    }
  }, [data, viewMode]);

  const initialNodes = useMemo(() => transformedData?.nodes || [], [transformedData?.nodes]);
  const initialEdges = useMemo(() => transformedData?.edges || [], [transformedData?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (transformedData?.nodes) {
      setNodes(transformedData.nodes);
    }
    if (transformedData?.edges) {
      setEdges(transformedData.edges);
    }
  }, [transformedData, setNodes, setEdges]);

  const nodeClassName = useCallback((node: AppNode) => {
    return node.type || "default";
  }, []);

  const colorMode: ColorMode = useMemo(() => {
    if (!mounted) return "light";
    return theme === "dark" ? "dark" : "light";
  }, [theme, mounted]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };

  // Toggle lock function
  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full h-full rounded-xl flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <p className="text-neutral-500">Loading graph...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl">
      <ReactFlow<AppNode, AppEdge> nodes={nodes} colorMode={colorMode} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} className="rounded-xl" fitView attributionPosition="bottom-right" nodesDraggable={!isLocked} nodesConnectable={false} elementsSelectable={true} zoomOnScroll={true} panOnScroll={false} panOnDrag={true} minZoom={0.1} maxZoom={2}>
        <Background color={colorMode === "dark" ? "#374151" : "#d1d5db"} variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap nodeClassName={nodeClassName} zoomable pannable className={`border rounded-lg ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"}`} />

        {/* View Mode Selector Panel */}
        <Panel position="top-left" className={`p-3 rounded-lg border shadow-sm ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
          <div className="space-y-2">
            <h4 className={`text-xs font-medium ${colorMode === "dark" ? "text-gray-200" : "text-gray-700"}`}>View Mode</h4>
            <div className="flex flex-wrap gap-1">
              {(["overview", "detailed", "folders", "minimal"] as ViewMode[]).map((mode) => (
                <Button key={mode} size="sm" onClick={() => handleViewModeChange(mode)} className={`text-xs px-2 py-1 capitalize transition-all ${viewMode === mode ? (colorMode === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white") : colorMode === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {mode}
                </Button>
              ))}
            </div>
          </div>
        </Panel>

        {/* Theme Selector Panel */}
        <Panel position="top-right" className={`rounded-lg border shadow-sm ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
          <select value={theme} onChange={handleThemeChange} className={`px-3 py-2 rounded text-sm border-none outline-none cursor-pointer ${colorMode === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Panel>

        {/* Lock/Unlock Toggle Button */}
        <Panel position="bottom-right" className={`rounded-lg border shadow-sm ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
          <button onClick={toggleLock} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${isLocked ? (colorMode === "dark" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600") : colorMode === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            {isLocked ? "🔒 Locked" : "🔓 Unlocked"}
          </button>
        </Panel>

        {/* Stats Panel */}
        {transformedData?.stats && (
          <Panel position="bottom-left" className={`p-4 rounded-lg shadow-lg border ${colorMode === "dark" ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
            <h3 className={`font-bold text-sm mb-2 ${colorMode === "dark" ? "text-gray-100" : "text-gray-800"}`}>Graph Stats ({viewMode})</h3>
            <div className={`space-y-1 text-xs ${colorMode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              <div>
                <strong>Nodes:</strong> {transformedData.stats.totalFiles}
              </div>
              <div>
                <strong>Edges:</strong> {transformedData.stats.totalDependencies}
              </div>
              <div>
                <strong>Languages:</strong> {transformedData.stats.languages.slice(0, 3).join(", ")}
                {transformedData.stats.languages.length > 3 && "..."}
              </div>
              {transformedData.stats.entryPoints.length > 0 && (
                <div>
                  <strong>Entry Points:</strong> {transformedData.stats.entryPoints.length}
                </div>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default DependencyGraphSection;
