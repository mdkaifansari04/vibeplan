import { getString } from "./env";

export const baseConfig = {
  indexName: "vibeplan",
  indexDimension: 1536, // openai embedding dimension
  openai: {
    apiKey: getString("OPENAI_API_KEY")!,
    embeddingModel: "text-embedding-3-small", // faster then text-embedding-3-large
  },
  groq: {
    apiKey: getString("GROQ_API_KEY")!,
    model: "openai/gpt-oss-120b",
  },
};
