import { getUserRole } from "@/lib/api/auth";
import { env } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function getTodayUsage(userId: string, actionType?: string) {
  const supabase = createSupabaseAdmin();
  const start = getTodayStartIso();

  if (actionType === "law_grade") {
    return countRows(supabase.from("law_submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", start));
  }

  if (actionType === "english_generate") {
    return countRows(
      supabase
        .from("english_exercises")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("question_type", "full_exam")
        .gte("created_at", start),
    );
  }

  if (actionType === "postal_rules_exam") {
    return countRows(supabase.from("postal_rule_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", start));
  }

  let query = supabase.from("usage_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", start);
  if (actionType) query = query.eq("action_type", actionType);
  return countRows(query);
}

export async function assertUsageAllowed(userId: string, actionType?: string) {
  const role = await getUserRole(userId);
  if (role === "admin") return { used: 0, limit: null };

  const limit = getLimitForAction(actionType);
  const used = await getTodayUsage(userId, actionType);
  if (used >= limit) {
    throw new Error(`今日${getActionLabel(actionType)}次數已用完，上限為 ${limit} 次。`);
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

function getTodayStartIso() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

async function countRows(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

function getLimitForAction(actionType?: string) {
  if (actionType === "law_grade") return env.lawDailyLimit;
  if (actionType === "law_ocr") return env.lawOcrDailyLimit;
  if (actionType === "english_generate") return env.englishDailyLimit;
  if (actionType === "postal_rules_exam") return env.postalRulesDailyLimit;
  return env.dailyUsageLimit;
}

function getActionLabel(actionType?: string) {
  if (actionType === "law_grade") return "民法批改";
  if (actionType === "law_ocr") return "民法拍照辨識";
  if (actionType === "english_generate") return "英文考卷生成";
  if (actionType === "postal_rules_exam") return "郵政法規練習";
  return "AI 使用";
}
