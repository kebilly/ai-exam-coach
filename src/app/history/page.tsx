"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";

type HistoryData = {
  law: { id: string; question: string; score: number | null; feedback_json: Record<string, unknown>; created_at: string }[];
  english: {
    id: string;
    level: string;
    question_type: string;
    question_json: { question?: string };
    is_correct: boolean | null;
    created_at: string;
  }[];
};

export default function HistoryPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <History session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function History({ session }: { session: Parameters<typeof apiFetch>[0] }) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<HistoryData>(session, "/api/history")
      .then(setData)
      .catch((err) => setError(err.message));
  }, [session]);

  if (error) return <div className="panel text-red-600">{error}</div>;
  if (!data) return <div className="panel">載入紀錄...</div>;

  return (
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">歷史紀錄</h1>
        <p className="mt-2 text-sm text-slate-600">查看自己的民法批改與英文練習紀錄。</p>
      </section>
      <section className="panel">
        <h2 className="font-semibold text-slate-950">民法批改</h2>
        <div className="mt-4 space-y-3">
          {data.law.length ? data.law.map((item) => (
            <details className="rounded-md bg-slate-50 p-3 text-sm" key={item.id}>
              <summary className="cursor-pointer font-medium text-slate-800">
                {item.score ?? "-"} 分 / {new Date(item.created_at).toLocaleString()}
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-slate-700">{item.question}</p>
              <pre className="mt-3 overflow-auto rounded-md bg-white p-3 text-xs text-slate-700">
                {JSON.stringify(item.feedback_json, null, 2)}
              </pre>
            </details>
          )) : <p className="text-sm text-slate-500">尚無紀錄。</p>}
        </div>
      </section>
      <section className="panel">
        <h2 className="font-semibold text-slate-950">英文練習</h2>
        <div className="mt-4 space-y-3">
          {data.english.length ? data.english.map((item) => (
            <div className="rounded-md bg-slate-50 p-3 text-sm" key={item.id}>
              <p className="font-medium text-slate-800">{item.level} / {item.question_type}</p>
              <p className="mt-1 text-slate-600">{item.question_json?.question}</p>
              <p className="mt-1 text-slate-500">結果：{item.is_correct === null ? "未作答" : item.is_correct ? "答對" : "答錯"}</p>
            </div>
          )) : <p className="text-sm text-slate-500">尚無紀錄。</p>}
        </div>
      </section>
    </div>
  );
}

