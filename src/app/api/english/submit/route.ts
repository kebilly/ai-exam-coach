import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/api/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv } from "@/lib/env";
import type { EnglishExam } from "@/types";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/^[a-d]\.\s*/i, "");
}

function isExam(value: unknown): value is EnglishExam {
  return Boolean(value && typeof value === "object" && (value as EnglishExam).kind === "postal_english_exam" && Array.isArray((value as EnglishExam).items));
}

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const body = await request.json();
    const exerciseId = String(body.exercise_id ?? "");

    if (!exerciseId) {
      return NextResponse.json({ error: "缺少英文練習 ID。" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: exercise, error: fetchError } = await supabase
      .from("english_exercises")
      .select("*")
      .eq("id", exerciseId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    if (isExam(exercise.question_json)) {
      const exam = exercise.question_json as EnglishExam;
      const answers = (body.answers ?? {}) as Record<string, string>;
      const itemResults = exam.items.map((item) => {
        const userAnswer = String(answers[String(item.item_no)] ?? "").trim();
        const isCorrect = normalize(userAnswer) === normalize(item.correct_answer);
        return {
          item_no: item.item_no,
          section: item.section,
          question_type: item.question_type,
          user_answer: userAnswer,
          is_correct: isCorrect,
          correct_answer: item.correct_answer,
          explanation: item.explanation,
        };
      });
      const correctCount = itemResults.filter((item) => item.is_correct).length;
      const totalQuestions = exam.items.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      const { error: updateError } = await supabase
        .from("english_exercises")
        .update({
          user_answer: JSON.stringify(answers),
          is_correct: correctCount === totalQuestions,
          weakness_tags: [...new Set(itemResults.filter((item) => !item.is_correct).map((item) => item.question_type))],
        })
        .eq("id", exerciseId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        mode: "exam",
        score,
        correct_count: correctCount,
        total_questions: totalQuestions,
        item_results: itemResults,
      });
    }

    const userAnswer = String(body.user_answer ?? "").trim();
    if (!userAnswer) {
      return NextResponse.json({ error: "請先填寫答案。" }, { status: 400 });
    }

    const isCorrect = normalize(userAnswer) === normalize(exercise.correct_answer ?? "");
    const { error: updateError } = await supabase
      .from("english_exercises")
      .update({ user_answer: userAnswer, is_correct: isCorrect })
      .eq("id", exerciseId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      mode: "single",
      is_correct: isCorrect,
      correct_answer: exercise.correct_answer,
      explanation: exercise.explanation,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "English submit failed" }, { status: 500 });
  }
}
