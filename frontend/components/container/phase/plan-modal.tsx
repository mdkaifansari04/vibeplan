"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PlanModal({ open, onOpenChange, phaseTitle, instruction, planMarkdown }: { open: boolean; onOpenChange: (value: boolean) => void; phaseTitle: string; instruction: string; planMarkdown: string }) {
  const [copied, setCopied] = React.useState(false);
  const [planCopied, setPlanCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(instruction);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 1200);
      return () => clearTimeout(t);
    } catch {}
  };

  const onCopyPlan = async () => {
    try {
      await navigator.clipboard.writeText(planMarkdown);
      setPlanCopied(true);
      const t = setTimeout(() => setPlanCopied(false), 1200);
      return () => clearTimeout(t);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sm">{phaseTitle}</DialogTitle>
          <DialogDescription className="text-xs text-foreground/70">Review the instruction and the detailed plan.</DialogDescription>
        </DialogHeader>
        <section aria-label="Instruction" className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium">Instruction</h3>
            <Button size="sm" variant="secondary" className="h-7 px-2 text-[11px]" onClick={onCopy}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="mr-1" fill="currentColor">
                <path d="M15 2a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6Zm0 2H9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1ZM5 7a1 1 0 0 1 2 0v9a3 3 0 0 0 3 3h6a1 1 0 1 1 0 2H10a5 5 0 0 1-5-5V7Z" />
              </svg>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="rounded-md border border-border bg-muted/40 p-3 text-xs leading-5 text-foreground/90 whitespace-pre-wrap">{instruction}</div>
          <p className="text-[10px] text-foreground/60">
            Hint: Save this text to <code>.github/prompts/instruction.prompt.md</code> to guide your AI assistant.
          </p>
        </section>
        <div className="my-2 h-px w-full bg-border" />
        <section aria-label="Plan details" className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium">Plan</h3>
            <Button size="sm" variant="secondary" className="h-7 px-2 text-[11px]" onClick={onCopyPlan}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="mr-1" fill="currentColor">
                <path d="M15 2a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6Zm0 2H9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1ZM5 7a1 1 0 0 1 2 0v9a3 3 0 0 0 3 3h6a1 1 0 1 1 0 2H10a5 5 0 0 1-5-5V7Z" />
              </svg>
              {planCopied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="rounded-md border border-border bg-background/60 p-3 max-h-96 overflow-y-auto">
            <div className="text-xs leading-5 text-foreground/90 [&_h1]:text-sm [&_h2]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5">
              <ReactMarkdown>{planMarkdown}</ReactMarkdown>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
