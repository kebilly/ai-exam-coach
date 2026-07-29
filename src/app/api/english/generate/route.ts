import { NextResponse } from "next/server";
import { getAuthedUser, ensureProfile } from "@/lib/api/auth";
import { assertUsageAllowed, logUsage } from "@/lib/api/usage";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv } from "@/lib/env";
import { pickPostalEnglishQuestion } from "@/lib/postal-question-bank";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);
    await assertUsageAllowed(user.id);

    const body = await request.json();
    const level = String(body.level ?? "intermediate");
    const questionType = String(body.question_type ?? "grammar");
    const topic = String(body.topic ?? "").trim();

    const question = pickPostalEnglishQuestion({ level, question_type: questionType, topic });
    const supabase = createSupabaseAdmin();
    const { data, error: insertError } = await supabase
      .from("english_exercises")
      .insert({
        user_id: user.id,
        level,
        question_type: questionType,
        topic,
        question_json: question,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        weakness_tags: [question.knowledge_point].filter(Boolean),
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    await logUsage(user.id, "english_generate");

    return NextResponse.json({ id: data.id, ...question });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "English generation failed" }, { status: 500 });
  }
}
