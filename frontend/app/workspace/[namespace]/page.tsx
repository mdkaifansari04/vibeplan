"use client";

import DependencyGraphSection from "@/components/container/depedency-graph/dependecy-graph-section";
import PhaseSection from "@/components/container/phase/phase-section";
import React, { useState, useEffect } from "react";
import type { DependencyGraphData } from "@/components/container/depedency-graph/types";

// Sample data structure - replace with actual API call
const sampleDependencyGraphData: DependencyGraphData = {
  nodes: [
    {
      id: "frontend/components/ui/button.tsx",
      type: "file",
      position: { x: 0, y: 0 },
      data: {
        label: "button.tsx",
        language: "typescript",
        functions: 1,
        classes: 0,
        lines: 60,
        fileType: "function",
      },
    },
    {
      id: "frontend/components/ui/card.tsx",
      type: "file",
      position: { x: 0, y: 120 },
      data: {
        label: "card.tsx",
        language: "typescript",
        functions: 7,
        classes: 0,
        lines: 93,
        fileType: "function",
      },
    },
    {
      id: "frontend/components/ui/chart.tsx",
      type: "file",
      position: { x: 0, y: 240 },
      data: {
        label: "chart.tsx",
        language: "typescript",
        functions: 5,
        classes: 0,
        lines: 354,
        fileType: "function",
      },
    },
    {
      id: "frontend/app/page.tsx",
      type: "file",
      position: { x: 300, y: 100 },
      data: {
        label: "page.tsx",
        language: "typescript",
        functions: 1,
        classes: 0,
        lines: 50,
        fileType: "component",
      },
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
    {
      id: "frontend/app/page.tsx->frontend/components/ui/card.tsx",
      source: "frontend/app/page.tsx",
      target: "frontend/components/ui/card.tsx",
      type: "smoothstep",
      animated: false,
    },
  ],
  stats: {
    totalFiles: 120,
    totalDependencies: 36,
    languages: ["markdown", "typescript", "json"],
    entryPoints: ["README.md", "frontend/app/page.tsx"],
  },
};

function Page() {
  const [dependencyData, setDependencyData] = useState(sampleDependencyGraphData);

  // TODO: Replace with actual API call to fetch dependency graph data
  // useEffect(() => {
  //   fetchDependencyGraph().then(data => setDependencyData(data));
  // }, []);

  return (
    <div className="w-full flex gap-5">
      <div className="w-3/4 h-[calc(100vh-4rem)]">
        <DependencyGraphSection data={dependencyData} />
      </div>
      <div className="w-1/4 bg-emerald-100">
        <PhaseSection />
      </div>
    </div>
  );
}

export default Page;
