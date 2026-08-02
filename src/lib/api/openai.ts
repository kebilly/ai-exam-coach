import "server-only";
import OpenAI from "openai";
import { env } from "@/lib/env";

export function createOpenAI() {
  return new OpenAI({ apiKey: env.openAiApiKey });
}

export function safeJsonParse<T>(value: string): T {
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
