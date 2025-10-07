import OpenAI from "openai";
import { getString } from "../../../libs/env";
import { baseConfig } from "../../../libs/constant";

export class EmbeddingService {
  private openai: OpenAI;
  private dimension = baseConfig.indexDimension;
  constructor() {
    this.openai = new OpenAI({
      apiKey: getString("OPENAI_API_KEY"),
    });
  }

  async getEmbedding(text: string) {
    try {
      const response = await this.openai.embeddings.create({
        model: baseConfig.openai.embeddingModel,
        input: text,
      });
      return response.data[0]?.embedding || new Array(this.dimension).fill(0);
    } catch (error) {
      console.error("Error fetching embedding:", error);
      throw error;
    }
  }
}
