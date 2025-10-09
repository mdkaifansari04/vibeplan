"use client";

import React, { useCallback, useMemo, useEffect, useState } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, BackgroundVariant, Panel, type NodeTypes, type ColorMode } from "@xyflow/react";
import { useTheme } from "next-themes";
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

function DependencyGraphSection({ data }: DependencyGraphSectionProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const initialNodes = useMemo(() => data?.nodes || [], [data?.nodes]);
  const initialEdges = useMemo(() => data?.edges || [], [data?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data?.nodes) {
      setNodes(data.nodes);
    }
    if (data?.edges) {
      setEdges(data.edges);
    }
  }, [data, setNodes, setEdges]);

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

  // FIX 5: Toggle lock function
  const toggleLock = () => {
    setIsLocked((prev) => !prev);
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

        {/* Theme Selector Panel */}
        <Panel position="top-right" className={`rounded-lg border shadow-sm ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
          <select value={theme} onChange={handleThemeChange} className={`px-3 py-2 rounded text-sm border-none outline-none cursor-pointer ${colorMode === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Panel>

        {/* FIX 7: Lock/Unlock Toggle Button */}
        <Panel position="bottom-right" className={`rounded-lg border shadow-sm ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
          <button onClick={toggleLock} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${isLocked ? (colorMode === "dark" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600") : colorMode === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            {isLocked ? "🔒 Locked" : "🔓 Unlocked"}
          </button>
        </Panel>

        {/* Stats Panel */}
        {data?.stats && (
          <Panel position="top-left" className={`p-4 rounded-lg shadow-lg border ${colorMode === "dark" ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
            <h3 className={`font-bold text-sm mb-2 ${colorMode === "dark" ? "text-gray-100" : "text-gray-800"}`}>Repository Stats</h3>
            <div className={`space-y-1 text-xs ${colorMode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              <div>
                <strong>Total Files:</strong> {data.stats.totalFiles}
              </div>
              <div>
                <strong>Dependencies:</strong> {data.stats.totalDependencies}
              </div>
              <div>
                <strong>Languages:</strong> {data.stats.languages.join(", ")}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export default DependencyGraphSection;
