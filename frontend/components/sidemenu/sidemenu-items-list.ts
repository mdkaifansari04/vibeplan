import { CategoryType } from "./sidebar.d";

import { differenceInDays } from "date-fns";
import type { LucideIcon } from "lucide-react";
type SidemenuItems = {
  title: string;
  items: {
    name: string;
    href: string;
    Icon: LucideIcon | null;
    tag: string | null;
  }[];
};

export const activatedSections = ["application-ui", "common-ui", "hooks", "marketing-ui", "other", "utils", "snippets"];

export async function getSidemenuItems(section: (typeof activatedSections)[number]): Promise<SidemenuItems | null> {
  if (!activatedSections.includes(section)) {
    return null;
  }
  switch (section) {
    case "application-ui":
    case "common-ui":
    case "hooks":
    case "marketing-ui":
    case "other":
    default: {
      return {
        title: "An error occurred",
        items: [],
      };
    }
  }
}

function getCategoryTag(category: CategoryType) {
  const isNew = differenceInDays(new Date(), category.meta.latestUpdateDate ?? 0) < 21;
  if (category.meta.isComingSoon) {
    return "Coming Soon";
  }
  if (isNew) {
    return "New";
  }
  return null;
}
