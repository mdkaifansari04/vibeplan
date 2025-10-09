import Link from "next/link";

import Image from "next/image";
import Byline from "./byline";

import { NewThemeSwitch } from "./new-theme-selector";
import NewSectionSelector from "./new-section-selector";
import { NavigationSidemenuAnimatedBackground } from "./navigation-animated-background";
import { GlobalNavItem } from "./navigation-item";
import StarCuicuiGithubButton from "./start-github-button";
import { ScrollArea, ScrollAreaViewport } from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import Logo from "../ui/logo";
import AIInput from "../input/ai-input";

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
  return (
    <div className={cn("", className)}>
      <div className="w-full">
        <div className="flex items-center justify-between px-4 py-4">
          <Logo />
          <NewThemeSwitch />
        </div>
        <StarCuicuiGithubButton />
      </div>
      <div className="w-full mt-8">
        <NavigationSidemenuAnimatedBackground>
          <p>hi</p>
        </NavigationSidemenuAnimatedBackground>
      </div>
      <ScrollArea className="w-full h-full mt-4">
        <ScrollAreaViewport className="h-full" id="sidemenu-container">
          {/* messages */}
        </ScrollAreaViewport>
      </ScrollArea>
      <AIInput />
      <Byline />
    </div>
  );
}
