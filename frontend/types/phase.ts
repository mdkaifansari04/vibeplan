export interface Phase {
  id: string;
  title: string;
  description: string;
  relevantFiles: string[];
  dependencies: string[];
  estimatedComplexity: "low" | "medium" | "high";
  priority: "low" | "medium" | "high" | "critical";
  category: "feature" | "improvement" | "documentation" | "bug";
  reasoning: string;
}

export interface Plan {
  phaseId: string;
  instruction: string;
  plan: string;
}
