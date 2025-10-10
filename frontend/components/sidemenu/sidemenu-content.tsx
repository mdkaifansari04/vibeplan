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

export const firstMenuSection = {
  name: "Info",
  noAlphabeticalSort: true,
  categoryList: [
    {
      name: "Why another library?",
      slug: "about",
      description: "CuiCui is a collection of components that I use in my projects. I wanted to share them with the world.",
    },
    {
      name: "Getting Started",
      slug: "getting-started",
      description: "Learn how to use CuiCui in your project. It's easy and simple.",
    },
    {
      name: "Contribute",
      slug: "contribute",
      description: "Help us make CuiCui better. Contribute to the project with your ideas or directly on GitHub.",
      href: "",
    },
    {
      name: "Changelog",
      slug: "changelog",
      description: "See the latest changes in CuiCui.",
    },
  ],
};
export const lastChangelogDate = new Date("2025-02-07T23:00:00.000Z");

export function SidemenuContent({ className }: Readonly<{ className?: string }>) {
  const today = new Date();
  const isNew = lastChangelogDate ? lastChangelogDate > new Date(today.setDate(today.getDate() - 7)) : false;
  const { messages } = useMessagesStore();

  return (
    <div className={cn("", className)}>
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-4">
          <Logo />
          <NewThemeSwitch />
        </div>
        <StarCuicuiGithubButton />
      </div>

      <ScrollArea className="w-full h-full mt-4">
        <ScrollAreaViewport className="h-full" id="sidemenu-container">
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
              <div className="space-y-2">
                {messages.map((message, k) => (
                  <MessageComponent key={`${message}+${k}`} message={message} />
                ))}
              </div>
            )}
          </div>
        </ScrollAreaViewport>
      </ScrollArea>
      <AIInput />
      <Byline />
    </div>
  );
}
