"use client";

import * as React from "react";
import { PhaseCard } from "./phase-card";
import { EditPhaseModal } from "./edit-modal";

export type Phase = {
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
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [localPhases, setLocalPhases] = React.useState<Phase[]>(phases);
  React.useEffect(() => setLocalPhases(phases), [phases]);

  const editingPhase = React.useMemo(() => localPhases.find((p) => p.id === editingId) || null, [localPhases, editingId]);

  const handleEditPhase = (phase: Phase) => {
    setEditingId(phase.id);
    setEditOpen(true);
  };

  const handleSaveDescription = async (next: string) => {
    setSaving(true);
    try {
      setLocalPhases((prev) => prev.map((p) => (p.id === editingId ? { ...p, description: next } : p)));
      // Hook: persist to backend here if needed
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside aria-label="Phases" className={["sticky top-0 h-[100svh] w-1/4 min-w-[320px] shrink-0 border-l border-border bg-sidebar p-3", "overflow-y-auto", className || ""].join(" ")}>
      <div className="mb-2 px-1">
        <h2 className="text-sm font-medium text-foreground/80">Phases</h2>
        <p className="text-xs text-foreground/60">Hover a card to see details</p>
      </div>

      <div className="flex flex-col gap-3">
        {phases.map((phase) => (
          <PhaseCard onEditPhase={handleEditPhase} key={phase.id} phase={phase} plans={plansByPhase.get(phase.id) || []} onGeneratePlan={onGeneratePlan} onOpenPlan={onOpenPlan} />
        ))}
        <EditPhaseModal open={editOpen && !!editingPhase} onOpenChange={setEditOpen} title={editingPhase?.title || ""} description={editingPhase?.description || ""} onSave={handleSaveDescription} saving={saving} />
      </div>
    </aside>
  );
}
