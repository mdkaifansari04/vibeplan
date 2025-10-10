"use client";

import Byline from "./byline";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollAreaViewport } from "@radix-ui/react-scroll-area";
import { Bot } from "lucide-react";
import AIInput from "../input/ai-input";
import Logo from "../ui/logo";
import MessageComponent from "../ui/message";
import { NewThemeSwitch } from "./new-theme-selector";
import StarCuicuiGithubButton from "./start-github-button";
import { useMessagesStore } from "@/store/messages";
import { usePhaseStore } from "@/store/phase";

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
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No messages yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Start a conversation below</p>
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
