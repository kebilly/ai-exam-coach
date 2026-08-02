import { NextResponse } from "next/server";
import { getAuthedUser, getUserRole } from "@/lib/api/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertServerEnv } from "@/lib/env";

export async function GET(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();
    const [users, law, english, usage, inviteCodes] = await Promise.all([
      supabase.from("user_profiles").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("law_submissions").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("english_exercises").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("usage_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase
        .from("member_invite_codes")
        .select("id, label, active, max_uses, used_count, expires_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (users.error) throw users.error;
    if (law.error) throw law.error;
    if (english.error) throw english.error;
    if (usage.error) throw usage.error;
    const inviteCodesUnavailable = inviteCodes.error && ["42P01", "42501"].includes(inviteCodes.error.code ?? "");
    if (inviteCodes.error && !inviteCodesUnavailable) throw inviteCodes.error;

    return NextResponse.json({
      users: users.data ?? [],
      law: law.data ?? [],
      english: english.data ?? [],
      usage: usage.data ?? [],
      inviteCodes: inviteCodesUnavailable ? [] : inviteCodes.data ?? [],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin failed" }, { status: 500 });
  }
}
