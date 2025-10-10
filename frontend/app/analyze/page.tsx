"use client";

import ShinyText from "@/components/font/shiny-text";
import { Flame } from "@/components/icon/flame";
import { Layers } from "@/components/icon/layer";
import { Wand } from "@/components/icon/magic-wand";
import ModernGlassyAlert from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Highlighter } from "@/components/ui/highlighter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/liquid-glass-button";
import { CircularBarsSpinnerLoader } from "@/components/ui/loader";
import { ModernSimpleInput } from "@/components/ui/modern-simple-input";
import { YouTubePlayer } from "@/components/ui/youtube-player";
import { useIndexRepository } from "@/hooks/mutation";
import { useToast } from "@/hooks/use-toast";
import { DEMO_VIDEOS, EXAMPLE_REPOS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDependencyGraphStore } from "@/store/dependency-graph";
import { AlertCircle, Check, Clock, Github, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";

const ANALYSIS_STEPS = ["Fetching repository files...", "Analyzing project structure...", "Scanning dependencies...", "Generating atomic phases...", "Creating implementation plans...", "Finalizing analysis..."];

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { mutate: indexRepository } = useIndexRepository();
  const { setDependencyData } = useDependencyGraphStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    setIsValidUrl(githubRegex.test(url));
    if (showError && githubRegex.test(url)) {
      setShowError(false);
    }
  }, [url, showError]);

  useEffect(() => {
    if (isAnalyzing && currentStep < ANALYSIS_STEPS.length - 1) {
      const isSecondToLast = currentStep === ANALYSIS_STEPS.length - 2;
      const delay = isSecondToLast ? Math.random() * 3000 + 6000 : Math.random() * 1500 + 2000;

      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, currentStep]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    if (!isValidUrl) {
      setShowError(true);
      return;
    }

    indexRepository(url, {
      onSuccess: (data) => {
        setCurrentStep(ANALYSIS_STEPS.length - 1);
        setDependencyData({ nodes: data.dependencyGraph.nodes, edges: data.dependencyGraph.edges, stats: data.dependencyGraph.stats });
        router.push(`/workspace/${data.namespace}`);
      },
      onError: (error) => {
        console.error("Indexing error:", error);
        setCurrentStep(0);
        toast({
          title: "Analysis failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      },
      onSettled: () => {
        setIsAnalyzing(false);
      },
    });
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setTimeout(() => {
      document.getElementById("github-url-input")?.focus();
    }, 300);
  };
  if (!mounted) return null;
  if (isAnalyzing) {
    return <AnalyzingState currentStep={currentStep} totalSteps={ANALYSIS_STEPS.length} stepName={ANALYSIS_STEPS[currentStep]} url={url} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <main className="relative flex min-h-screen items-center justify-center px-4 py-40 md:px-8">
        <div className="relative w-full max-w-6xl space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Analyze Your{" "}
              <Highlighter action="underline" color="#ea6d74">
                Repository
              </Highlighter>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Paste any GitHub repository URL below. We'll deep-analyze your codebase and generate actionable development phases.
            </motion.p>
          </motion.div>

          <div className="w-full md:flex md:items-stretch">
            {/* Combined URL + Branch group */}
            <div
              className="flex min-w-3xl mx-auto items-center rounded-lg border bg-card text-sm shadow-sm
                     focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
              role="group"
              aria-label="Repository URL and Branch"
            >
              <label htmlFor="repo-url" className="sr-only">
                Repository URL
              </label>
              <Input id="repo-url" type="url" required placeholder="https://github.com/owner/repo" autoComplete="off" value={url} onChange={(e) => setUrl(e.target.value)} className="h-11 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground" />

              <div aria-hidden="true" className="mx-1 h-6 w-px bg-border" />

              <div className="flex items-center pr-2 pl-1 min-w-28">
                <label htmlFor="branch" className="sr-only">
                  Branch
                </label>
                <div className="pointer-events-none select-none text-muted-foreground pr-2 text-xs uppercase tracking-wide">Branch</div>
                <Input id="branch" type="text" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} className="h-8 w-[7.5rem] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground" />
              </div>
              <div className="mt-3 md:mt-0 md:ml-2">
                <Button onClick={handleAnalyze} size="lg" className="w-full md:w-auto md:h-11 md:rounded-l-none md:border md:border-l-0 md:border-border">
                  Analyze
                </Button>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1 h-px bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-sm text-neutral-500 font-medium">OR TRY AN EXAMPLE</span>
            <div className="flex-1 h-px bg-neutral-300 dark:bg-neutral-700" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-wrap justify-center gap-3">
            {EXAMPLE_REPOS.map((repo, index) => (
              <motion.div key={repo.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + index * 0.1 }}>
                <Button size="sm" onClick={() => handleExampleClick(repo.url)} className="hover:scale-105 transition-transform">
                  {repo.name}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Flame,
                title: "Fast Analysis",
                description: "AI-powered scanning of your entire codebase structure",
                color: "text-blue-500",
                delay: 0,
              },
              {
                icon: Layers,
                title: "Atomic Phases",
                description: "Break down work into independent, executable tasks",
                color: "text-purple-500",
                delay: 0.1,
              },
              {
                icon: Wand,
                title: "Detailed Plans",
                description: "Step-by-step implementation guides for each phase",
                color: "text-pink-500",
                delay: 0.2,
              },
            ].map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + feature.delay }}>
                <Card className="p-6 text-center border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-3 flex justify-center">
                    <feature.icon className={cn("w-8 h-8", feature.color)} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function AnalyzingState({ currentStep, totalSteps, stepName, url }: { currentStep: number; totalSteps: number; stepName: string; url: string }) {
  const progress = (currentStep / totalSteps) * 100;
  const randomVideo = useMemo(() => DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)], []);
  const isOnLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-4xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold">Analyzing Repository</h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto break-all">{url}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline">
                  {currentStep + 1} / {totalSteps}
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {ANALYSIS_STEPS.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isPending = index > currentStep;

                return (
                  <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={cn("flex items-center gap-3 text-sm", isCompleted && "text-gray-600", isCurrent && "text-white font-medium", isPending && "text-neutral-400")}>
                    {isCompleted ? <Check className="w-4 h-4" /> : isCurrent ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}

                    {isCurrent ? (
                      <ShinyText speedInMs={2000} className="w-fit">
                        {step}
                      </ShinyText>
                    ) : (
                      <span>{step}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {isOnLastStep && <ModernGlassyAlert badge="Vibeplan 🐤">You will be automatically redirect workspace page.</ModernGlassyAlert>}
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">While You Wait...</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Learn more about project planning and development</p>
          </div>
          <YouTubePlayer videoId={randomVideo.id} title={randomVideo.title} />
        </motion.div>
      </div>
    </div>
  );
}
