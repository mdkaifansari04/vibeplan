import Link from "next/link";
import { ModernGradientContainerContent, ModernGradientContainerRoot } from "../cui-buton/github-stars/simple-container";

export default function Byline() {
  return (
    <ModernGradientContainerRoot className="w-full" animationDurationInSeconds={20}>
      <ModernGradientContainerContent className="px-4 py-2 flex items-start">
        <p className="inline text-neutral-400 text-sm">
          Build by{" "}
          <Link aria-label="Md Kaif Ansari" className="inline underline text-neutral-400 text-sm hover:text-neutral-500 dark:hover:text-neutral-100" href="https://www.mdkaif.me/" rel="noreferrer" target="_blank" title="Md Kaif Ansari">
            Md Kaif Ansari
          </Link>
        </p>
      </ModernGradientContainerContent>
    </ModernGradientContainerRoot>
  );
}
