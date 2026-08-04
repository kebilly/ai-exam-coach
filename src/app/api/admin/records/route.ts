import { NextResponse } from "next/server";
import { getAuthedUser, getUserRole } from "@/lib/api/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertSupabaseEnv } from "@/lib/env";

const deletableTables = {
  law: "law_submissions",
  english: "english_exercises",
  postal: "postal_rule_attempts",
  usage: "usage_logs",
} as const;

const unavailableTableCodes = ["42P01", "42501", "PGRST205"];

export async function GET(request: Request) {
  try {
    assertSupabaseEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();
    const [users, law, english, postal, usage, inviteCodes] = await Promise.all([
      supabase.from("user_profiles").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("law_submissions").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("english_exercises").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("postal_rule_attempts").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("usage_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase
        .from("member_invite_codes")
        .select("id, label, active, max_uses, used_count, expires_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (users.error) throw tableError("user_profiles", users.error);
    if (law.error) throw tableError("law_submissions", law.error);
    if (english.error) throw tableError("english_exercises", english.error);
    const postalUnavailable = postal.error && unavailableTableCodes.includes(postal.error.code ?? "");
    if (postal.error && !postalUnavailable) throw tableError("postal_rule_attempts", postal.error);
    if (usage.error) throw tableError("usage_logs", usage.error);
    const inviteCodesUnavailable = inviteCodes.error && unavailableTableCodes.includes(inviteCodes.error.code ?? "");
    if (inviteCodes.error && !inviteCodesUnavailable) throw tableError("member_invite_codes", inviteCodes.error);

    return NextResponse.json({
      users: users.data ?? [],
      law: law.data ?? [],
      english: english.data ?? [],
      postal: postalUnavailable ? [] : postal.data ?? [],
      usage: usage.data ?? [],
      inviteCodes: inviteCodesUnavailable ? [] : inviteCodes.data ?? [],
    });
  } catch (error) {
    return NextResponse.json({ error: formatAdminError(error, "Admin records failed") }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    assertSupabaseEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const recordType = String(body.type ?? "") as keyof typeof deletableTables;
    const id = String(body.id ?? "").trim();
    const table = deletableTables[recordType];

    if (!table || !id) {
      return NextResponse.json({ error: "Invalid delete target" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
    if (deleteError) throw tableError(table, deleteError);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: formatAdminError(error, "Admin delete failed") }, { status: 500 });
  }
}

function tableError(table: string, error: unknown) {
  return new Error(`${table}: ${formatAdminError(error, "Supabase query failed")}`);
}

function formatAdminError(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const item = error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown };
    const parts = [
      typeof item.code === "string" ? `[${item.code}]` : "",
      typeof item.message === "string" ? item.message : "",
      typeof item.details === "string" ? item.details : "",
      typeof item.hint === "string" ? item.hint : "",
    ].filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return fallback;
}
