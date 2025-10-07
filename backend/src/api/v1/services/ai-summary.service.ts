import Groq from "groq-sdk";
import { getString } from "../../../libs/env";
import { baseConfig } from "../../../libs/constant";
import { FILE_DESCRIPTION_SYSTEM_PROMPT } from "../../../libs/prompt/file-summary.prompt";
interface FileForSummary {
  path: string;
  content: string;
  language: string;
  analysis: any;
}

interface AISummaryResult {
  path: string;
  summary: string;
  generated: boolean;
  error?: string;
}

interface BatchConfig {
  concurrency: number;
  rateLimitDelay: number;
  maxRetries: number;
  maxTokensPerMinute: number;
  estimatedTokensPerRequest: number;
}

export class AISummaryService {
  private groq: Groq | null = null;
  private defaultConfig: BatchConfig = {
    concurrency: 3,
    rateLimitDelay: 20000, // 20 seconds between batches to respect TPM
    maxRetries: 3,
    maxTokensPerMinute: 5500, // buffer below 6000 TPM limit
    estimatedTokensPerRequest: 600, // More accurate: ~450 input + 150 output
  };

  constructor() {
    this.groq = new Groq({ apiKey: getString("GROQ_API_KEY") });
  }

  // using groq with rate-limits
  // ref: https://console.groq.com/docs/rate-limits
  async generateSummaries(files: FileForSummary[]): Promise<AISummaryResult[]> {
    const fileCount = files.length;
    const estimatedTokens = fileCount * this.defaultConfig.estimatedTokensPerRequest;

    console.log(`📝 Generating AI summaries for ${fileCount} critical files...`);
    console.log(`🔢 Estimated tokens needed: ${estimatedTokens} (limit: ${this.defaultConfig.maxTokensPerMinute} TPM)`);

    if (fileCount === 0) {
      return [];
    } else if (estimatedTokens <= this.defaultConfig.maxTokensPerMinute && fileCount <= 7) {
      console.log("📦 Processing small batch within token limits...");
      return await this.generateInParallel(files);
    } else {
      console.log("⏱️ Using token-aware rate limiting to respect TPM limits...");
      return await this.generateWithTokenAwareRateLimit(files);
    }
  }

  private async generateInParallel(files: FileForSummary[]): Promise<AISummaryResult[]> {
    console.log(`Processing ${files.length} files in parallel...`);

    const promises = files.map((file) =>
      this.generateSingleSummary(file).catch((error) => ({
        path: file.path,
        summary: "",
        generated: false,
        error: error.message,
      }))
    );

    return await Promise.all(promises);
  }

