export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
export const DEFAULT_GEMINI_MODEL = "gemini-3-flash";

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
