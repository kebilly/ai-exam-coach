export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  dailyUsageLimit: Number(process.env.DAILY_USAGE_LIMIT ?? "10"),
  lawDailyLimit: Number(process.env.LAW_DAILY_LIMIT ?? "2"),
  lawOcrDailyLimit: Number(process.env.LAW_OCR_DAILY_LIMIT ?? "3"),
  englishDailyLimit: Number(process.env.ENGLISH_DAILY_LIMIT ?? "1"),
  memberUnlockCode: process.env.MEMBER_UNLOCK_CODE ?? "",
  unlockAttemptDailyLimit: Number(process.env.UNLOCK_ATTEMPT_DAILY_LIMIT ?? "10"),
  demoApiEnabled: process.env.DEMO_API_ENABLED === "true" || process.env.NODE_ENV !== "production",
};

export function assertServerEnv() {
  const missing = [];
  if (!env.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!env.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!env.openAiApiKey) missing.push("OPENAI_API_KEY");
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}
