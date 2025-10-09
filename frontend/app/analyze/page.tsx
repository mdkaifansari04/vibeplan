"use client";

import ShinyText from "@/components/font/shiny-text";
import { Flame } from "@/components/icon/flame";
import { Layers } from "@/components/icon/layer";
import { Wand } from "@/components/icon/magic-wand";
import ModernGlassyAlert from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Highlighter } from "@/components/ui/highlighter";
import { Button } from "@/components/ui/liquid-glass-button";
import { CircularBarsSpinnerLoader } from "@/components/ui/loader";
import { ModernSimpleInput } from "@/components/ui/modern-simple-input";
import { YouTubePlayer } from "@/components/ui/youtube-player";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Clock, Github, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

const EXAMPLE_REPOS = [
  { name: "Next.js", url: "https://github.com/vercel/next.js" },
  { name: "shadcn/ui", url: "https://github.com/shadcn/ui" },
  { name: "React", url: "https://github.com/facebook/react" },
];

const DEMO_VIDEOS = [
  {
    id: "AGWyx96lP8U",
    title: "How to Plan Coding Projects Effectively",
    description: "Learn the 9-step planning process from idea to execution",
  },
  {
    id: "CAeWjoP525M",
    title: "How to Structure a Programming Project",
    description: "10 simple things to build impressive projects",
  },
  {
    id: "Efl3bKY6Y00",
    title: "Best Practices for File Organization",
    description: "Structure and organize your project file system",
  },
  {
    id: "your-vibeplan-demo-id",
    title: "VibePlan Quick Demo",
    description: "See how VibePlan analyzes repos in action",
  },
  {
    id: "6oJ2LLxfP3s",
    title: "Project Structure Best Practices",
    description: "Professional folder and file organization",
  },
];

const ANALYSIS_STEPS = ["Fetching repository files...", "Analyzing project structure...", "Scanning dependencies...", "Generating atomic phases...", "Creating implementation plans...", "Finalizing analysis..."];

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showError, setShowError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate GitHub URL
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
      const delay = isSecondToLast
        ? Math.random() * 3000 + 6000 // 6-9 seconds for second-to-last step (longer wait)
        : Math.random() * 1500 + 2000; // 2-3.5 seconds for other steps

      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, currentStep]);

  const handleAnalyze = () => {
    if (!isValidUrl) {
      setShowError(true);
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(0);
    toast({
      title: "Analysis started!",
      description: "This may take 3-10 minutes depending on repository size.",
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
              <Highlighter action="underline" color="#7F62D7">
                Repository
              </Highlighter>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Paste any GitHub repository URL below. We'll deep-analyze your codebase and generate actionable development phases.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="max-w-3xl mx-auto space-y-6">
            <div className="relative">
              <Github className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10", isValidUrl ? "text-green-500" : "text-neutral-400")} />
              <AnimatePresence>
                {isValidUrl && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-10 top-1/2 -translate-y-1/2 z-10">
                    <Check className="w-4 h-4 text-green-500" />
                  </motion.div>
                )}
              </AnimatePresence>

              <ModernSimpleInput id="github-url-input" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && isValidUrl && handleAnalyze()} placeholder="https://github.com/username/repository" className={cn("pl-12 pr-40 h-16 text-lg transition-all duration-300", "focus:shadow-lg focus:shadow-blue-500/20", showError && "border-red-500 focus-visible:border-red-500 animate-shake")} />

              <Button onClick={handleAnalyze} disabled={!isValidUrl} className={cn("absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 h-12 transition-transform ease-in-out hover:scale-[1.02]")}>
                Analyze <span className="ml-2">→</span>
              </Button>
            </div>

            <AnimatePresence>
              {showError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please enter a valid GitHub repository URL</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Clock className="w-4 h-4" />
              <span>Typical analysis: 3-7 minutes • Large repos: up to 10 minutes</span>
            </motion.div>
          </motion.div>

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
