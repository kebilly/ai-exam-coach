import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabaseUrl = env.supabaseUrl || "https://placeholder.supabase.co";
const supabaseAnonKey = env.supabaseAnonKey || "placeholder-anon-key";

export const isSupabaseBrowserConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
