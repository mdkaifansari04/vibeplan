import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

import type { HTMLAttributes, ReactNode } from "react";

interface ModernGlassyAlertProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  badge?: string;
  children?: ReactNode;
  href?: string;
}

export default function ModernGlassyAlert({ className, badge, children, href, ...props }: Readonly<ModernGlassyAlertProps>) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
      <div className={cn("pointer-events-auto flex items-center justify-between gap-x-6 bg-black/25 px-6 py-2.5 backdrop-blur-md sm:rounded-xl sm:py-3 sm:pr-3.5 sm:pl-4", className)} {...props}>
        <p className="text-sm text-white leading-6">
          <span>
            {children}
            {badge && <span className="ml-1 cursor-pointer rounded-full bg-white px-2 py-0.5 font-medium text-black text-sm">{badge}</span>}
          </span>
        </p>
      </div>
    </div>
  );
}
