"use client";

import * as React from "react";
import { PhaseCard } from "./phase-card";

type Phase = {
  id: string;
  title: string;
  description: string;
  relevantFiles: string[];
  dependencies: string[];
  estimatedComplexity: "low" | "medium" | "high";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  reasoning?: string;
};

type Plan = {
  phaseId: string;
  data: {
    instruction: string;
    plan: string;
  };
};

export function PhaseSidebar({ phases, plans, onGeneratePlan, onOpenPlan, className }: { phases: Phase[]; plans: Plan[]; onGeneratePlan?: (phaseId: string) => void; onOpenPlan?: (phaseId: string, index: number) => void; className?: string }) {
  const plansByPhase = React.useMemo(() => {
    const map = new Map<string, Plan[]>();
    for (const p of plans) {
      const list = map.get(p.phaseId) || [];
      list.push(p);
      map.set(p.phaseId, list);
    }
    return map;
  }, [plans]);

  return (
    <aside aria-label="Phases" className={["sticky top-0 h-[100svh] w-1/4 min-w-[320px] shrink-0 border-l border-border bg-sidebar p-3", "overflow-y-auto", className || ""].join(" ")}>
      <div className="mb-2 px-1">
        <h2 className="text-sm font-medium text-foreground/80">Phases</h2>
        <p className="text-xs text-foreground/60">Hover a card to see details</p>
      </div>

      <div className="flex flex-col gap-3">
        {phases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} plans={plansByPhase.get(phase.id) || []} onGeneratePlan={onGeneratePlan} onOpenPlan={onOpenPlan} />
        ))}
      </div>
    </aside>
  );
}
