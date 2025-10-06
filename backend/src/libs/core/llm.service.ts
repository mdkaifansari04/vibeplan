// src/services/llmService.ts
import Groq from "groq-sdk";
import { getString } from "../env";

export class LLMService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: getString("GROQ_API_KEY"),
    });
  }

  /**
   * Generate text using Groq (fast and free!)
   */
  async generatePhases(prompt: string, context: any): Promise<any> {
    const systemPrompt = `You are a senior software architect...`;

    const completion = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" }, // For structured output
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from LLM");
    }
    return JSON.parse(content);
  }

  /**
   * Generate detailed plan with agentic tool calls
   */
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
