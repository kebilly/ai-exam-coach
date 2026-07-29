import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/api/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv } from "@/lib/env";

export async function GET(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const supabase = createSupabaseAdmin();
    const [lawRes, englishRes] = await Promise.all([
      supabase
        .from("law_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("english_exercises")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (lawRes.error) throw lawRes.error;
    if (englishRes.error) throw englishRes.error;

    return NextResponse.json({ law: lawRes.data ?? [], english: englishRes.data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "History failed" }, { status: 500 });
  }
}

