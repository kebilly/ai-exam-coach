"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  vocabulary: "單字",
  grammar: "文法",
  reading: "閱讀",
  cloze: "克漏字",
  translation: "翻譯",
  writing: "寫作",
  full_exam: "完整試卷",
};

const levelLabels: Record<string, string> = {
  basic: "基礎",
  intermediate: "中等",
  advanced: "進階",
};

const text = {
  loading: "載入 Dashboard...",
  badge: "學習儀表板",
  hello: "你好",
  unlockTitle: "啟用正式會員",
  unlockDesc: "目前帳號尚未啟用正式練習功能。請輸入管理者提供的邀請碼；未啟用前無法呼叫民法批改、英文試卷與郵政法規正式練習 API。",
  unlockPlaceholder: "請輸入邀請碼",
  unlockButton: "啟用會員",
  unlocking: "啟用中...",
  unlockSuccess: "正式會員已啟用，可以開始使用正式練習。",
  unlockFailed: "啟用失敗。",
  memberActive: "正式會員已啟用",
  memberActiveDesc: "你可以開始使用民法批改、英文試卷與郵政法規練習。",
  avgLaw: "民法平均分數",
  lawPractice: "民法申論批改",
  startLaw: "開始民法練習",
  englishPractice: "英文考卷練習",
  startEnglish: "開始英文練習",
  postalPractice: "郵政法規練習",
  startPostal: "開始郵政法規練習",
  recentLaw: "最近民法練習",
  recentEnglish: "最近英文練習",
  score: "分數",
  noLaw: "目前還沒有民法練習紀錄。",
  noEnglish: "目前還沒有英文練習紀錄。",
  result: "結果",
  notSubmitted: "未作答",
  correct: "答對",
  wrong: "答錯",
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
      </section>

      {data.profile.role !== "admin" && data.profile.plan !== "member" ? (
        <section className="panel border-blue-100 bg-blue-50">
          <h2 className="font-semibold text-slate-950">{text.unlockTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text.unlockDesc}</p>
          <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={unlockMembership}>
            <input className="field" placeholder={text.unlockPlaceholder} type="password" value={unlockCode} onChange={(event) => setUnlockCode(event.target.value)} />
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="panel">
          <p className="text-sm text-slate-500">{text.avgLaw}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{data.averageLawScore ?? "-"}</p>
        </div>
        <PracticeCard label={text.lawPractice} href="/law" action={text.startLaw} />
        <PracticeCard label={text.englishPractice} href="/english" action={text.startEnglish} />
        <PracticeCard label={text.postalPractice} href="/postal-rules" action={text.startPostal} />
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

function PracticeCard({ label, href, action }: { label: string; href: string; action: string }) {
  return (
    <div className="panel">
      <p className="text-sm text-slate-500">{label}</p>
      <Link className="btn-primary mt-4 w-full" href={href}>
        {action}
      </Link>
    </div>
  );
}
