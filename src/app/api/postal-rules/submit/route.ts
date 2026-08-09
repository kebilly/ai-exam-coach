import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/api/auth";
import { assertServerEnv } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { PostalRulesExam } from "@/types";

const unavailableTableCodes = ["42P01", "42501", "PGRST205"];
const setupRequiredMessage = "郵政法規資料表尚未建立，請先在 Supabase SQL Editor 執行 schema/security SQL。";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const attemptId = String(body.attempt_id ?? "").trim();
    const answers = (body.answers ?? {}) as Record<string, string>;

    if (!attemptId) {
      return NextResponse.json({ error: "缺少郵政法規練習紀錄 ID。" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: attempt, error: fetchError } = await supabase.from("postal_rule_attempts").select("*").eq("id", attemptId).eq("user_id", user.id).single();

    if (fetchError) {
      if (unavailableTableCodes.includes(fetchError.code ?? "")) {
        return NextResponse.json({ error: setupRequiredMessage }, { status: 500 });
      }
      throw fetchError;
    }

    const exam = attempt.exam_json as PostalRulesExam;
    const itemResults = exam.items.map((item) => {
      const rawUserAnswer = String(answers[String(item.item_no)] ?? "").trim();
      const userAnswer = item.question_format === "single_choice" ? rawUserAnswer.toUpperCase() : rawUserAnswer;
      const correctAnswer = item.question_format === "single_choice" ? item.answer.trim().toUpperCase() : item.answer.trim();
      return {
        item_no: item.item_no,
        law_area: item.law_area,
        question: item.question,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isPostalAnswerCorrect(rawUserAnswer, item.answer, item.question_format),
        explanation: item.explanation,
        source_articles: item.source_articles,
      };
    });
    const correctCount = itemResults.filter((item) => item.is_correct).length;
    const totalQuestions = itemResults.length;
    const score = Math.round((correctCount / Math.max(totalQuestions, 1)) * 100);

    const { error: updateError } = await supabase
      .from("postal_rule_attempts")
      .update({
        user_answers: answers,
        score,
        correct_count: correctCount,
        total_questions: totalQuestions,
      })
      .eq("id", attemptId)
      .eq("user_id", user.id);

    if (updateError) {
      if (unavailableTableCodes.includes(updateError.code ?? "")) {
        return NextResponse.json({ error: setupRequiredMessage }, { status: 500 });
      }
      throw updateError;
    }

    return NextResponse.json({ score, correct_count: correctCount, total_questions: totalQuestions, item_results: itemResults });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Postal rules submit failed" }, { status: 500 });
  }
}

function isPostalAnswerCorrect(userAnswer: string, expectedAnswer: string, questionFormat: string) {
  if (questionFormat === "single_choice") return userAnswer.trim().toUpperCase() === expectedAnswer.trim().toUpperCase();

  const normalizedUser = normalizeText(userAnswer);
  if (!normalizedUser) return false;

  const keywords = expectedAnswer
    .split(/[;；、,，/]/)
    .map((item) => normalizeText(item))
    .filter((item) => item.length >= 2 && !["關鍵字", "答案"].includes(item));

  if (!keywords.length) return normalizedUser.includes(normalizeText(expectedAnswer));
  if (questionFormat === "fill_blank") return keywords.some((keyword) => normalizedUser.includes(keyword));

  const matched = keywords.filter((keyword) => normalizedUser.includes(keyword)).length;
  return matched >= Math.ceil(keywords.length * 0.5);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。、「」『』；;：:,.()（）]/g, "");
}
