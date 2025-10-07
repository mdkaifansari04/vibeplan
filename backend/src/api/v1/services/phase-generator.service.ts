import { Phase, PromptAnalysis, RelevantContext } from "./types";
import { VectorService } from "./vector.service";

export class PhaseGeneratorService {
  private vectorService: VectorService;

  constructor() {
    this.vectorService = new VectorService();
  }

  async analyzeUserPrompt(userPrompt: string): Promise<PromptAnalysis> {
    console.log(`Analyzing user prompt: "${userPrompt}"`);
    const analysis = this.performRuleBasedAnalysis(userPrompt);

    console.log(`Prompt analysis completed:`, analysis);
    return analysis;
  }

  //prompt analysis (fallback when LLM is not available)
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

    // Extract target areas
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

    // Add keywords as target areas
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

    // For now, implement rule-based phase generation
    // In production, you would use OpenAI API here
    const phases = this.generateRuleBasedPhases(userPrompt, context, analysis);

    console.log(`Generated ${phases.length} phases`);
    return phases;
  }

  /**
   * Rule-based phase generation (fallback when LLM is not available)
   */
  private generateRuleBasedPhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis): Phase[] {
    const phases: Phase[] = [];
    const timestamp = Date.now();

    // Group files by type/language for better organization
    const fileGroups = this.groupFilesByType(context.files);

    switch (analysis.queryType) {
      case "specific":
        phases.push(...this.generateSpecificPhases(userPrompt, context, analysis, timestamp));
        break;
      case "feature":
        phases.push(...this.generateFeaturePhases(userPrompt, context, analysis, timestamp));
        break;
      case "debug":
        phases.push(...this.generateDebugPhases(userPrompt, context, analysis, timestamp));
        break;
      case "refactor":
        phases.push(...this.generateRefactorPhases(userPrompt, context, analysis, timestamp));
        break;
      case "improvement":
        phases.push(...this.generateImprovementPhases(userPrompt, context, analysis, timestamp));
        break;
      default:
        phases.push(...this.generateDefaultPhases(userPrompt, context, analysis, timestamp));
    }

    return phases.slice(0, 7); // Limit to 7 phases max
  }

  /**
   * Generate phases for specific tasks
   */
  private generateSpecificPhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis, timestamp: number): Phase[] {
    const phases: Phase[] = [];
    const relevantFiles = context.files.slice(0, 5).map((f) => f.path);

    if (analysis.keywords.includes("validation")) {
      phases.push({
        id: `phase-${timestamp}-1`,
        title: "Add client-side validation",
        description: `Implement client-side validation for the identified forms and inputs. Focus on immediate user feedback and preventing invalid data submission.`,
        relevantFiles: relevantFiles.filter((f) => f.includes("component") || f.includes("form")),
        dependencies: [],
        estimatedComplexity: "low",
        priority: "high",
        category: "feature",
        reasoning: "Client-side validation provides immediate feedback and improves user experience.",
      });

      phases.push({
        id: `phase-${timestamp}-2`,
        title: "Add server-side validation",
        description: `Implement comprehensive server-side validation to ensure data integrity and security. Add proper error handling and validation messages.`,
        relevantFiles: relevantFiles.filter((f) => f.includes("controller") || f.includes("service") || f.includes("api")),
        dependencies: [],
        estimatedComplexity: "medium",
        priority: "high",
        category: "improvement",
        reasoning: "Server-side validation is critical for security and data integrity.",
      });
    }

    if (analysis.keywords.includes("auth") || analysis.keywords.includes("authentication")) {
      phases.push({
        id: `phase-${timestamp}-${phases.length + 1}`,
        title: "Fix authentication middleware",
        description: `Debug and fix authentication-related issues in the middleware. Check token validation, session management, and error handling.`,
        relevantFiles: relevantFiles.filter((f) => f.includes("auth") || f.includes("middleware")),
        dependencies: [],
        estimatedComplexity: "medium",
        priority: "high",
        category: "bug_fix",
        reasoning: "Authentication issues are critical security concerns that need immediate attention.",
      });
    }

    return phases;
  }

  /**
   * Generate phases for new features
   */
  private generateFeaturePhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis, timestamp: number): Phase[] {
    const phases: Phase[] = [];
    const relevantFiles = context.files.slice(0, 5).map((f) => f.path);

    phases.push({
      id: `phase-${timestamp}-1`,
      title: "Design feature architecture",
      description: `Plan the architecture and data flow for the new feature. Identify required components, services, and database changes.`,
      relevantFiles: [],
      dependencies: [],
      estimatedComplexity: "low",
      priority: "high",
      category: "feature",
      reasoning: "Proper planning prevents issues and ensures scalable implementation.",
    });

    phases.push({
      id: `phase-${timestamp}-2`,
      title: "Implement backend services",
      description: `Create the necessary backend services, API endpoints, and database models for the new feature.`,
      relevantFiles: relevantFiles.filter((f) => f.includes("service") || f.includes("controller") || f.includes("model")),
      dependencies: [`phase-${timestamp}-1`],
      estimatedComplexity: "medium",
      priority: "high",
      category: "feature",
      reasoning: "Backend implementation provides the foundation for frontend components.",
    });

    phases.push({
      id: `phase-${timestamp}-3`,
      title: "Create frontend components",
      description: `Build the user interface components and integrate them with the backend services.`,
      relevantFiles: relevantFiles.filter((f) => f.includes("component") || f.includes("page")),
      dependencies: [`phase-${timestamp}-2`],
      estimatedComplexity: "medium",
      priority: "medium",
      category: "feature",
      reasoning: "Frontend components complete the user-facing functionality.",
    });

    return phases;
  }

  /**
   * Generate phases for debugging
   */
  private generateDebugPhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis, timestamp: number): Phase[] {
    const phases: Phase[] = [];
    const relevantFiles = context.files.slice(0, 5).map((f) => f.path);

    phases.push({
      id: `phase-${timestamp}-1`,
      title: "Identify root cause",
      description: `Analyze the codebase to identify the root cause of the reported issue. Add logging and debugging tools as needed.`,
      relevantFiles: relevantFiles,
      dependencies: [],
      estimatedComplexity: "medium",
      priority: "high",
      category: "bug_fix",
      reasoning: "Understanding the root cause is essential for effective bug fixes.",
    });

    phases.push({
      id: `phase-${timestamp}-2`,
      title: "Implement fix",
      description: `Apply the necessary code changes to fix the identified issue. Ensure the fix doesn't introduce new problems.`,
      relevantFiles: relevantFiles.slice(0, 3),
      dependencies: [`phase-${timestamp}-1`],
      estimatedComplexity: analysis.complexity,
      priority: "high",
      category: "bug_fix",
      reasoning: "Targeted fixes address the specific issue without affecting other functionality.",
    });

    phases.push({
      id: `phase-${timestamp}-3`,
      title: "Add preventive measures",
      description: `Add tests, validation, or monitoring to prevent similar issues in the future.`,
      relevantFiles: [],
      dependencies: [`phase-${timestamp}-2`],
      estimatedComplexity: "low",
      priority: "medium",
      category: "improvement",
      reasoning: "Prevention measures reduce the likelihood of similar bugs occurring again.",
    });

    return phases;
  }

  /**
   * Generate phases for refactoring
   */
  private generateRefactorPhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis, timestamp: number): Phase[] {
    const phases: Phase[] = [];
    const relevantFiles = context.files.slice(0, 5).map((f) => f.path);

    phases.push({
      id: `phase-${timestamp}-1`,
      title: "Extract reusable components",
      description: `Identify and extract common functionality into reusable components or services.`,
      relevantFiles: relevantFiles,
      dependencies: [],
      estimatedComplexity: "medium",
      priority: "medium",
      category: "refactor",
      reasoning: "Reusable components reduce code duplication and improve maintainability.",
    });

    phases.push({
      id: `phase-${timestamp}-2`,
      title: "Optimize code structure",
      description: `Reorganize code structure for better readability and maintainability. Follow established patterns and conventions.`,
      relevantFiles: relevantFiles,
      dependencies: [],
      estimatedComplexity: "medium",
      priority: "low",
      category: "refactor",
      reasoning: "Well-structured code is easier to understand and maintain.",
    });

    return phases;
  }

  /**
   * Generate phases for general improvements
   */
  private generateImprovementPhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis, timestamp: number): Phase[] {
    const phases: Phase[] = [];
    const relevantFiles = context.files.slice(0, 5).map((f) => f.path);

    phases.push({
      id: `phase-${timestamp}-1`,
      title: "Improve error handling",
      description: `Add comprehensive error handling throughout the application. Include proper logging and user-friendly error messages.`,
      relevantFiles: relevantFiles,
      dependencies: [],
      estimatedComplexity: "medium",
      priority: "medium",
      category: "improvement",
      reasoning: "Better error handling improves user experience and debugging capabilities.",
    });

    phases.push({
      id: `phase-${timestamp}-2`,
      title: "Optimize performance",
      description: `Identify and optimize performance bottlenecks. Focus on database queries, API calls, and rendering performance.`,
      relevantFiles: relevantFiles,
      dependencies: [],
      estimatedComplexity: "high",
      priority: "medium",
      category: "improvement",
      reasoning: "Performance optimizations improve user experience and system scalability.",
    });

    return phases;
  }

  /**
   * Generate default phases for unclear requests
   */
  private generateDefaultPhases(userPrompt: string, context: RelevantContext, analysis: PromptAnalysis, timestamp: number): Phase[] {
    const relevantFiles = context.files.slice(0, 3).map((f) => f.path);

    return [
      {
        id: `phase-${timestamp}-1`,
        title: "Analyze codebase",
        description: `Perform a comprehensive analysis of the codebase to understand the current state and identify areas for improvement based on: "${userPrompt}"`,
        relevantFiles: relevantFiles,
        dependencies: [],
        estimatedComplexity: "medium",
        priority: "medium",
        category: "improvement",
        reasoning: "Analysis helps understand the current state and plan appropriate actions.",
      },
    ];
  }

  /**
   * Group files by type for better organization
   */
  private groupFilesByType(files: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {
      frontend: [],
      backend: [],
      config: [],
      documentation: [],
      other: [],
    };

    files.forEach((file) => {
      const path = file.path.toLowerCase();
      const language = file.language?.toLowerCase();

      if (language === "typescript" || language === "javascript") {
        if (path.includes("component") || path.includes("page") || path.includes("frontend")) {
          groups.frontend?.push(file);
        } else if (path.includes("controller") || path.includes("service") || path.includes("api")) {
          groups.backend?.push(file);
        } else {
          groups.other?.push(file);
        }
      } else if (language === "json" || language === "yaml") {
        groups.config?.push(file);
      } else if (language === "markdown") {
        groups.documentation?.push(file);
      } else {
        groups.other?.push(file);
      }
    });

    return groups;
  }
}
