"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const data = [
  {
    title: "Drop Your GitHub URL",
    content: "Paste any repository URL and watch VibePlan analyze your entire codebase—scanning file structure, dependencies, and code patterns in minutes. No setup, no config files, just instant insights.",
    srcImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=60",
  },
  {
    title: "Get Smart Phases, Not Vague Tasks",
    content: "VibePlan breaks down your work into atomic, executable phases. Each phase is independent, prioritized, and comes with file references—no more guessing what to build next.",
    srcImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60",
  },
  {
    title: "Generate Battle-Ready Implementation Plans",
    content: "Click any phase to get a detailed, step-by-step implementation plan with actual code from your repo. Complete with testing strategies, edge cases, and rollback instructions.",
    srcImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&auto=format&fit=crop&q=60",
  },
  {
    title: "Feed It to Your AI Coding Agent",
    content: "Copy the plan straight to Cursor, Copilot, or Claude. VibePlan's detailed specs mean your AI agent knows exactly what to build—no more endless back-and-forth iterations.",
    srcImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&auto=format&fit=crop&q=60",
  },
];

export function FeatureSection() {
  const [featureOpen, setFeatureOpen] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 10);
    }, 10);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer > 10000) {
      setFeatureOpen((prev) => (prev + 1) % data.length);
      setTimer(0);
    }
  }, [timer]);

  return (
    <div className="container">
      <div className="mb-20 text-center">
        <p className="mb-2 font-medium text-neutral-500 text-sm uppercase">Simple by design</p>

        <h2 className="mb-4 font-semibold text-3xl text-neutral-800 tracking-tighter dark:text-neutral-300">Planning Layer That Actually Works for AI Coding Agents</h2>
      </div>
      <div className=" grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-6 ">
          {data.map((item, index) => (
            <button
              className="w-full"
              key={item.title}
              onClick={() => {
                setFeatureOpen(index);
                setTimer(0);
              }}
              type="button"
            >
              <TextComponent content={item.content} isOpen={featureOpen === index} loadingWidthPercent={featureOpen === index ? timer / 100 : 0} number={index + 1} title={item.title} />
            </button>
          ))}
        </div>
        <div className="h-full">
          <div className={cn("relative h-96 w-full overflow-hidden rounded-lg md:h-[500px]")}>
            {data.map((item, index) => (
              <img alt={item.title} className={cn("absolute h-[500px] w-full transform-gpu rounded-lg object-cover transition-all duration-300", featureOpen === index ? "scale-100" : "scale-70", featureOpen > index ? "translate-y-full" : "")} key={item.title} src={item.srcImage} style={{ zIndex: data.length - index }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TextComponent({
  number,
  title,
  content,
  isOpen,
  loadingWidthPercent,
}: Readonly<{
  number: number;
  title: string;
  content: string;
  isOpen: boolean;
  loadingWidthPercent?: number;
}>) {
  return (
    <div className={cn("transform-gpu rounded-lg border transition-all", isOpen ? "border-neutral-500/10 bg-linear-to-b from-neutral-200/15 to-neutral-200/5 dark:border-neutral-500/15 dark:from-neutral-600/15 dark:to-neutral-600/5 dark:shadow-[2px_4px_25px_0px_rgba(248,248,248,0.06)_inset] " : "scale-90 border-transparent opacity-50 saturate-0")}>
      <div className="flex w-full items-center gap-4 p-4">
        <p className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-500/20 text-neutral-600")}>{number}</p>
        <h2 className={cn("text-left font-medium text-neutral-800 text-xl dark:text-neutral-200")}>{title}</h2>
      </div>
      <div className={cn("w-full transform-gpu overflow-hidden text-left text-neutral-600 transition-all duration-500 dark:text-neutral-400", isOpen ? " max-h-64" : "max-h-0")}>
        <p className="p-4 text-lg">{content}</p>
        <div className="w-full px-4 pb-4">
          <div className="relative h-1 w-full overflow-hidden rounded-full">
            <div className={cn("absolute top-0 left-0 h-1 bg-neutral-500")} style={{ width: `${loadingWidthPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
