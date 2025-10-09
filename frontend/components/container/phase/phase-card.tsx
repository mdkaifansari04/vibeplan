"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Button as LiquidButton } from "@/components/ui/liquid-glass-button";
import ShiftCard from "@/components/ui/shift-card";
import { cn } from "@/lib/utils";
import { Eye, PencilLine, View } from "lucide-react";

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

function priorityColor(priority: Phase["priority"]) {
  switch (priority) {
    case "critical":
      return "bg-destructive text-destructive-foreground";
    case "high":
      return "bg-primary text-primary-foreground";
    case "medium":
      return "bg-secondary text-secondary-foreground";
    case "low":
    default:
      return "bg-accent text-accent-foreground";
  }
}

function SmallPlanCard({ instruction, onRegenerate }: { instruction: string; onRegenerate?: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-card/80 px-2 py-2">
      <div className="mt-0.5 text-xs leading-4 text-foreground/80 line-clamp-2">{instruction}</div>
      <button onClick={onRegenerate} className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-foreground/70 hover:bg-accent hover:text-foreground transition" aria-label="Regenerate plan" title="Regenerate plan">
        <Eye />
      </button>
    </div>
  );
}

export function PhaseCard({ phase, plans = [], onGeneratePlan, onOpenPlan, onEditPhase }: { phase: Phase; plans?: Plan[]; onGeneratePlan?: (phaseId: string) => void; onOpenPlan?: (phaseId: string, index: number) => void; onEditPhase?: (phase: Phase) => void }) {
  const topContent = (
    <div className="rounded-md bg-accent/90 text-primary shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(255,252,240,0.5)_inset,0px_0px_0px_1px_hsla(0,0%,100%,0.1)_inset,0px_0px_1px_0px_rgba(28,27,26,0.5)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(0,0,0,0.1),0_2px_2px_0_rgba(0,0,0,0.1),0_4px_4px_0_rgba(0,0,0,0.1),0_8px_8px_0_rgba(0,0,0,0.1)]">
      <div className="flex flex-col justify-between p-3">
        <h3 className="text-sm font-medium text-primary">
          <span className="sr-only">Phase title:</span>
          {phase.title}
        </h3>
        <div className="gap-1">
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", priorityColor(phase.priority))} aria-label={`Priority: ${phase.priority}`}>
            {phase.priority}
          </span>
          <span className="inline-flex h-5 items-center gap-1 rounded px-1.5 text-[10px] text-foreground/70" aria-label={`Complexity: ${phase.estimatedComplexity}`} title={`Complexity: ${phase.estimatedComplexity}`}>
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", phase.estimatedComplexity === "high" ? "bg-destructive" : phase.estimatedComplexity === "medium" ? "bg-primary" : "bg-muted-foreground")} />
            {phase.estimatedComplexity}
          </span>
          <button className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground/80 hover:bg-muted transition" aria-label="Edit phase description" onClick={() => onEditPhase?.(phase)}>
            <PencilLine className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );

  const topAnimateContent = (
    <>
      <motion.img transition={{ duration: 0.3, ease: "circIn" }} src="/phase-thumbnail.jpg" layoutId={`phase-img-${phase.id}`} width={78} height={80} alt="Phase thumbnail" className="absolute right-2 top-1.5 rounded-sm shadow-lg" />
      <motion.div
        className="absolute right-[6px] top-[4px] h-[70px] w-[82px] rounded-sm rounded-br-sm border-[2px] border-dashed border-neutral-800/80 bg-transparent dark:border-neutral-200/80 ml-auto mb-[6px] dark:mb-[3px]"
        initial={{ opacity: 0, scale: 1.6, y: 0, filter: "blur(4px)" }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { delay: 0.35, duration: 0.15 },
        }}
        exit={{
          opacity: 0,
          y: 100,
          filter: "blur(4px)",
          transition: { delay: 0.0, duration: 0 },
        }}
      />
    </>
  );

  const middleContent = <motion.img src="/phase-image.jpg" layoutId={`phase-img-${phase.id}`} alt="Phase preview" className="w-1/2 mx-auto rounded-sm border-2 border-white dark:border-black" />;

  const bottomContent = (
    <div className="pb-3">
      <div className="flex w-full flex-col gap-2 rounded-t-lg border-t border-t-black/10 bg-primary/90 px-3 pb-3">
        <div className="flex items-center gap-1 pt-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1185fd" aria-hidden="true">
            <path d="M12 2a10 10 0 1 1-9.997 10A10 10 0 0 1 12 2Zm0 4a1.25 1.25 0 1 0 1.25 1.25A1.25 1.25 0 0 0 12 6Zm1.25 4h-2.5a.75.75 0 0 0 0 1.5h.5V17h-1a.75.75 0 0 0 0 1.5h3.5A.75.75 0 0 0 14.5 17h-1V11a.75.75 0 0 0-.75-.75Z" />
          </svg>
          <p className="text-[12px] font-medium text-white dark:text-[#171717]">{phase.category}</p>
        </div>
        {/* <Button size="sm" variant="secondary" className="h-6 w-6 p-0" title={plans.length ? "Quick view" : "No plans yet"} aria-label="Quick view" onClick={() => (plans.length ? onOpenPlan?.(phase.id, 0) : undefined)}>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12 5C6 5 1.73 8.11 0 12c1.73 3.89 6 7 12 7s10.27-3.11 12-7c-1.73-3.89-6-7-12-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          </svg>
        </Button> */}
        <p className="text-pretty text-[12px] leading-4 text-neutral-100 dark:text-[#171717]">{phase.description.split("\n").slice(0, 2).join(" ")}</p>

        {phase.dependencies?.length ? (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-white/80 dark:text-[#171717]">Depends:</span>
            {phase.dependencies.map((d) => (
              <Badge key={d} variant="secondary" className="px-1.5 py-0.5 text-[10px]">
                {d}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex flex-col gap-2 rounded-xl bg-accent/80 px-1 py-1 dark:bg-accent">
          <Button size="sm" className="h-7 text-xs" onClick={() => onGeneratePlan?.(phase.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1" aria-hidden="true">
              <path d="M5 3l1.5 3L10 7.5 6.5 9 5 12 3.5 9 0 7.5 3.5 6 5 3Zm14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM12 10l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" />
            </svg>
            Generate plan
          </Button>

          {plans.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {plans.map((p, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenPlan?.(phase.id, idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onOpenPlan?.(phase.id, idx);
                  }}
                  className="focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md outline-none"
                >
                  <SmallPlanCard instruction={p.data.instruction} onRegenerate={() => onGeneratePlan?.(phase.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      <ShiftCard className="bg-card dark:bg-[#1A1A1A]" topContent={topContent} topAnimateContent={topAnimateContent} middleContent={middleContent} bottomContent={bottomContent} />
    </div>
  );
}
