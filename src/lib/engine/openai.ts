import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getOpenAIModel, hasOpenAIKey } from "./config";
import { AppSpecSchema, UserIntentSchema, ArchitectureSchema } from "./schemas";
import type { AppSpec, UserIntent, Architecture } from "./types";

type StructuredSchema = z.ZodTypeAny;

export function hasOpenAI() {
  return hasOpenAIKey();
}

export async function generateIntentWithOpenAI(prompt: string): Promise<UserIntent> {
  return callStructured("user_intent", UserIntentSchema, [
    "Extract requirements from the prompt.",
    `Prompt: ${prompt}`
  ]);
}

export async function generateDesignWithOpenAI(intent: UserIntent): Promise<Architecture> {
  return callStructured("architecture", ArchitectureSchema, [
    "Create a system architecture based on the intent.",
    JSON.stringify(intent)
  ]);
}

export async function generateSpecWithOpenAI(design: Architecture): Promise<AppSpec> {
  return callStructured("app_spec", AppSpecSchema, [
    "Generate a complete application specification.",
    JSON.stringify(design)
  ]);
}

async function callStructured<T>(name: string, schema: StructuredSchema, input: string[]): Promise<T> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const jsonSchema = zodToJsonSchema(schema, name);
  const response = await client.responses.create({
    model: getOpenAIModel(),
    input: [
      {
        role: "system",
        content: "Produce data satisfying the JSON Schema."
      },
      {
        role: "user",
        content: input.join("\n\n")
      }
    ],
    reasoning: { effort: "low" },
    text: {
      format: {
        type: "json_schema",
        name,
        strict: true,
        schema: jsonSchema as Record<string, unknown>
      }
    }
  } as OpenAI.Responses.ResponseCreateParamsNonStreaming);

  const output = response.output_text;
  if (!output) {
    throw new Error(`Stage ${name} failed: No output`);
  }
  return JSON.parse(output) as T;
}
