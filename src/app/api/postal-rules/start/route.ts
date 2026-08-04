import { NextResponse } from "next/server";
import { assertMemberUnlocked, ensureProfile, getAuthedUser } from "@/lib/api/auth";
import { assertUsageAllowed, logUsage } from "@/lib/api/usage";
import { assertServerEnv } from "@/lib/env";
import { buildPostalExam, seedPostalQuestions, type PostalCareerLevel, type PostalRuleQuestion } from "@/lib/postal-regulations";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const unavailableTableCodes = ["42P01", "42501", "PGRST205"];
const setupRequiredMessage = "郵政法規資料表尚未建立。請先到 Supabase SQL Editor 執行更新後的 supabase/schema.sql 與 supabase/security-hardening.sql。";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);
    await assertMemberUnlocked(user.id);
    await assertUsageAllowed(user.id, "postal_rules_exam");

    const body = await request.json().catch(() => ({}));
    const careerLevel = String(body.career_level ?? "professional_2_to_1") as PostalCareerLevel;
    const requestedCount = Math.max(5, Math.min(Number(body.count ?? 20), 50));

    const supabase = createSupabaseAdmin();
    const { data, error: fetchError } = await supabase
      .from("postal_rule_questions")
      .select("*")
      .eq("career_level", careerLevel)
      .eq("question_format", "single_choice")
      .eq("review_status", "approved")
      .limit(100);

    if (fetchError && !unavailableTableCodes.includes(fetchError.code ?? "")) throw fetchError;

    const approved = ((data ?? []) as PostalRuleQuestion[]).filter((item) => item.options);
    const fallback = seedPostalQuestions.filter((item) => item.career_level === careerLevel && item.question_format === "single_choice");
    const pool = approved.length >= 5 ? approved : fallback;
    const selected = shuffle(pool).slice(0, Math.min(requestedCount, pool.length));

    if (!selected.length) {
      return NextResponse.json({ error: "目前沒有可用的郵政法規題目，請先由管理後台建立或審核題目。" }, { status: 400 });
    }

    const exam = buildPostalExam(selected, careerLevel);
    const questionIds = selected.map((item) => item.id).filter(Boolean);
    const { data: attempt, error: insertError } = await supabase
      .from("postal_rule_attempts")
      .insert({
        user_id: user.id,
        career_level: careerLevel,
        question_ids: questionIds,
        exam_json: exam,
        total_questions: exam.total_questions,
      })
      .select("id")
      .single();

    if (insertError) {
      if (unavailableTableCodes.includes(insertError.code ?? "")) {
        return NextResponse.json({ error: setupRequiredMessage }, { status: 500 });
      }
      throw insertError;
    }

    await logUsage(user.id, "postal_rules_exam");

    return NextResponse.json({ id: attempt.id, ...exam });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Postal rules exam failed" }, { status: 500 });
  }
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
