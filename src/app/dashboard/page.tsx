"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";

type DashboardData = {
  profile: { display_name: string; role: string };
  todayUsage: number;
  dailyLimit: number;
  averageLawScore: number | null;
  recentLaw: { id: string; question: string; score: number | null; created_at: string }[];
  recentEnglish: { id: string; question_type: string; level: string; is_correct: boolean | null; created_at: string }[];
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <Dashboard session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function Dashboard({ session }: { session: Parameters<typeof apiFetch>[0] }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DashboardData>(session, "/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, [session]);

  if (error) return <div className="panel text-red-600">{error}</div>;
  if (!data) return <div className="panel">載入 Dashboard...</div>;

  return (
    <div className="space-y-5">
      <section className="panel">
        <p className="text-sm font-semibold text-blue-700">Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">嗨，{data.profile.display_name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          今日已使用 {data.todayUsage} / {data.dailyLimit} 次 AI 功能。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel">
          <p className="text-sm text-slate-500">民法平均分數</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{data.averageLawScore ?? "-"}</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">民法批改</p>
          <Link className="btn-primary mt-4 w-full" href="/law">
            開始批改
          </Link>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">英文練習</p>
          <Link className="btn-primary mt-4 w-full" href="/english">
            產生題目
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel">
          <h2 className="font-semibold text-slate-950">最近民法紀錄</h2>
          <div className="mt-4 space-y-3">
            {data.recentLaw.length ? (
              data.recentLaw.map((item) => (
                <div className="rounded-md bg-slate-50 p-3 text-sm" key={item.id}>
                  <p className="line-clamp-1 font-medium text-slate-800">{item.question}</p>
                  <p className="mt-1 text-slate-500">分數：{item.score ?? "-"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">尚無紀錄。</p>
            )}
          </div>
        </div>
        <div className="panel">
          <h2 className="font-semibold text-slate-950">最近英文紀錄</h2>
          <div className="mt-4 space-y-3">
            {data.recentEnglish.length ? (
              data.recentEnglish.map((item) => (
                <div className="rounded-md bg-slate-50 p-3 text-sm" key={item.id}>
                  <p className="font-medium text-slate-800">{item.level} / {item.question_type}</p>
                  <p className="mt-1 text-slate-500">結果：{item.is_correct === null ? "未作答" : item.is_correct ? "答對" : "答錯"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">尚無紀錄。</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

