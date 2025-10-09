import { transformToCleanGraph, GraphPresets } from "@/lib/graph-transform";
import type { DependencyGraphData } from "@/components/container/depedency-graph/types";
import { Position } from "@xyflow/react";

export default function GraphTransformTestComponent() {
  // Test with sample data similar to your structure
  const testData: DependencyGraphData = {
    nodes: [
      {
        id: "README.md",
        type: "file",
        position: { x: 0, y: -5580 },
        data: {
          label: "README.md",
          language: "markdown",
          functions: 0,
          classes: 0,
          lines: 206,
          fileType: "documentation",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "frontend/components/ui/button.tsx",
        type: "file",
        position: { x: 0, y: 0 },
        data: {
          label: "button.tsx",
          language: "typescript",
          functions: 5,
          classes: 0,
          lines: 120,
          fileType: "component",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
      {
        id: "frontend/app/page.tsx",
        type: "file",
        position: { x: 300, y: 100 },
        data: {
          label: "page.tsx",
          language: "typescript",
          functions: 2,
          classes: 0,
          lines: 80,
          fileType: "component",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    ],
    edges: [
      {
        id: "frontend/app/page.tsx->frontend/components/ui/button.tsx",
        source: "frontend/app/page.tsx",
        target: "frontend/components/ui/button.tsx",
        type: "smoothstep",
        animated: false,
      },
    ],
    stats: {
      totalFiles: 3,
      totalDependencies: 1,
      languages: ["typescript", "markdown"],
      entryPoints: ["frontend/app/page.tsx"],
    },
  };

  const testTransformations = () => {
    console.log("=== Original Data ===");
    console.log("Nodes:", testData.nodes.length);
    console.log("Edges:", testData.edges.length);

    console.log("\n=== Overview Preset ===");
    const overview = GraphPresets.overview(testData);
    console.log("Nodes:", overview.nodes.length);
    console.log("Edges:", overview.edges.length);
    console.log(
      "Filtered nodes:",
      overview.nodes.map((n) => ({ id: n.id, type: n.type }))
    );

    console.log("\n=== Minimal Preset ===");
    const minimal = GraphPresets.minimal(testData);
    console.log("Nodes:", minimal.nodes.length);
    console.log("Edges:", minimal.edges.length);

    console.log("\n=== Folders Preset ===");
    const folders = GraphPresets.folders(testData);
    console.log("Nodes:", folders.nodes.length);
    console.log("Edges:", folders.edges.length);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Graph Transform Test</h2>

      <div className="space-y-4">
        <button onClick={testTransformations} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Test All Transformations
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-400">Check the browser console for transformation results</div>

        <div className="border rounded p-4 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-2">Available View Modes:</h3>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Overview:</strong> Shows folders and important files (2+ connections)
            </li>
            <li>
              <strong>Detailed:</strong> Shows individual files with connections
            </li>
            <li>
              <strong>Folders:</strong> Groups files by folder structure
            </li>
            <li>
              <strong>Minimal:</strong> Shows only highly connected files (3+ connections)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
