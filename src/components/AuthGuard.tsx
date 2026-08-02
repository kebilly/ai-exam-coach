"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function AuthGuard({ children }: { children: (session: Session) => React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const timeout = window.setTimeout(() => {
      if (!alive) return;
      setError("登入狀態讀取逾時，請重新登入。");
      setLoading(false);
    }, 8000);

    supabaseBrowser.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        window.clearTimeout(timeout);
        if (!data.session) {
          setLoading(false);
          router.replace("/login");
          return;
        }
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        window.clearTimeout(timeout);
        setError("無法讀取登入狀態，請重新登入。");
        setLoading(false);
      });

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [router]);

  if (loading) {
    return <div className="panel">載入中...</div>;
  }

  if (error) {
    return (
      <div className="panel space-y-3">
        <p className="text-sm text-red-600">{error}</p>
        <Link className="btn-primary inline-flex" href="/login">
          前往登入
        </Link>
      </div>
    );
  }

  if (!session) return null;
  return <>{children(session)}</>;
}
