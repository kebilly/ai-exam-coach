"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseBrowserConfigured, supabaseBrowser } from "@/lib/supabase/browser";

const text = {
  title: "\u767b\u5165",
  desc: "\u767b\u5165 AI Exam Coach Beta\uff0c\u67e5\u770b\u7df4\u7fd2\u7d00\u9304\u8207\u6b63\u5f0f\u6703\u54e1\u529f\u80fd\u3002",
  password: "\u5bc6\u78bc",
  login: "\u767b\u5165",
  loggingIn: "\u767b\u5165\u4e2d...",
  noAccount: "\u9084\u6c92\u6709\u5e33\u865f\uff1f",
  register: "\u5efa\u7acb\u5e33\u865f",
  missingSupabase:
    "\u5c1a\u672a\u8a2d\u5b9a Supabase \u9023\u7dda\u3002\u8acb\u5728 .env.local \u586b\u5165 NEXT_PUBLIC_SUPABASE_URL \u8207 NEXT_PUBLIC_SUPABASE_ANON_KEY\uff0c\u4e26\u91cd\u65b0\u555f\u52d5 npm run dev\u3002",
  failed: "\u7121\u6cd5\u9023\u7dda Supabase Auth\u3002\u8acb\u78ba\u8a8d Supabase URL / anon key \u662f\u5426\u6b63\u78ba\uff0c\u6216\u662f\u672c\u6a5f CA / CORS \u8a2d\u5b9a\u3002",
};

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
      setError(text.missingSupabase);
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
      setError(text.failed);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form className="panel w-full max-w-md" onSubmit={onSubmit}>
        <h1 className="text-2xl font-bold text-slate-950">{text.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text.desc}</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input className="field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          {text.password}
          <input className="field mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>

        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">{error}</p> : null}

        <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
          {loading ? text.loggingIn : text.login}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          {text.noAccount}{" "}
          <Link className="font-semibold text-blue-700" href="/register">
            {text.register}
          </Link>
        </p>
      </form>
    </main>
  );
}
