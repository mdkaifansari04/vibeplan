const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error(" OPENAI_API_KEY is not set in environment variables.");
  process.exit(1);
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function debugApiKey() {
  console.log("🔍 Debugging OpenAI configuration...");
  console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
  console.log("API Key starts with:", process.env.OPENAI_API_KEY?.substring(0, 8) + "...");

  try {
    // Simple test call
    const models = await openai.models.list();
    console.log("OpenAI connection successful, found", models.data.length, "models");
    return true;
  } catch (error) {
    console.error("OpenAI connection failed:", error.message);
    return false;
  }
}

debugApiKey();
