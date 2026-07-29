import { NextResponse } from "next/server";
import { createOpenAI, safeJsonParse } from "@/lib/api/openai";
import { pickPostalEnglishQuestion } from "@/lib/postal-question-bank";
import type { EnglishQuestion } from "@/types";

const systemPrompt = `
You are an English exam question writer.
Generate exactly one exam-style English question based on the requested level, question type, and topic.
The question must have one unambiguous correct answer.
The explanation must be written in Traditional Chinese. It should explain why the correct answer is right and mention a common trap.

Supported question types:
- vocabulary
- grammar
- reading
- cloze

Return JSON only. Do not return Markdown or extra text.
JSON schema:
{
  "level": string,
  "question_type": string,
  "question": string,
  "options": string[],
  "correct_answer": string,
  "explanation": string,
  "knowledge_point": string,
  "difficulty": number
}
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const level = String(body.level ?? "intermediate");
    const questionType = String(body.question_type ?? "grammar");
    const topic = String(body.topic ?? "").trim();

    const useOpenAI = body.mode === "openai";

    if (!useOpenAI || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        ...pickFallback(level, questionType, topic),
        mode: "postal_seed_bank",
      });
    }

    try {
      const openai = createOpenAI();
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Level: ${level}\nQuestion type: ${questionType}\nTopic: ${topic || "general exam English"}`,
          },
        ],
      });

      return NextResponse.json({
        ...safeJsonParse<EnglishQuestion>(completion.choices[0]?.message?.content ?? "{}"),
        mode: "openai",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "OpenAI request failed";
      return NextResponse.json({
        ...pickFallback(level, questionType),
        mode: "demo_bank_openai_failed",
        warning: message,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "English demo generation failed" },
      { status: 500 },
    );
  }
}

function pickFallback(level: string, questionType: string, topic?: string) {
  return pickPostalEnglishQuestion({ level, question_type: questionType, topic });
}
