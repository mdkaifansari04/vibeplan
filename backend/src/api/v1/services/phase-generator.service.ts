import { LLMService } from "./llm.service";
import { Phase, PromptAnalysis, RelevantContext } from "./types";
import { VectorService } from "./vector.service";

export class PhaseGeneratorService {
  constructor(private readonly llmService: LLMService = new LLMService(), private readonly vectorService: VectorService = new VectorService()) {}

  async analyzeUserPrompt(userPrompt: string): Promise<PromptAnalysis> {
    const analysis = this.performRuleBasedAnalysis(userPrompt);
    return analysis;
  }

  private performRuleBasedAnalysis(userPrompt: string): PromptAnalysis {
    const lowerPrompt = userPrompt.toLowerCase();

    const keywords = this.extractKeywords(lowerPrompt);

    let queryType: PromptAnalysis["queryType"] = "improvement";
    let complexity: PromptAnalysis["complexity"] = "medium";

    if (lowerPrompt.includes("fix") || lowerPrompt.includes("bug") || lowerPrompt.includes("error")) {
      queryType = "debug";
    } else if (lowerPrompt.includes("add") || lowerPrompt.includes("implement") || lowerPrompt.includes("create")) {
      queryType = "feature";
    } else if (lowerPrompt.includes("refactor") || lowerPrompt.includes("restructure") || lowerPrompt.includes("reorganize")) {
      queryType = "refactor";
    } else if (lowerPrompt.includes("specific") || keywords.some((k) => ["login", "signup", "auth", "form"].includes(k))) {
      queryType = "specific";
    }

    // Determine complexity
    if (lowerPrompt.includes("simple") || lowerPrompt.includes("quick") || lowerPrompt.includes("small")) {
      complexity = "low";
    } else if (lowerPrompt.includes("complex") || lowerPrompt.includes("major") || lowerPrompt.includes("entire")) {
      complexity = "high";
    }

    const targetAreas = this.extractTargetAreas(lowerPrompt, keywords);

    return {
      queryType,
      intent: this.generateIntent(userPrompt, queryType),
      targetAreas,
      complexity,
      keywords,
    };
  }

  private extractKeywords(prompt: string): string[] {
    const techKeywords = ["authentication", "auth", "login", "signup", "registration", "form", "validation", "database", "api", "endpoint", "service", "component", "module", "function", "class", "method", "variable", "performance", "optimization", "security", "testing", "bug", "error", "exception", "refactor", "improve", "enhance", "frontend", "backend", "ui", "interface", "user", "admin", "dashboard", "notification", "email", "payment", "checkout", "cart", "product", "order"];

    return techKeywords.filter((keyword) => prompt.includes(keyword));
  }

  private extractTargetAreas(prompt: string, keywords: string[]): string[] {
    const areas = new Set<string>();

    keywords.forEach((keyword) => areas.add(keyword));

    // Pattern matching for common areas
    if (prompt.includes("auth") || prompt.includes("login") || prompt.includes("signup")) {
      areas.add("authentication");
    }
    if (prompt.includes("form") || prompt.includes("input") || prompt.includes("validation")) {
      areas.add("form handling");
    }
    if (prompt.includes("api") || prompt.includes("endpoint") || prompt.includes("service")) {
      areas.add("backend services");
    }
    if (prompt.includes("ui") || prompt.includes("frontend") || prompt.includes("component")) {
      areas.add("user interface");
    }

    return Array.from(areas).slice(0, 5); // Limit to 5 areas
  }

  private generateIntent(prompt: string, queryType: string): string {
    const typeMap = {
      specific: "Address specific functionality or issue",
      improvement: "Enhance and optimize existing code",
      refactor: "Restructure and organize codebase",
      debug: "Identify and fix bugs or errors",
      feature: "Implement new functionality",
    };

    return `${typeMap[queryType as keyof typeof typeMap]}: ${prompt}`;
  }

  async generateAtomicPhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis): Promise<Phase[]> {
    console.log(`Generating atomic phases for: "${userPrompt}"`);
    console.log(`Context: ${context.files.length} files found`);

    const phases = await this.llmService.generatePhases(userPrompt, context);

    console.log(`Generated ${phases.length} phases`);
    return phases;
  }
}