  private async generateWithTokenAwareRateLimit(files: FileForSummary[]): Promise<AISummaryResult[]> {
    const { maxTokensPerMinute, estimatedTokensPerRequest } = this.defaultConfig;

    const filesPerMinute = Math.floor(maxTokensPerMinute / estimatedTokensPerRequest);
    const batchSize = Math.max(1, Math.min(3, filesPerMinute));

    console.log(`🎯 Token-aware processing: ${batchSize} files per batch, ${estimatedTokensPerRequest} tokens each`);

    const batches = this.chunkArray(files, batchSize);
    const results: AISummaryResult[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (!batch) continue;

      const batchTokens = batch.length * estimatedTokensPerRequest;
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} files, ~${batchTokens} tokens)...`);

      const batchResults: AISummaryResult[] = [];
      for (const file of batch) {
        try {
          const result = await this.generateSingleSummary(file);
          batchResults.push(result);

          if (batch.indexOf(file) < batch.length - 1) {
            await this.sleep(1000);
          }
        } catch (error) {
          batchResults.push({
            path: file.path,
            summary: "",
            generated: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          if (error instanceof Error && error.message.includes("rate_limit_exceeded")) {
            console.log("⚠️ Rate limit hit, waiting 2 minutes...");
            await this.sleep(120000);
          }
        }
      }

      results.push(...batchResults);

      if (i < batches.length - 1) {
        const waitTime = this.defaultConfig.rateLimitDelay;
        console.log(`⏳ Waiting ${waitTime / 1000}s before next batch to respect token limits...`);
        await this.sleep(waitTime);
      }

      console.log(`Batch ${i + 1} complete. Progress: ${results.length}/${files.length}`);
    }

    return results;
  }

  private async generateWithRateLimit(files: FileForSummary[]): Promise<AISummaryResult[]> {
    const { concurrency, rateLimitDelay } = this.defaultConfig;
    const batches = this.chunkArray(files, concurrency);
    const results: AISummaryResult[] = [];

    console.log(`Processing ${files.length} files in ${batches.length} batches of ${concurrency}...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (!batch) continue;

      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} files)...`);

      const batchPromises = batch.map((file) =>
        this.generateSingleSummary(file).catch((error) => ({
          path: file.path,
          summary: "",
          generated: false,
          error: error.message,
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i < batches.length - 1) {
        console.log(`⏳ Waiting ${rateLimitDelay}ms before next batch...`);
        await this.sleep(rateLimitDelay);
      }

      console.log(`Batch ${i + 1} complete. Progress: ${results.length}/${files.length}`);
    }

    return results;
  }

  private async generateInChunks(files: FileForSummary[]): Promise<AISummaryResult[]> {
    // For very large repos, process in smaller chunks with longer delays
    const chunkSize = 50;
    const chunks = this.chunkArray(files, chunkSize);
    const results: AISummaryResult[] = [];

    console.log(`Processing ${files.length} files in ${chunks.length} chunks of ${chunkSize}...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) continue;

      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);

      const chunkResults = await this.generateWithRateLimit(chunk);
      results.push(...chunkResults);

      // Longer delay between chunks for large repos
      if (i < chunks.length - 1) {
        console.log("⏳ Waiting 5 seconds before next chunk...");
        await this.sleep(5000);
      }
    }

    return results;
  }

  private generateSingleSummary = async (file: FileForSummary): Promise<AISummaryResult> => {
    if (!this.groq) {
      throw new Error("Groq client not initialized");
    }

    try {
      const prompt = this.buildSummaryPrompt(file);

      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: FILE_DESCRIPTION_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150, // Reduced from 300 to save tokens
        top_p: 1,
      });

      const summary = completion.choices[0]?.message?.content?.trim() || "";

      if (!summary) {
        throw new Error("Empty response from AI model");
      }

      return {
        path: file.path,
        summary,
        generated: true,
      };
    } catch (error) {
      console.error(`Failed to generate summary for ${file.path}:`, error);
      throw error;
    }
  };

  private buildSummaryPrompt(file: FileForSummary): string {
    const { path, content, language, analysis } = file;

    // Determine file context
    const fileType = this.determineFileType(path);
    const fileContext = this.buildFileContext(path, analysis);

    // Prepare code snippet (smart truncation)
    const codeSnippet = this.prepareCodeSnippet(content, 3000);

    return `Analyze this ${language} ${fileType} and generate a structured technical description.

            ## FILE INFORMATION
            **File Path:** ${path}
            **Language:** ${language}
            **Type:** ${fileType}
            **Functions:** ${analysis.functions?.length || 0}
            **Classes:** ${analysis.classes?.length || 0}
            **Lines of Code:** ${analysis.linesOfCode || 0}
            **Imports:** ${analysis.imports?.slice(0, 8).join(", ") || "None"}

            ## FILE CONTEXT
            ${fileContext}

            ## CODE SNIPPET
            \`\`\`${language}
            ${codeSnippet}
            \`\`\`

            Generate the technical description following the required format.`;
  }

  private buildFileContext(path: string, analysis: any): string {
    const contexts: string[] = [];

    if (path.includes("api/") || path.includes("route.")) {
      contexts.push("- API endpoint handling HTTP requests");
    } else if (path.includes("component") || path.endsWith(".tsx")) {
      contexts.push("- React UI component");
    } else if (path.includes("service")) {
      contexts.push("- Business logic service layer");
    } else if (path.includes("middleware")) {
      contexts.push("- Request/response middleware");
    } else if (path.includes("model")) {
      contexts.push("- Data model or database schema");
    } else if (path.includes("util") || path.includes("helper")) {
      contexts.push("- Utility/helper functions");
    } else if (path.includes("hook")) {
      contexts.push("- Custom React hook");
    }

    if (analysis.complexity > 15) {
      contexts.push(`- HIGH COMPLEXITY WARNING: Cyclomatic complexity = ${analysis.complexity}`);
    }

    if (analysis.functions?.length > 0) {
      contexts.push(`- Exports: ${analysis.functions.slice(0, 5).join(", ")}`);
    }

    return contexts.length > 0 ? contexts.join("\n") : "- General purpose code file";
  }

  private prepareCodeSnippet(content: string, maxChars: number): string {
    if (content.length <= maxChars) {
      return content;
    }

    const lines = content.split("\n");
    let snippet = "";
    let inFunction = false;
    let braceCount = 0;

    for (const line of lines) {
      snippet += line + "\n";

      if (line.includes("function ") || line.includes("const ") || line.includes("class ")) {
        inFunction = true;
      }

      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      if (snippet.length > maxChars && !inFunction && braceCount === 0) {
        break;
      }
    }

    return snippet.slice(0, maxChars * 1.2); // Allow 20% overflow to complete functions
  }

  private determineFileType(path: string): string {
    if (path.includes("api/") || path.includes("route")) return "API endpoint";
    if (path.includes("service")) return "service class";
    if (path.includes("controller")) return "controller";
    if (path.includes("model") || path.includes("schema")) return "data model";
    if (path.includes("middleware")) return "middleware";
    if (path.includes("util") || path.includes("helper")) return "utility module";
    if (path.includes("component")) return "component";
    if (path.includes("auth")) return "authentication module";
    if (path.includes("database") || path.includes("db")) return "database module";
    return "code file";
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private validateSummary(summary: string, file: FileForSummary): boolean {
    if (!summary || summary.length < 10) return false;
    if (summary.length > 1000) return false; // Too long
    if (summary.includes("I cannot") || summary.includes("I am unable")) return false;

    const lowerSummary = summary.toLowerCase();
    const fileName = file.path.split("/").pop()?.toLowerCase() || "";

    return true;
  }

  getProcessingStats(results: AISummaryResult[]): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  } {
    const total = results.length;
    const successful = results.filter((r) => r.generated).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return { total, successful, failed, successRate };
  }
}

export default new AISummaryService();
