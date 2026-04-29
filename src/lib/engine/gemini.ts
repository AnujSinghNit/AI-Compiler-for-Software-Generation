import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getGeminiModel, hasGeminiKey } from "./config";
import { AppSpecSchema, UserIntentSchema, ArchitectureSchema } from "./schemas";
import type { AppSpec, UserIntent, Architecture } from "./types";

type StructuredSchema = z.ZodTypeAny;

export function hasGemini() {
  return hasGeminiKey();
}

export async function generateIntentWithGemini(prompt: string): Promise<UserIntent> {
  return callStructured("user_intent", UserIntentSchema, [
    "Extract requirements from the prompt.",
    "Return only the structured JSON.",
    `Prompt: ${prompt}`
  ]);
}

export async function generateDesignWithGemini(intent: UserIntent): Promise<Architecture> {
  return callStructured("architecture", ArchitectureSchema, [
    "Create a system architecture based on the intent.",
    JSON.stringify(intent)
  ]);
}

export async function generateSpecWithGemini(design: Architecture): Promise<AppSpec> {
  return callStructured("app_spec", AppSpecSchema, [
    "Generate a complete application specification.",
    JSON.stringify(design)
  ]);
}

async function callStructured<T>(name: string, schema: StructuredSchema, input: string[]): Promise<T> {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const jsonSchema = zodToJsonSchema(schema, name) as any;
  const targetSchema = jsonSchema.definitions?.[name] || jsonSchema;
  
  delete targetSchema.$schema;

  const response = await client.models.generateContent({
    model: getGeminiModel(),
    contents: input.join("\n\n"),
    config: {
      systemInstruction: "Produce data satisfying the JSON Schema. Output ONLY raw JSON.",
      responseMimeType: "application/json",
      responseSchema: targetSchema,
      temperature: 0.1
    }
  });

  const output = response.text;
  if (!output) {
    throw new Error(`Stage ${name} failed: No output`);
  }
  return JSON.parse(output) as T;
}
