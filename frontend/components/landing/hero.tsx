"use client";
import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "../ui/liquid-glass-button";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-start justify-start overflow-hidden">
      <BackgroundRippleEffect />
      <div className="mt-60 w-full flex flex-col items-center gap-6 px-4 text-center">
        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">From Vague Ideas to Crystal Clear Plans</h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-neutral-800 dark:text-neutral-500">VibePlan transforms your repository into actionable development phases. Stop wrestling with AI agents—let VibePlan create the perfect plan first.</p>
        <Link className="relative z-30 cursor-pointer" href={"/analyze"}>
          <Button size={"lg"} className="mx-auto w-fit">
            Analyze now{" "}
          </Button>
        </Link>
      </div>
    </div>
  );
}
