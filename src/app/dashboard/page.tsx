"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";

type DashboardData = {
  profile: { display_name: string | null; role: string; plan: string };
  todayUsage: number;
  dailyLimit: number;
  averageLawScore: number | null;
  recentLaw: { id: string; question: string; score: number | null; created_at: string }[];
  recentEnglish: { id: string; question_type: string; level: string; is_correct: boolean | null; created_at: string }[];
};

const englishTypeLabels: Record<string, string> = {
  vocabulary: "\u55ae\u5b57",
  grammar: "\u6587\u6cd5",
  reading: "\u95b1\u8b80",
  cloze: "\u514b\u6f0f\u5b57",
  translation: "\u7ffb\u8b6f",
  writing: "\u5beb\u4f5c",
};

const levelLabels: Record<string, string> = {
  basic: "\u57fa\u790e",
  intermediate: "\u4e2d\u7b49",
  advanced: "\u9032\u968e",
};

const text = {
  loading: "\u8f09\u5165 Dashboard...",
  badge: "\u5b78\u7fd2\u5100\u8868\u677f",
  hello: "\u4f60\u597d",
  usagePrefix: "\u4eca\u65e5\u5df2\u4f7f\u7528",
  usageSuffix: "\u6b21\uff0c\u9084\u53ef\u4f7f\u7528",
  times: "\u6b21\u3002",
  unlockTitle: "\u555f\u7528\u6b63\u5f0f\u6703\u54e1",
  unlockDesc:
    "\u76ee\u524d\u5e33\u865f\u5c1a\u672a\u555f\u7528\u6b63\u5f0f\u7df4\u7fd2\u529f\u80fd\u3002\u8acb\u8f38\u5165\u7ba1\u7406\u8005\u63d0\u4f9b\u7684\u9080\u8acb\u78bc\uff1b\u672a\u555f\u7528\u524d\u7121\u6cd5\u547c\u53eb\u6c11\u6cd5\u6279\u6539\u8207\u82f1\u6587\u8003\u5377 API\u3002",
  unlockPlaceholder: "\u8acb\u8f38\u5165\u9080\u8acb\u78bc",
  unlockButton: "\u555f\u7528\u6703\u54e1",
  unlocking: "\u555f\u7528\u4e2d...",
  unlockSuccess: "\u6b63\u5f0f\u6703\u54e1\u5df2\u555f\u7528\uff0c\u53ef\u4ee5\u958b\u59cb\u4f7f\u7528\u6c11\u6cd5\u6279\u6539\u8207\u82f1\u6587\u8003\u5377\u3002",
  unlockFailed: "\u555f\u7528\u5931\u6557\u3002",
  memberActive: "\u6b63\u5f0f\u6703\u54e1\u5df2\u555f\u7528",
  memberActiveDesc: "\u4f60\u53ef\u4ee5\u958b\u59cb\u4f7f\u7528\u6b63\u5f0f\u6c11\u6cd5\u6279\u6539\u8207\u82f1\u6587\u8003\u5377\u3002",
  avgLaw: "\u6c11\u6cd5\u5e73\u5747\u5206\u6578",
  lawPractice: "\u6c11\u6cd5\u7533\u8ad6\u6279\u6539",
  startLaw: "\u958b\u59cb\u6c11\u6cd5\u7df4\u7fd2",
  englishPractice: "\u82f1\u6587\u8003\u5377\u7df4\u7fd2",
  startEnglish: "\u958b\u59cb\u82f1\u6587\u7df4\u7fd2",
  recentLaw: "\u6700\u8fd1\u6c11\u6cd5\u7df4\u7fd2",
  recentEnglish: "\u6700\u8fd1\u82f1\u6587\u7df4\u7fd2",
  score: "\u5206\u6578",
  noLaw: "\u76ee\u524d\u9084\u6c92\u6709\u6c11\u6cd5\u7df4\u7fd2\u7d00\u9304\u3002",
  noEnglish: "\u76ee\u524d\u9084\u6c92\u6709\u82f1\u6587\u7df4\u7fd2\u7d00\u9304\u3002",
  result: "\u7d50\u679c",
  notSubmitted: "\u672a\u4f5c\u7b54",
  correct: "\u7b54\u5c0d",
  wrong: "\u7b54\u932f",
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
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockMessage, setUnlockMessage] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  function reloadDashboard() {
    return apiFetch<DashboardData>(session, "/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    reloadDashboard();
  }, [session]);

  async function unlockMembership(event: React.FormEvent) {
    event.preventDefault();
    setUnlocking(true);
    setError("");
    setUnlockMessage("");
    try {
      await apiFetch<{ ok: boolean; plan: string }>(session, "/api/profile/unlock", {
        method: "POST",
        body: JSON.stringify({ code: unlockCode }),
      });
      setUnlockCode("");
      setUnlockMessage(text.unlockSuccess);
      await reloadDashboard();
    } catch (err) {
      setUnlockMessage(err instanceof Error ? err.message : text.unlockFailed);
    } finally {
      setUnlocking(false);
    }
  }

  const remainingUsage = useMemo(() => {
    if (!data) return 0;
    return Math.max(data.dailyLimit - data.todayUsage, 0);
  }, [data]);

  if (error) return <div className="panel text-red-600">{error}</div>;
  if (!data) return <div className="panel">{text.loading}</div>;

  return (
    <div className="space-y-5">
      <section className="panel">
        <p className="text-sm font-semibold text-blue-700">{text.badge}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">
          {text.hello}
          {data.profile.display_name ? `，${data.profile.display_name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {text.usagePrefix} {data.todayUsage} {text.usageSuffix} {remainingUsage} {text.times}
        </p>
      </section>

      {data.profile.role !== "admin" && data.profile.plan !== "member" ? (
        <section className="panel border-blue-100 bg-blue-50">
          <h2 className="font-semibold text-slate-950">{text.unlockTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text.unlockDesc}</p>
          <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={unlockMembership}>
            <input
              className="field"
              placeholder={text.unlockPlaceholder}
              type="password"
              value={unlockCode}
              onChange={(event) => setUnlockCode(event.target.value)}
            />
            <button className="btn-primary" disabled={unlocking || !unlockCode.trim()} type="submit">
              {unlocking ? text.unlocking : text.unlockButton}
            </button>
          </form>
          {unlockMessage ? <p className="mt-3 text-sm text-blue-800">{unlockMessage}</p> : null}
        </section>
      ) : (
        <section className="panel border-green-100 bg-green-50">
          <p className="text-sm font-semibold text-green-800">{text.memberActive}</p>
          <p className="mt-1 text-sm text-green-700">{text.memberActiveDesc}</p>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel">
          <p className="text-sm text-slate-500">{text.avgLaw}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{data.averageLawScore ?? "-"}</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">{text.lawPractice}</p>
          <Link className="btn-primary mt-4 w-full" href="/law">
            {text.startLaw}
          </Link>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-500">{text.englishPractice}</p>
          <Link className="btn-primary mt-4 w-full" href="/english">
            {text.startEnglish}
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel">
          <h2 className="font-semibold text-slate-950">{text.recentLaw}</h2>
          <div className="mt-4 space-y-3">
            {data.recentLaw.length ? (
              data.recentLaw.map((item) => (
                <div className="rounded-md bg-slate-50 p-3 text-sm" key={item.id}>
                  <p className="line-clamp-1 font-medium text-slate-800">{item.question}</p>
                  <p className="mt-1 text-slate-500">
                    {text.score}: {item.score ?? "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">{text.noLaw}</p>
            )}
          </div>
        </div>
        <div className="panel">
          <h2 className="font-semibold text-slate-950">{text.recentEnglish}</h2>
          <div className="mt-4 space-y-3">
            {data.recentEnglish.length ? (
              data.recentEnglish.map((item) => (
                <div className="rounded-md bg-slate-50 p-3 text-sm" key={item.id}>
                  <p className="font-medium text-slate-800">
                    {levelLabels[item.level] ?? item.level} / {englishTypeLabels[item.question_type] ?? item.question_type}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {text.result}: {item.is_correct === null ? text.notSubmitted : item.is_correct ? text.correct : text.wrong}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">{text.noEnglish}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
