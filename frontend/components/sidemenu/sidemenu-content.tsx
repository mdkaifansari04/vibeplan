"use client";

import Byline from "./byline";

import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/store/messages";
import { usePhaseStore } from "@/store/phase";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Brain } from "lucide-react";
import AIInput from "../input/ai-input";
import Logo from "../ui/logo";
import MessageComponent from "../ui/message";
import { NewThemeSwitch } from "./new-theme-selector";
import StarCuicuiGithubButton from "./start-github-button";

export function SidemenuContent({ className }: Readonly<{ className?: string }>) {
  const today = new Date();
  const { messages } = useMessagesStore();
  const { relevantFiles, phases, userPrompt } = usePhaseStore();

  return (
    <div className={cn("max-h-full", className)}>
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-4">
          <Logo />
          <NewThemeSwitch />
        </div>
        <StarCuicuiGithubButton />
      </div>

      <ScrollArea className="w-full h-full mt-4 overflow-y-scroll">
        <div className="px-2 pb-4 pt-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1"> Ready to Plan?</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[200px]"> Describe what you'd like to build or improve, and I'll break it down into actionable phases.</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-scroll">
              {messages.map((message, k) => (
                <MessageComponent key={`${message}+${k}`} metadata={message.message == userPrompt ? { phaseCount: phases.length, contextFiles: relevantFiles.length } : undefined} message={message} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <AIInput />
      <Byline />
    </div>
  );
}
