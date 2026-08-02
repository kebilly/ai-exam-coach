import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function getAuthedUser(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { user: null, error: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
  }

  return { user: data.user, error: null };
}

export async function ensureProfile(user: { id: string; email?: string | null }, displayName?: string) {
  const supabase = createSupabaseAdmin();
  await supabase.from("user_profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    display_name: displayName ?? user.email?.split("@")[0] ?? "User",
  });
}

export async function getUserRole(userId: string) {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return data?.role ?? "user";
}

export async function getUserProfile(userId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, email, display_name, role, plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function assertMemberUnlocked(userId: string) {
  const profile = await getUserProfile(userId);
  if (profile?.role === "admin" || profile?.plan === "member") return profile;

  throw new Error("帳號尚未啟用正式會員。請先在 Dashboard 輸入解鎖碼，或請管理者協助開通。");
}
