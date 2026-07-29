import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { getUserRole } from "@/lib/api/auth";

export async function getTodayUsage(userId: string) {
  const supabase = createSupabaseAdmin();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start.toISOString());

  if (error) throw error;
  return count ?? 0;
}

export async function assertUsageAllowed(userId: string) {
  const role = await getUserRole(userId);
  if (role === "admin") return { used: 0, limit: null };

  const used = await getTodayUsage(userId);
  if (used >= env.dailyUsageLimit) {
    throw new Error(`今日 AI 使用次數已達上限 ${env.dailyUsageLimit} 次。`);
  }

  return { used, limit: env.dailyUsageLimit };
}

export async function logUsage(userId: string, actionType: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("usage_logs").insert({
    user_id: userId,
    action_type: actionType,
  });
  if (error) throw error;
}

