import { NextResponse } from "next/server";
import { assertMemberUnlocked, getAuthedUser, ensureProfile } from "@/lib/api/auth";
import { assertUsageAllowed, logUsage } from "@/lib/api/usage";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv } from "@/lib/env";
import { gradeCivilLawEssay, isVerifiedCivilLawRubricId } from "@/lib/civil-law-grading/service";
import { toLegacyFeedback } from "@/lib/civil-law-grading/legacy-adapter";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);
    await assertMemberUnlocked(user.id);
    await assertUsageAllowed(user.id, "law_grade");

    const body = await request.json();
    const question = String(body.question ?? "").trim();
    const answer = String(body.answer ?? "").trim();
    const rubricId = typeof body.rubric_id === "string" ? body.rubric_id.trim() : undefined;

    if (question.length < 5 || answer.length < 10) {
      return NextResponse.json({ error: "請輸入題目與至少 10 字以上的答案。" }, { status: 400 });
    }

    const preliminaryResult = rubricId ? null : await gradeCivilLawEssay({ question, answer });
    const resolvedRubricId = rubricId || preliminaryResult?.grading_diagnostics.rubric_id;
    if (!isVerifiedCivilLawRubricId(resolvedRubricId)) {
      return NextResponse.json(
        { error: "此題尚未建立穩定批改標準，請先使用隨機出題中的已驗證題型，或請管理者新增本題 rubric。" },
        { status: 422 },
      );
    }

    const gradingResult = preliminaryResult ?? await gradeCivilLawEssay({ question, answer, rubricId: resolvedRubricId });
    const feedback = toLegacyFeedback(gradingResult, { mode: "civil-law-rubric-v1" });
    const supabase = createSupabaseAdmin();
    const { data, error: insertError } = await supabase
      .from("law_submissions")
      .insert({
        user_id: user.id,
        question,
        answer,
        score: feedback.score,
        feedback_json: feedback,
        weakness_tags: feedback.next_practice_focus ?? [],
        confidence: feedback.confidence,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    await logUsage(user.id, "law_grade");

    return NextResponse.json({ id: data.id, ...feedback });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Law grading failed" }, { status: 500 });
  }
}
