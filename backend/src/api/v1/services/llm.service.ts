// src/services/llmService.ts
import Groq from "groq-sdk";
import { getString } from "../../../libs/env";
import { baseConfig } from "../../../libs/constant";
import { PHASE_GENERATION_SYSTEM_PROMPT } from "../../../libs/prompt/phase-generation.prompt";
import ErrorResponse from "../../../middleware/error-response";
import { Phase, RelevantContext } from "./types";
import { GeneratePlanPayload, PayloadPhase, RelevantFile } from "../controller/type";
import { VectorService } from "./vector.service";
import { EmbeddingService } from "./embedding.service";
import { logger } from "../../../libs/logger";
import z from "zod";
import { PLAN_GENERATION_PROMPT } from "../../../libs/prompt/plan-generation.prompt";

export const phaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  relevantFiles: z.array(z.string()),
  dependencies: z.array(z.string()),
  estimatedComplexity: z.enum(["low", "medium", "high"]),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["bug_fix", "feature", "refactor", "improvement", "documentation"]),
  reasoning: z.string(),
});

export const phasesSchema = z.object({
  phases: z.array(phaseSchema),
});

type phaseResponse = z.infer<typeof phasesSchema>;

interface DetailedPlanResponse {
  plan: string;
  instruction: string;
}

export class LLMService {
  private groq: Groq;
  private vectorService: VectorService;
  private embeddingService: EmbeddingService;

  constructor() {
    this.groq = new Groq({
      apiKey: getString("GROQ_API_KEY"),
    });
    this.vectorService = new VectorService();
    this.embeddingService = new EmbeddingService();
  }

  private buildUserPromptForPhases(prompt: string, context: RelevantContext): string {
    let contextSummary = `Context Summary:\n- Total Files: ${context.totalFilesFound}\n`;
    const languages = [...new Set(context.files.map((f: any) => f.language).filter(Boolean))];

    if (languages.length) {
      contextSummary += `- Languages: ${languages.join(", ")}\n`;
    }
    const fileTypes = [...new Set(context.files.map((f: any) => f.path.split(".").pop()).filter(Boolean))];
    if (fileTypes.length) {
      contextSummary += `- File Types: ${fileTypes.join(", ")}\n`;
    }

    return `
      You are an expert software developer and project planner. Based on the user prompt and the following context summary, generate a list of atomic development phases needed to implement the requested feature or change.

      ${contextSummary}

      User Prompt: ${prompt}

      Instructions:
      - Break down the implementation into clear, manageable phases.
      - Each phase should have a unique ID, title, description, relevant files, dependencies, estimated complexity (low, medium, high), priority (low, medium, high), category (bug_fix, feature, refactor, improvement, documentation), and reasoning.
      - Ensure phases are actionable and can be assigned to developers.

      Provide the output in JSON format as an array of phases.
    `;
  }

  async generatePhases(prompt: string, context: RelevantContext): Promise<Phase[]> {
    try {
      const response = await this.groq.chat.completions.create({
        model: baseConfig.groq.model,
        messages: [
          { role: "system", content: PHASE_GENERATION_SYSTEM_PROMPT },
          { role: "user", content: this.buildUserPromptForPhases(prompt, context) },
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "phaseResponse",
            schema: z.toJSONSchema(phaseSchema),
          },
        },
      });

      const content: phaseResponse = JSON.parse(response.choices[0]?.message?.content || "{}");
      if (!content) {
        throw new ErrorResponse("No content received from LLM", 500);
      }
      return content.phases || [];
    } catch (error) {
      throw new ErrorResponse("Failed to generate phases", 500);
      logger.error(`[LLM Service]: Error => ${error}`);
    }
  }

  async generateDetailedPlan({ phase, topRelevantFiles, namespace }: GeneratePlanPayload): Promise<DetailedPlanResponse> {
    try {
      // Limit search query length to reduce token usage
      const descriptionSnippet = phase.description.substring(0, 50);
      const filePathsSnippet = topRelevantFiles
        .slice(0, 3)
        .map((f) => f.path)
        .join(" ");
      const searchQuery = `${phase.title} ${phase.category} ${descriptionSnippet} ${filePathsSnippet}`;
      console.log("Vector search for:", searchQuery);

      const relevantContext = await this.vectorService.findRelevantContext(namespace, searchQuery, "feature");
      console.log("relevantContext", relevantContext);

      const userPrompt = this.buildSimpleUserPrompt(phase, relevantContext, topRelevantFiles);

      const completion = await this.groq.chat.completions.create({
        model: baseConfig.groq.model,
        messages: [
          { role: "system", content: PLAN_GENERATION_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000, // Reduced from 12000 to stay well under limit
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "detailed_plan_response",
            schema: {
              type: "object",
              properties: {
                plan: {
                  type: "string",
                  description: "Descriptive implementation plan for LLM",
                },
                instruction: {
                  type: "string",
                  description: "Brief coding instruction (max 600 characters)",
                  maxLength: 600,
                },
              },
              required: ["plan", "instruction"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from LLM");
      }

      const response: DetailedPlanResponse = JSON.parse(content);
      return response;
    } catch (error) {
      console.error("Error generating detailed plan:", error);
      throw new ErrorResponse("Failed to generate detailed plan", 500);
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "... [truncated]";
  }

  private buildSimpleUserPrompt(phase: PayloadPhase, relevantContext: RelevantContext, topRelevantFiles: RelevantFile[]): string {
    const contextFiles = relevantContext.files.slice(0, 3);

    // Limit file content to prevent token overflow
    const filesList =
      contextFiles.length > 0
        ? contextFiles
            .map((f) => {
              const fileCode = f.metadata?.fullCode || "";
              const truncatedCode = this.truncateText(fileCode, 500); // Limit to 500 chars per file
              return `- ${f.path} (${f.language})\n  ${truncatedCode}`;
            })
            .join("\n")
        : "No relevant files found";

    // Truncate description if too long
    const truncatedDescription = this.truncateText(phase.description, 300);

    return `Generate a descriptive implementation plan for this phase:
            **Phase:** ${phase.title}
            **Category:** ${phase.category}
            **Priority:** ${phase.priority}
            **Complexity:** ${phase.estimatedComplexity}

            **Description:**
            ${truncatedDescription}

            **Available Files:**
            ${filesList}

            Requirements:
            - Focus on key implementation steps
            - Be specific and actionable

            Provide both a brief implementation plan and coding instruction in JSON format.`;
  }
}
