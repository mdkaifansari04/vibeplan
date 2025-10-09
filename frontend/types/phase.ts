export interface Phase {
  id: string;
  title: string;
  description: string;
  relevantFiles: string[];
  dependencies: string[];
  estimatedComplexity: "low" | "medium" | "high";
  priority: "low" | "medium" | "high";
  category: "feature" | "improvement" | "documentation" | "bug";
  reasoning: string;
}

export interface Plan {
  phaseId: string;
  data: {
    instruction: string;
    plan: string;
  };
}
