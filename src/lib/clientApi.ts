import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";

export async function apiFetch<T>(session: Session, input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(input, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && data.error === "Invalid session") {
      await supabaseBrowser.auth.signOut({ scope: "local" });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("登入狀態已過期，請重新登入。");
    }
    throw new Error(data.error ?? "Request failed");
  }
  return data as T;
}
