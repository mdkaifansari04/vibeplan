"use client";

import DependencyGraphSection from "@/components/container/depedency-graph/dependecy-graph-section";
import { Phase, PhaseSidebar } from "@/components/container/phase/phase-section";
import React, { useState, useEffect } from "react";
import type { DependencyGraphData } from "@/components/container/depedency-graph/types";
import { PlanModal } from "@/components/container/phase/plan-modal";
import { EditPhaseModal } from "@/components/container/phase/edit-modal";

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
    id: "phase-01",
    title: "Define Priority Job Data Model",
    description: "- Create TypeScript interface for priority job attributes\n- Add enum for priority levels (e.g., Low, Medium, High, Critical)\n- Update existing job model to extend priority interface\n- Document fields and usage in code comments\n- Add unit tests for model validation",
    relevantFiles: [],
    dependencies: [],
    estimatedComplexity: "low",
    priority: "high",
    category: "feature",
    reasoning: "Establishing a clear data model is the foundation for any new priority job functionality.",
  },
  {
    id: "phase-02",
    title: "Implement Backend API for Priority Jobs",
    description: "- Add new route handler to fetch and filter jobs by priority\n- Implement POST endpoint to create jobs with priority field\n- Validate priority input against defined enum\n- Update service layer to include priority in business logic\n- Write integration tests for new endpoints",
    relevantFiles: [],
    dependencies: ["phase-01"],
    estimatedComplexity: "medium",
    priority: "high",
    category: "feature",
    reasoning: "API endpoints enable front‑end components to interact with priority job data and ensure server‑side validation.",
  },
  {
    id: "phase-03",
    title: "Create UI Component for Priority Job Filter",
    description: "- Build a reusable React dropdown component for selecting priority levels\n- Connect component to job list state via context or props\n- Display filtered results based on selected priority\n- Add loading and empty‑state handling\n- Write component tests with React Testing Library",
    relevantFiles: [],
    dependencies: ["phase-02"],
    estimatedComplexity: "medium",
    priority: "medium",
    category: "feature",
    reasoning: "A UI filter allows users to easily view jobs by priority, delivering the core user‑facing feature.",
  },
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
    title: "Add End‑to‑End Tests for Priority Job Feature",
    description: "- Write Cypress tests covering creation, filtering, and display of priority jobs\n- Simulate user interactions with priority dropdown and job creation form\n- Verify API calls include correct priority payload\n- Ensure UI reflects priority changes in real time\n- Integrate tests into CI pipeline",
    relevantFiles: [],
    dependencies: ["phase-01", "phase-02", "phase-03", "phase-04"],
    estimatedComplexity: "medium",
    priority: "high",
    category: "documentation",
    reasoning: "Comprehensive E2E tests guarantee the new priority functionality works reliably across the stack.",
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
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ phaseId: string; index: number } | null>(null);

  const handleGeneratePlan = (phaseId: string) => {
    console.log("[v0] Generate plan clicked for:", phaseId);
    // integrate your plan generation here
  };

  const handleOpenPlan = (phaseId: string, index: number) => {
    setSelected({ phaseId, index });
    setOpen(true);
  };

  const current = React.useMemo(() => {
    if (!selected) return null;
    const list = demoPlans.filter((p) => p.phaseId === selected.phaseId);
    const data = list[selected.index]?.data;
    return data || null;
  }, [selected]);
  const [localPhases, setLocalPhases] = React.useState(demoPhases);
  React.useEffect(() => setLocalPhases(demoPhases), [demoPhases]);

  const phaseTitle = demoPhases.find((p) => p.id === selected?.phaseId)?.title || "Plan";

  return (
    <div className="w-full flex gap-5">
      <div className="w-3/4 h-[calc(100vh-4rem)]">
        <DependencyGraphSection data={dependencyData} />
      </div>
      <div className="w-1/4 bg-emerald-100">
        <PhaseSidebar phases={demoPhases as any} plans={demoPlans as any} onGeneratePlan={handleGeneratePlan} onOpenPlan={handleOpenPlan} />
        <PlanModal open={open && !!current} onOpenChange={setOpen} phaseTitle={phaseTitle} instruction={current?.instruction || ""} planMarkdown={current?.plan || ""} />
      </div>
    </div>
  );
}

export default Page;
