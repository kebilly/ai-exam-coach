import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { ensureProfile, getAuthedUser } from "@/lib/api/auth";
import { getTodayUsage, logUsage } from "@/lib/api/usage";
import { assertServerEnv, env } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);

    const body = await request.json().catch(() => ({}));
    const code = String(body.code ?? "").trim();
    const attempts = await getTodayUsage(user.id, "member_unlock_attempt");

    if (attempts >= env.unlockAttemptDailyLimit) {
      return NextResponse.json({ error: "今日啟用嘗試次數已達上限，請稍後再試或聯絡管理者。" }, { status: 429 });
    }

    await logUsage(user.id, "member_unlock_attempt");

    if (!code) {
      return NextResponse.json({ error: "請輸入會員啟用碼。" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const inviteResult = await tryUseInviteCode(supabase, code, user.id);
    if (inviteResult.ok) {
      return NextResponse.json({ ok: true, plan: "member", mode: "invite_code" });
    }

    if (env.memberUnlockCode && code === env.memberUnlockCode) {
      await activateMember(supabase, user.id);
      return NextResponse.json({ ok: true, plan: "member", mode: "shared_code" });
    }

    return NextResponse.json({ error: "啟用碼不正確，或此邀請碼已被使用。" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unlock failed" }, { status: 500 });
  }
}

async function tryUseInviteCode(supabase: ReturnType<typeof createSupabaseAdmin>, code: string, userId: string) {
  const codeHash = createHash("sha256").update(code).digest("hex");
  const { data, error } = await supabase
    .from("member_invite_codes")
    .select("id, active, max_uses, used_count, used_by, expires_at")
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (error && error.code === "42P01") return { ok: false };
  if (error) throw error;
  if (!data) return { ok: false };
  if (!data.active) return { ok: false };
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return { ok: false };
  if (Number(data.used_count) >= Number(data.max_uses)) return { ok: false };

  const nextUsedCount = Number(data.used_count) + 1;
  const usedBy = Array.isArray(data.used_by) ? data.used_by : [];

  const { data: updatedCode, error: updateError } = await supabase
    .from("member_invite_codes")
    .update({
      used_count: nextUsedCount,
      used_by: [...usedBy, userId],
      active: nextUsedCount < Number(data.max_uses),
    })
    .eq("id", data.id)
    .eq("used_count", data.used_count)
    .select("id")
    .maybeSingle();

  if (updateError) throw updateError;
  if (!updatedCode) return { ok: false };

  await activateMember(supabase, userId);
  return { ok: true };
}

async function activateMember(supabase: ReturnType<typeof createSupabaseAdmin>, userId: string) {
  const { error } = await supabase.from("user_profiles").update({ plan: "member" }).eq("id", userId);
  if (error) throw error;
}
