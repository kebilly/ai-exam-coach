"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseBrowserConfigured, supabaseBrowser } from "@/lib/supabase/browser";

const text = {
  title: "重設密碼",
  desc: "請輸入新密碼。完成後可以用新密碼登入。",
  password: "新密碼",
  confirmPassword: "確認新密碼",
  update: "更新密碼",
  updating: "更新中...",
  success: "密碼已更新，請重新登入。",
  backLogin: "回登入頁",
  mismatch: "兩次輸入的密碼不一致。",
  missingSupabase:
    "尚未設定 Supabase 連線。請在 .env.local 填入 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY，並重新啟動 npm run dev。",
  failed: "無法更新密碼。請確認你是從最新的密碼重設信連結進入此頁。",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!isSupabaseBrowserConfigured) {
      setLoading(false);
      setError(text.missingSupabase);
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError(text.mismatch);
      return;
    }

    try {
      const { error: updateError } = await supabaseBrowser.auth.updateUser({ password });
      setLoading(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage(text.success);
      window.setTimeout(async () => {
        await supabaseBrowser.auth.signOut({ scope: "local" });
        router.push("/login");
      }, 1200);
    } catch {
      setLoading(false);
      setError(text.failed);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form className="panel w-full max-w-md" onSubmit={onSubmit}>
        <h1 className="text-2xl font-bold text-slate-950">{text.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text.desc}</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          {text.password}
          <input className="field mt-2" minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          {text.confirmPassword}
          <input
            className="field mt-2"
            minLength={6}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        {message ? <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm leading-6 text-green-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">{error}</p> : null}

        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? text.updating : text.update}
        </button>

        <p className="mt-4 text-center text-sm">
          <Link className="font-semibold text-blue-700" href="/login">
            {text.backLogin}
          </Link>
        </p>
      </form>
    </main>
  );
}
