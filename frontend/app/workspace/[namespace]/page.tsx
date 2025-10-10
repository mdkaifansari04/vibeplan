"use client";
import React from "react";

import DependencyGraphSection from "@/components/container/depedency-graph/dependecy-graph-section";
import { PhaseSidebar } from "@/components/container/phase/phase-section";
import { PlanModal } from "@/components/container/phase/plan-modal";
import { useDependencyGraphStore } from "@/store/dependency-graph";
import { usePhaseStore } from "@/store/phase";
import { usePlanStore } from "@/store/plan";

function Page() {
  const { dependencyData } = useDependencyGraphStore();
  const { phases } = usePhaseStore();
  const { plans } = usePlanStore();

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ phaseId: string; index: number } | null>(null);

  const handleGeneratePlan = async (phaseId: string) => {};
  const handleOpenPlan = (phaseId: string, index: number) => {
    setSelected({ phaseId, index });
    setOpen(true);
  };

  const current = React.useMemo(() => {
    if (!selected) return null;
    const plansForPhase = plans.filter((p) => p.phaseId === selected.phaseId);
    const data = plansForPhase[selected.index];
    return data || null;
  }, [selected, plans]);

  const phaseTitle = phases.find((p) => p.id === selected?.phaseId)?.title || "Plan";

  return (
    <div className="w-full flex gap-2">
      <div className="w-3/4 h-[calc(100vh-4rem)]">
        <DependencyGraphSection data={dependencyData} />
      </div>
      <div className="w-1/4 rounded-xl h-[calc(100vh-4rem)]">
        <PhaseSidebar phases={phases as any} plans={plans as any} onGeneratePlan={handleGeneratePlan} onOpenPlan={handleOpenPlan} />
        <PlanModal open={open && !!current} onOpenChange={setOpen} phaseTitle={phaseTitle} instruction={current?.instruction || ""} planMarkdown={current?.plan || ""} />
      </div>
    </div>
  );
}

export default Page;
