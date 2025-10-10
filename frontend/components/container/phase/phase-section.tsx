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
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside aria-label="Phases" className={["sticky top-0 h-[calc(100vh-4rem)] w-1/4 min-w-[320px] shrink-0 rounded bg-sidebar p-3", "overflow-y-auto", className || ""].join(" ")}>
      <div className="mb-2 px-1">
        <h2 className="text-sm font-medium text-foreground/80">Phases</h2>
        <p className="text-xs text-foreground/60">{phases.length > 0 ? "Hover a card to see details" : "No phases found"}</p>
      </div>

      <div className="flex flex-col gap-3">
        {phases.length > 0 ? (
          phases.map((phase) => <PhaseCard onEditPhase={handleEditPhase} key={phase.id} phase={phase} plans={plansByPhase.get(phase.id) || []} onGeneratePlan={onGeneratePlan} onOpenPlan={onOpenPlan} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">No Phases Found</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">Generate phases after sending a prompt to get started with your project breakdown.</p>
            <button
              className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => {
                console.log("Generate phases clicked");
              }}
            >
              Generate Phases
            </button>
          </div>
        )}
        <EditPhaseModal phaseId={editingPhase?.id || ""} open={editOpen && !!editingPhase} onOpenChange={setEditOpen} title={editingPhase?.title || ""} description={editingPhase?.description || ""} onSave={handleSaveDescription} saving={saving} />
      </div>
    </aside>
  );
}
