import { NextResponse } from "next/server";
import { getAuthedUser, ensureProfile } from "@/lib/api/auth";
import { getTodayUsage } from "@/lib/api/usage";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv, env } from "@/lib/env";

export async function GET(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);

    const supabase = createSupabaseAdmin();
    const [profileRes, lawRes, englishRes, usage, lawUsage, englishUsage] = await Promise.all([
      supabase.from("user_profiles").select("id, email, display_name, role, plan").eq("id", user.id).single(),
      supabase
        .from("law_submissions")
        .select("id, score, question, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("english_exercises")
        .select("id, question_type, level, is_correct, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      getTodayUsage(user.id),
      getTodayUsage(user.id, "law_grade"),
      getTodayUsage(user.id, "english_generate"),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (lawRes.error) throw lawRes.error;
    if (englishRes.error) throw englishRes.error;

    const lawScores = (lawRes.data ?? []).map((item) => item.score).filter((score): score is number => typeof score === "number");
    const averageLawScore = lawScores.length
      ? Math.round(lawScores.reduce((sum, score) => sum + score, 0) / lawScores.length)
      : null;

    return NextResponse.json({
      profile: profileRes.data,
      todayUsage: usage,
      dailyLimit: env.dailyUsageLimit,
      todayLawUsage: lawUsage,
      lawDailyLimit: env.lawDailyLimit,
      todayEnglishUsage: englishUsage,
      englishDailyLimit: env.englishDailyLimit,
      averageLawScore,
      recentLaw: lawRes.data ?? [],
      recentEnglish: englishRes.data ?? [],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dashboard failed" }, { status: 500 });
  }
}
