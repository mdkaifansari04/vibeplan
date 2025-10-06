// src/services/embeddingService.ts
import OpenAI from "openai";
import { getString } from "../env";

export class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: getString("OPENAI_API_KEY"),
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small", // 1536 dimensions, $0.02/1M tokens
        input: text.slice(0, 8000), // Max ~8K tokens per request
      });

      if (!response.data[0]) {
        throw new Error("No embedding returned from OpenAI");
      }
      return response.data[0].embedding;
    } catch (error) {
      console.error("OpenAI embedding error:", error);
      throw error;
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const batches = this.chunkArray(texts, 100); // 100 per batch
    const allEmbeddings: number[][] = [];

    for (const batch of batches) {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch.map((text) => text.slice(0, 8000)),
      });

      allEmbeddings.push(...response.data.map((d) => d.embedding));
    }

    return allEmbeddings;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
