"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { isSupabaseBrowserConfigured, supabaseBrowser } from "@/lib/supabase/browser";

const text = {
  title: "忘記密碼",
  desc: "輸入註冊信箱後，系統會寄送密碼重設連結。請從信件中的連結回到網站設定新密碼。",
  email: "Email",
  send: "寄送重設信",
  sending: "寄送中...",
  sent: "如果此信箱已註冊，系統會寄出密碼重設信。請檢查收件匣與垃圾信件。",
  backLogin: "回登入頁",
  missingSupabase:
    "尚未設定 Supabase 連線。請在 .env.local 填入 NEXT_PUBLIC_SUPABASE_URL 與 NEXT_PUBLIC_SUPABASE_ANON_KEY，並重新啟動 npm run dev。",
  failed: "無法寄送重設信，請確認 Supabase Auth 與 Redirect URL 設定。",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
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

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabaseBrowser.auth.resetPasswordForEmail(email, { redirectTo });
      setLoading(false);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setMessage(text.sent);
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
          {text.email}
          <input className="field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        {message ? <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm leading-6 text-green-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">{error}</p> : null}

        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? text.sending : text.send}
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
