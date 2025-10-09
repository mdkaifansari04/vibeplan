"use client";

import DependencyGraphSection from "@/components/container/depedency-graph/dependecy-graph-section";
import { PhaseSidebar } from "@/components/container/phase/phase-section";
import React, { useState, useEffect } from "react";
import type { DependencyGraphData } from "@/components/container/depedency-graph/types";

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

const demoPhases = [
  {
    id: "phase-04",
    title: "Integrate Priority Indicator in Job List Items",
    description: "- Extend job list item component to show priority badge\n- Apply color coding based on priority enum values\n- Ensure accessibility with appropriate ARIA labels\n- Update styling to accommodate new badge\n- Add visual regression tests for badge appearance",
    relevantFiles: [],
    dependencies: ["phase-03"],
    estimatedComplexity: "low",
    priority: "medium",
    category: "improvement",
    reasoning: "Visual cues help users quickly identify high‑priority jobs, enhancing usability.",
  },
  {
    id: "phase-05",
    title: "Add Job Filtering by Priority",
    description: "- Add filter controls\n- URL persists selected filters\n- Unit tests for filtering logic",
    relevantFiles: [],
    dependencies: ["phase-04"],
    estimatedComplexity: "medium",
    priority: "high",
    category: "feature",
  },
  {
    id: "phase-06",
    title: "Persist Priority to DB",
    description: "- Add column to jobs table\n- Map enum to string column\n- Backfill defaults",
    relevantFiles: [],
    dependencies: ["phase-05"],
    estimatedComplexity: "high",
    priority: "critical",
    category: "data",
  },
] as const;

const demoPlans = [
  {
    phaseId: "phase-04",
    data: {
      instruction: "Create a TypeScript enum for priority levels, extend the job model, and add tests.",
      plan: "# Implementation Plan...\n...details omitted for brevity...",
    },
  },
  {
    phaseId: "phase-04",
    data: {
      instruction: "Integrate small badge in list item component, add ARIA labels, update styles.",
      plan: "...\n",
    },
  },
  {
    phaseId: "phase-05",
    data: {
      instruction: "Introduce query param parsing and controlled filters with SSR defaults.",
      plan: "...\n",
    },
  },
];

function Page() {
  const [dependencyData, setDependencyData] = useState(sampleDependencyGraphData);

  // TODO: Replace with actual API call to fetch dependency graph data
  // useEffect(() => {
  //   fetchDependencyGraph().then(data => setDependencyData(data));
  // }, []);
  const handleGeneratePlan = (phaseId: string) => {
    console.log("[v0] Generate plan clicked for:", phaseId);
  };

  const handleOpenPlan = (phaseId: string, index: number) => {
    console.log("[v0] Open plan clicked:", { phaseId, index });
  };
  return (
    <div className="w-full flex gap-5">
      <div className="w-3/4 h-[calc(100vh-4rem)]">
        <DependencyGraphSection data={dependencyData} />
      </div>
      <div className="w-1/4 bg-emerald-100">
        <PhaseSidebar phases={demoPhases as any} plans={demoPlans as any} onGeneratePlan={handleGeneratePlan} onOpenPlan={handleOpenPlan} />
      </div>
    </div>
  );
}

export default Page;
