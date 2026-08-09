import { NextResponse } from "next/server";
import { assertMemberUnlocked, ensureProfile, getAuthedUser } from "@/lib/api/auth";
import { assertUsageAllowed, logUsage } from "@/lib/api/usage";
import { assertServerEnv } from "@/lib/env";
import {
  buildPostalExam,
  seedPostalQuestions,
  usablePostalReviewStatuses,
  type PostalCareerLevel,
  type PostalRuleQuestion,
} from "@/lib/postal-regulations";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const unavailableTableCodes = ["42P01", "42501", "PGRST205"];
const setupRequiredMessage = "郵政法規資料表尚未建立，請先在 Supabase SQL Editor 執行 supabase/schema.sql 與 supabase/security-hardening.sql。";

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
    const formats =
      careerLevel === "professional_1_to_operations"
        ? ["short_answer", "fill_blank", "case_analysis"]
        : ["single_choice"];

    const supabase = createSupabaseAdmin();
    const { data, error: fetchError } = await supabase
      .from("postal_rule_questions")
      .select("*")
      .eq("career_level", careerLevel)
      .in("question_format", formats)
      .in("review_status", usablePostalReviewStatuses)
      .limit(200);

    if (fetchError && !unavailableTableCodes.includes(fetchError.code ?? "")) throw fetchError;

    const approvedOrAutoReviewed = ((data ?? []) as PostalRuleQuestion[]).filter((item) => formats.includes(item.question_format));
    const fallback = seedPostalQuestions.filter((item) => item.career_level === careerLevel && formats.includes(item.question_format));
    const pool = uniqueQuestions([...approvedOrAutoReviewed, ...fallback]);

    if (pool.length < 5) {
      return NextResponse.json(
        {
          error: `郵政法規可用題庫不足，目前只有 ${pool.length} 題。請先到後台產生 seed 題或 AI 題，通過自動檢查後再練習。`,
        },
        { status: 400 },
      );
    }

    const selected = shuffle(pool).slice(0, Math.min(requestedCount, pool.length));
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

function uniqueQuestions(items: PostalRuleQuestion[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.career_level}:${item.question_format}:${item.question.trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
