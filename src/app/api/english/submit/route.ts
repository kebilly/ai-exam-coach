import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/api/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv } from "@/lib/env";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/^[a-d]\.\s*/i, "");
}

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const body = await request.json();
    const exerciseId = String(body.exercise_id ?? "");
    const userAnswer = String(body.user_answer ?? "").trim();

    if (!exerciseId || !userAnswer) {
      return NextResponse.json({ error: "缺少題目 ID 或答案。" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: exercise, error: fetchError } = await supabase
      .from("english_exercises")
      .select("*")
      .eq("id", exerciseId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const isCorrect = normalize(userAnswer) === normalize(exercise.correct_answer ?? "");
    const { error: updateError } = await supabase
      .from("english_exercises")
      .update({ user_answer: userAnswer, is_correct: isCorrect })
      .eq("id", exerciseId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      is_correct: isCorrect,
      correct_answer: exercise.correct_answer,
      explanation: exercise.explanation,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "English submit failed" }, { status: 500 });
  }
}

