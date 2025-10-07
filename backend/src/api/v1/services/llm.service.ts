// src/services/llmService.ts
import Groq from "groq-sdk";
import { getString } from "../../../libs/env";
import { baseConfig } from "../../../libs/constant";
import { PHASE_GENERATION_SYSTEM_PROMPT } from "../../../libs/prompt/phase-generation.prompt";
import ErrorResponse from "../../../middleware/error-response";
import { Phase, RelevantContext } from "./types";

interface GeneratedPhaseResponse {
  phases: Phase[];
}
export class LLMService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: getString("GROQ_API_KEY"),
    });
  }

  private buildUserPrompt(prompt: string, context: RelevantContext): string {
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
    const response = await this.groq.chat.completions.create({
      model: baseConfig.groq.model,
      messages: [
        { role: "system", content: PHASE_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: this.buildUserPrompt(prompt, context) },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "phases",
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                relevantFiles: {
                  type: "array",
                  items: { type: "string" },
                },
                dependencies: {
                  type: "array",
                  items: { type: "string" },
                },
                estimatedComplexity: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                },
                category: {
                  type: "string",
                  enum: ["bug_fix", "feature", "refactor", "improvement", "documentation"],
                },
                reasoning: { type: "string" },
              },
              required: ["id", "title", "description", "relevantFiles", "dependencies", "estimatedComplexity", "priority", "category", "reasoning"],
              additionalProperties: false,
            },
          },
        },
      },
    });

    const content: GeneratedPhaseResponse = JSON.parse(response.choices[0]?.message?.content || "{}");
    if (!content) {
      throw new ErrorResponse("No content received from LLM", 500);
    }
    return content.phases || [];
  }

  async generateDetailedPlan(phase: any, files: any[]): Promise<string> {
    const prompt = `
      Generate a detailed implementation plan for this phase:
      
      Phase: ${phase.title}
      Description: ${phase.description}
      
      Relevant files:
      ${files
        .map(
          (f) => `
        File: ${f.path}
        Content:
        \`\`\`
        ${f.content.slice(0, 3000)}
        \`\`\`
      `
        )
        .join("\n")}
      
      Provide step-by-step instructions...
    `;

    const completion = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert developer..." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from LLM");
    }
    return content;
  }
}
