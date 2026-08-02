import { NextResponse } from "next/server";
import { assertMemberUnlocked, getAuthedUser, ensureProfile } from "@/lib/api/auth";
import { assertUsageAllowed, logUsage } from "@/lib/api/usage";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv } from "@/lib/env";
import { buildPostalEnglishExam } from "@/lib/postal-question-bank";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);
    await assertMemberUnlocked(user.id);
    await assertUsageAllowed(user.id, "english_generate");

    const body = await request.json();
    const level = String(body.level ?? "postal-ii-to-i");
    const topic = String(body.topic ?? "").trim();

    const exam = buildPostalEnglishExam(level);
    const answerKey = Object.fromEntries(exam.items.map((item) => [String(item.item_no), item.correct_answer]));
    const supabase = createSupabaseAdmin();
    const { data, error: insertError } = await supabase
      .from("english_exercises")
      .insert({
        user_id: user.id,
        level,
        question_type: "full_exam",
        topic,
        question_json: exam,
        correct_answer: JSON.stringify(answerKey),
        explanation: "系統將依整份考卷逐題提供中文解析。",
        weakness_tags: ["full_exam"],
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    await logUsage(user.id, "english_generate");

    return NextResponse.json({ id: data.id, ...exam });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "English generation failed" }, { status: 500 });
  }
}
