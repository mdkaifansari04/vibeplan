"use client";

import DependencyGraphSection from "@/components/container/depedency-graph/dependecy-graph-section";
import { Phase, PhaseSidebar } from "@/components/container/phase/phase-section";
import React, { useState, useEffect } from "react";
import type { DependencyGraphData } from "@/components/container/depedency-graph/types";
import { PlanModal } from "@/components/container/phase/plan-modal";
import { EditPhaseModal } from "@/components/container/phase/edit-modal";
import { useDependencyData, useDependencyActions, useDependencyLoading } from "@/store/dependency-graph";
import { usePhases, usePhaseActions, usePhaseLoading } from "@/store/phase";
import { usePlans, usePlanActions, usePlansForPhase } from "@/store/plan";
import { CircularBarsSpinnerLoader } from "@/components/ui/loader";

function Page() {
  // Store hooks
  const dependencyData = useDependencyData();
  const isDependencyLoading = useDependencyLoading();
  const { setDependencyData, setLoading: setDependencyLoading } = useDependencyActions();

  const phases = usePhases();
  const isPhaseLoading = usePhaseLoading();
  const { setPhases, setLoading: setPhaseLoading } = usePhaseActions();

  const plans = usePlans();
  const { setPlans, updatePlan } = usePlanActions();

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ phaseId: string; index: number } | null>(null);

  const handleGeneratePlan = (phaseId: string) => {
    console.log("[v0] Generate plan clicked for:", phaseId);
    // TODO: Integrate your plan generation here
  };

  const handleOpenPlan = (phaseId: string, index: number) => {
    setSelected({ phaseId, index });
    setOpen(true);
  };

  const current = React.useMemo(() => {
    if (!selected) return null;
    const plansForPhase = plans.filter((p) => p.phaseId === selected.phaseId);
    const data = plansForPhase[selected.index]?.data;
    return data || null;
  }, [selected, plans]);

  const phaseTitle = phases.find((p) => p.id === selected?.phaseId)?.title || "Plan";

  if (isDependencyLoading || isPhaseLoading) {
    return (
      <div className="w-full flex items-center justify-center h-[calc(100vh-4rem)]">
        <CircularBarsSpinnerLoader />
      </div>
    );
  }

  return (
    <div className="w-full flex gap-2">
      <div className="w-3/4 h-[calc(100vh-4rem)]">
        <DependencyGraphSection data={dependencyData} />
      </div>
      <div className="w-1/4 bg-emerald-100 rounded-xl">
        <PhaseSidebar phases={phases as any} plans={plans as any} onGeneratePlan={handleGeneratePlan} onOpenPlan={handleOpenPlan} />
        <PlanModal open={open && !!current} onOpenChange={setOpen} phaseTitle={phaseTitle} instruction={current?.instruction || ""} planMarkdown={current?.plan || ""} />
      </div>
    </div>
  );
}

export default Page;
