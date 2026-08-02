"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";

type AdminData = {
  users: { id: string; email: string; display_name: string | null; role: string; plan?: string; created_at: string }[];
  law: { id: string; user_id: string; question: string; score: number | null; created_at: string }[];
  english: { id: string; user_id: string; level: string; question_type: string; is_correct: boolean | null; created_at: string }[];
  usage: { id: string; user_id: string; action_type: string; created_at: string }[];
};

const text = {
  title: "\u7ba1\u7406\u5f8c\u53f0",
  desc: "\u67e5\u770b\u4f7f\u7528\u8005\u3001\u4f7f\u7528\u7d00\u9304\u8207 AI \u547c\u53eb\u60c5\u5f62\u3002\u958b\u901a\u8207\u9080\u8acb\u78bc\u7ba1\u7406\u76ee\u524d\u5efa\u8b70\u5148\u7528 Supabase SQL \u57f7\u884c\u3002",
  loading: "\u8f09\u5165 Admin...",
  users: "\u4f7f\u7528\u8005",
  law: "\u6c11\u6cd5\u6279\u6539\u7d00\u9304",
  english: "\u82f1\u6587\u7df4\u7fd2\u7d00\u9304",
  usage: "AI \u4f7f\u7528\u7d00\u9304",
  empty: "\u76ee\u524d\u6c92\u6709\u8cc7\u6599",
  correct: "\u7b54\u5c0d",
  wrong: "\u7b54\u932f",
  notSubmitted: "\u672a\u4f5c\u7b54",
};

export default function AdminPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <Admin session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function Admin({ session }: { session: Parameters<typeof apiFetch>[0] }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<AdminData>(session, "/api/admin/records")
      .then(setData)
      .catch((err) => setError(err.message));
  }, [session]);

  if (error) return <div className="panel text-red-600">{error}</div>;
  if (!data) return <div className="panel">{text.loading}</div>;

  return (
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">{text.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text.desc}</p>
      </section>

      <Table
        title={text.users}
        rows={data.users.map((user) => [
          user.email,
          user.display_name ?? "-",
          user.role,
          user.plan ?? "-",
          new Date(user.created_at).toLocaleString(),
        ])}
      />
      <Table
        title={text.law}
        rows={data.law.map((item) => [
          item.user_id,
          `${item.score ?? "-"} / 100`,
          item.question.slice(0, 60),
          new Date(item.created_at).toLocaleString(),
        ])}
      />
      <Table
        title={text.english}
        rows={data.english.map((item) => [
          item.user_id,
          `${item.level}/${item.question_type}`,
          item.is_correct === null ? text.notSubmitted : item.is_correct ? text.correct : text.wrong,
          new Date(item.created_at).toLocaleString(),
        ])}
      />
      <Table
        title={text.usage}
        rows={data.usage.map((item) => [item.user_id, item.action_type, new Date(item.created_at).toLocaleString()])}
      />
    </div>
  );
}

function Table({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr className="border-t border-slate-200" key={`${title}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td className="px-2 py-3 text-slate-700" key={`${title}-${index}-${cellIndex}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 text-slate-500">{text.empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
