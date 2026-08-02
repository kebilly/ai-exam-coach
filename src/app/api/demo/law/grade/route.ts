import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { gradeCivilLawEssay } from "@/lib/civil-law-grading/service";
import { toLegacyFeedback } from "@/lib/civil-law-grading/legacy-adapter";

export async function POST(request: Request) {
  try {
    if (!env.demoApiEnabled) {
      return NextResponse.json({ error: "Demo API is disabled in production." }, { status: 403 });
    }

    const body = await request.json();
    const question = String(body.question ?? "").trim();
    const answer = String(body.answer ?? "").trim();
    const rubricId = typeof body.rubric_id === "string" ? body.rubric_id.trim() : undefined;

    if (question.length < 5 || answer.length < 1) {
      return NextResponse.json({ error: "請輸入題目與答案。" }, { status: 400 });
    }

    const result = await gradeCivilLawEssay({ question, answer, rubricId });
    return NextResponse.json(toLegacyFeedback(result, { mode: "civil-law-rubric-v1" }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Demo grading failed" }, { status: 500 });
  }
}
