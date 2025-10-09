"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, BackgroundVariant, Panel, type NodeTypes, type OnNodesChange, type OnEdgesChange, type ColorMode } from "@xyflow/react";
import { useTheme } from "next-themes";

import "@xyflow/react/dist/style.css";
import "./index.css";

import FileNode from "./file-node";
import FolderNode from "./folder-node";
import type { AppNode, AppEdge, DependencyGraphData } from "./types";

// Node types configuration with proper typing
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

  // Use provided data or empty arrays
  const initialNodes = useMemo(() => data?.nodes || [], [data?.nodes]);
  const initialEdges = useMemo(() => data?.edges || [], [data?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);

  // Update nodes and edges when data changes
  React.useEffect(() => {
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

  // Determine color mode based on next-themes
  const colorMode: ColorMode = theme === "dark" ? "dark" : theme === "light" ? "light" : "system";

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };
  return (
    <div className="w-full h-full rounded-xl">
      <ReactFlow<AppNode, AppEdge> nodes={nodes} colorMode={colorMode} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView attributionPosition="bottom-right" nodesDraggable={false} nodesConnectable={false} elementsSelectable={true} zoomOnScroll={true} panOnScroll={false} minZoom={0.1} maxZoom={2}>
        <Background color={colorMode === "dark" ? "#2d3748" : "#e2e8f0"} variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap nodeClassName={nodeClassName} zoomable pannable className={`border rounded-lg ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"}`} />

        {/* Theme Selector Panel */}
        <Panel position="top-right" className={`rounded-lg border ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
          <select value={theme} onChange={handleThemeChange} className={`px-3 py-1 rounded text-sm border-none outline-none ${colorMode === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </Panel>

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
