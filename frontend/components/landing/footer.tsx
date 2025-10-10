"use client";
import { usePathname } from "next/navigation";
import { StickyFooter } from ".././shared/sticky-footer";
import { BackgroundBeams } from "../ui/background-beams";
import { Button } from "../ui/liquid-glass-button";
import Link from "next/link";

export function Footer() {
  const pathSegments = usePathname().split("/");
  const isAnalyzePage = pathSegments[pathSegments.length - 1] === "analyze";
  if (isAnalyzePage || pathSegments.length > 2) return null;

  return (
    <div className="relative w-full">
      <div className="relative h-[120dvh] w-full">
        <BackgroundBeams />
        <div className="bg-neutral-200 dark:bg-neutral-800  rounded-3xl h-full flex flex-col items-center justify-center">
          <h3 className="text-7xl font-bold mb-4">Plan Smarter. Ship Faster.</h3>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">Join developers who stopped wrestling with AI agents and started planning with precision.</p>
          <Link className="cursor-pointer relative z-30" href={"/analyze"}>
            <Button size="lg" className="text-lg px-10 py-6">
              Start Analyzing — No Signup Required
            </Button>
          </Link>
        </div>
      </div>
      <StickyFooter heightValue="80dvh" className="text-neutral-900 dark:text-neutral-100">
        <Content />
      </StickyFooter>
    </div>
  );
}

export default Footer;

export function Content() {
  return (
    <div className="py-8 px-12 h-full w-full flex flex-col justify-between">
      <div className="grid sm:grid-cols-2 grid-cols-1 shrink-0 gap-20">
        <div className="flex flex-col gap-2">
          <h3 className="mb-2 uppercase text-neutral-500">Product</h3>
          <Link href={"/analyze"}>
            <p className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-colors">Analyze Repository</p>
          </Link>
          <Link target="_blank" href={"https://github.com/mdkaifansari04/vibeplan"}>
            <p className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-colors">Documentation</p>
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="mb-2 uppercase text-neutral-500">Profiles</h3>
          <Link target="_blank" href={"https://github.com/mdkaifansari04"}>
            <p className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-colors">GitHub</p>
          </Link>
          <Link target="_blank" href={"https://linkedin.com/in/md-kaif-ansari"}>
            <p className="hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-colors">LinkedIn</p>
          </Link>
        </div>
      </div>

      <div className="flex justify-between flex-col gap-4 sm:flex-row items-end">
        <h1 className="text-[14vw] leading-[0.8] mt-10">Vibe Plan.</h1>
        <p>©2025 VibePlan</p>
      </div>
    </div>
  );
}
