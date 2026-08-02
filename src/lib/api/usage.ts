import { getUserRole } from "@/lib/api/auth";
import { env } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function getTodayUsage(userId: string, actionType?: string) {
  const supabase = createSupabaseAdmin();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  let query = supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start.toISOString());

  if (actionType) query = query.eq("action_type", actionType);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function assertUsageAllowed(userId: string, actionType?: string) {
  const role = await getUserRole(userId);
  if (role === "admin") return { used: 0, limit: null };

  const limit = getLimitForAction(actionType);
  const used = await getTodayUsage(userId, actionType);
  if (used >= limit) {
    throw new Error(`今日${getActionLabel(actionType)}次數已達上限：${limit} 次。`);
  }

  return { used, limit };
}

export async function logUsage(userId: string, actionType: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("usage_logs").insert({
    user_id: userId,
    action_type: actionType,
  });
  if (error) throw error;
}

function getLimitForAction(actionType?: string) {
  if (actionType === "law_grade") return env.lawDailyLimit;
  if (actionType === "law_ocr") return env.lawOcrDailyLimit;
  if (actionType === "english_generate") return env.englishDailyLimit;
  return env.dailyUsageLimit;
}

function getActionLabel(actionType?: string) {
  if (actionType === "law_grade") return "民法批改";
  if (actionType === "law_ocr") return "民法拍照辨識";
  if (actionType === "english_generate") return "英文考卷生成";
  return "AI 使用";
}
