import { getString } from "./env";

export const config = {
  openai: {
    apiKey: getString("OPENAI_API_KEY")!,
    embeddingModel: "text-embedding-3-small", // Cheap and good
  },
  groq: {
    apiKey: getString("GROQ_API_KEY")!,
    model: "llama-3.3-70b-versatile", // Fast and free
  },
};
