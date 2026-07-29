"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";

type AdminData = {
  users: { id: string; email: string; display_name: string; role: string; created_at: string }[];
  law: { id: string; user_id: string; question: string; score: number | null; created_at: string }[];
  english: { id: string; user_id: string; level: string; question_type: string; is_correct: boolean | null; created_at: string }[];
  usage: { id: string; user_id: string; action_type: string; created_at: string }[];
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
  if (!data) return <div className="panel">載入 Admin...</div>;

  return (
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">Admin</h1>
        <p className="mt-2 text-sm text-slate-600">查看內測使用者、AI 使用紀錄與練習結果。</p>
      </section>
      <Table title="使用者" rows={data.users.map((u) => [u.email, u.display_name, u.role, new Date(u.created_at).toLocaleString()])} />
      <Table title="民法提交" rows={data.law.map((l) => [l.user_id, `${l.score ?? "-"} 分`, l.question.slice(0, 60), new Date(l.created_at).toLocaleString()])} />
      <Table title="英文練習" rows={data.english.map((e) => [e.user_id, `${e.level}/${e.question_type}`, e.is_correct === null ? "未作答" : e.is_correct ? "答對" : "答錯", new Date(e.created_at).toLocaleString()])} />
      <Table title="AI 使用紀錄" rows={data.usage.map((u) => [u.user_id, u.action_type, new Date(u.created_at).toLocaleString()])} />
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
            {rows.length ? rows.map((row, index) => (
              <tr className="border-t border-slate-200" key={`${title}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td className="px-2 py-3 text-slate-700" key={`${title}-${index}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            )) : (
              <tr><td className="py-3 text-slate-500">尚無資料。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

