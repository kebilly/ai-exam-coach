"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseBrowserConfigured, supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseBrowserConfigured) {
      setLoading(false);
      setError("尚未設定 Supabase 連線。請先在 .env.local 填入 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY，並重新啟動 npm run dev。");
      return;
    }

    try {
      const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push("/dashboard");
    } catch {
      setLoading(false);
      setError("無法連線到 Supabase Auth。請確認 Supabase URL / anon key 是否正確，並檢查本機網路或 CORS 設定。");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form className="panel w-full max-w-md" onSubmit={onSubmit}>
        <h1 className="text-2xl font-bold text-slate-950">登入</h1>
        <p className="mt-2 text-sm text-slate-600">登入 AI Exam Coach Beta，查看練習紀錄與正式會員功能。</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input className="field mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          密碼
          <input className="field mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? "登入中..." : "登入"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          還沒有帳號？{" "}
          <Link className="font-semibold text-blue-700" href="/register">
            建立帳號
          </Link>
        </p>
      </form>
    </main>
  );
}
