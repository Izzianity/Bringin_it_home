import { GoogleGenAI } from "@google/genai";
import { getConfig } from "../config/index.js";
import { AppError, InternalError } from "../errors/index.js";

export interface TextGenerator {
  generate(prompt: string, systemInstruction?: string): Promise<string>;
}

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  if (client) return client;
  const c = getConfig();
  if (c.GEMINI_USE_VERTEX) {
    if (!c.GOOGLE_CLOUD_PROJECT) {
      throw new InternalError("GOOGLE_CLOUD_PROJECT is required for Vertex AI");
    }
    client = new GoogleGenAI({
      vertexai: true,
      project: c.GOOGLE_CLOUD_PROJECT,
      location: c.GOOGLE_CLOUD_LOCATION,
    });
  } else {
    if (!c.GEMINI_API_KEY) {
      throw new AppError("AI_UNAVAILABLE", 503, "Gemini is not configured");
    }
    client = new GoogleGenAI({ apiKey: c.GEMINI_API_KEY });
  }
  return client;
}

export const gemini: TextGenerator = {
  async generate(prompt, systemInstruction) {
    try {
      const res = await getClient().models.generateContent({
        model: getConfig().GEMINI_MODEL,
        contents: prompt,
        config: { systemInstruction, maxOutputTokens: 512 },
      });
      return res.text ?? "";
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.error("Gemini request failed:", err);
      throw new AppError("AI_UPSTREAM_ERROR", 502, "AI provider request failed");
    }
  },
};
