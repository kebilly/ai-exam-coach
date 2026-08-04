"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileQuestion, LockKeyhole, ScrollText, Sparkles, Target } from "lucide-react";

const t = {
  back: "回首頁",
  badge: "靜態展示版",
  memberOnly: "正式練習需登入並啟用會員權限",
  title: "郵政法規概要練習流程展示",
  desc: "這個頁面展示郵政法規概要選擇題的主要流程：選擇職階、依法規範圍練習、作答後查看正解、中文解析與法規來源。正式題庫由後台審核後才會開放練習。",
  formal: "前往正式郵政法規練習",
  setup: "題庫設定範例",
  preview: "題目預覽",
  replay: "重新播放",
  autoPlaying: "正在自動展示作答流程...",
  stepScope: "步驟 1：先確認職階與法規範圍，避免題型混用。",
  stepAnswer: "步驟 2：閱讀題幹，排除過度絕對或與法規制度不符的選項。",
  stepExplain: "步驟 3：顯示正解、中文解析與法規來源，方便回頭複習。",
  answer: "中文解析",
  result: "答對",
  rating: "練習表現",
  explanation:
    "郵件無法投遞時，通常應依郵件種類與處理規則進行通知、招領、退回或其他後續處理，不會一律立即銷毀，也不能直接視為收件人拋棄郵件。因此較適當的答案是 B。",
};

const options = [
  "A. 郵件無法投遞時，一律立即銷毀。",
  "B. 得依規定通知收件人領取、招領或退回寄件人。",
  "C. 只要第一次投遞未成功，即視為收件人拋棄郵件。",
  "D. 所有郵件均不得辦理改投或改寄。",
];

export default function PostalRulesDemoPage() {
  const [stage, setStage] = useState(0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    setStage(0);
    const timers = [
      window.setTimeout(() => setStage(1), 1000),
      window.setTimeout(() => setStage(2), 2600),
      window.setTimeout(() => setStage(3), 4700),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [runId]);

  function replay() {
    setRunId((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-[#f5f9fc] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-cyan-700" href="/">
            <ArrowLeft size={16} />
            {t.back}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            <LockKeyhole size={14} />
            {t.memberOnly}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                <ScrollText size={14} />
                {t.badge}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-normal text-slate-950 sm:text-4xl">{t.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{t.desc}</p>
            </div>
            <Link className="btn-primary justify-center bg-cyan-600 hover:bg-cyan-700" href="/postal-rules">
              {t.formal}
            </Link>
          </div>
        </section>

        <div className="relative grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <CursorGuide stage={stage} />
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-cyan-600 text-white">
                <FileQuestion size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">{t.setup}</h2>
                <p className="text-xs text-slate-500">{stage >= 1 ? t.stepScope : t.autoPlaying}</p>
              </div>
            </div>
            <div className="grid gap-3">
              <DemoField label="職階" value="專業職（二）晉升專業職（一）" />
              <DemoField label="法規範圍" value="郵件處理規則 / 郵務營業規章" />
              <DemoField label="題型" value="單選題，四選一，中文解析" />
              <DemoField label="題庫狀態" value="後台審核通過後才進正式練習" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-primary bg-cyan-600 hover:bg-cyan-700" onClick={replay} type="button">
                <Sparkles size={16} />
                {t.replay}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white">
                <Target size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">{t.preview}</h2>
                <p className="text-xs text-slate-500">Question, answer, source-aware explanation</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question</p>
              <h3 className="mt-2 text-xl font-semibold leading-8 text-slate-950">依郵件處理規則，有關郵件無法投遞後之處理，下列敘述何者較為正確？</h3>
              <div className="mt-4 grid gap-2">
                {options.map((option) => {
                  const isCorrect = stage >= 2 && option.startsWith("B.");
                  return (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        isCorrect ? "border-cyan-200 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-white text-slate-700"
                      }`}
                      key={option}
                    >
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              {stage < 3 ? (
                <WaitingState stage={stage} />
              ) : (
                <div className="space-y-3 animate-in fade-in duration-500">
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-amber-900">{t.rating}</span>
                      <StarRating value={5} max={5} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 font-semibold text-cyan-800">
                    <CheckCircle2 size={18} />
                    {t.result}: B
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-blue-900">
                    <h3 className="mb-2 font-semibold text-blue-950">{t.answer}</h3>
                    {t.explanation}
                    <p className="mt-2 text-xs text-blue-700">來源標記：郵件處理規則 / 投遞、招領、退回相關規範</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <footer className="mx-auto max-w-7xl px-4 pb-6 pt-2 text-xs text-slate-500">
        <div className="border-t border-slate-200 pt-4">© 2026 AI Exam Coach. All rights reserved. Built by KK.</div>
      </footer>
    </main>
  );
}

function WaitingState({ stage }: { stage: number }) {
  const steps = [t.stepScope, t.stepAnswer, t.stepExplain];

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <div className="mb-2 font-semibold text-slate-800">{t.autoPlaying}</div>
      {steps.map((step, index) => (
        <div
          className={`rounded-xl border px-3 py-2 transition ${
            stage >= index ? "border-cyan-100 bg-white text-cyan-900 shadow-sm" : "border-slate-200 bg-slate-100 text-slate-400"
          }`}
          key={step}
        >
          {step}
        </div>
      ))}
    </div>
  );
}

function CursorGuide({ stage }: { stage: number }) {
  if (stage >= 3) return null;

  const positions = ["left-[40%] top-[96px]", "right-[18px] top-[230px]", "right-[18px] top-[390px]"];
  const label = [t.stepScope, t.stepAnswer, t.stepExplain][stage] ?? t.stepScope;

  return (
    <div className={`pointer-events-none absolute z-20 hidden transition-all duration-700 ease-out xl:block ${positions[stage] ?? positions[0]}`} aria-hidden="true">
      <div className="relative">
        <div className="absolute -left-3 -top-3 size-10 animate-ping rounded-full bg-cyan-300/35" />
        <div className="relative flex max-w-56 items-start gap-2">
          <svg className="mt-1 h-6 w-6 shrink-0 drop-shadow" viewBox="0 0 28 28" fill="none">
            <path d="M6 3l15 14-7 1.2L10 25 6 3z" fill="#0891b2" stroke="white" strokeWidth="2" />
          </svg>
          <div className="rounded-lg border border-cyan-100 bg-white/95 px-2.5 py-2 text-[11px] font-semibold leading-4 text-cyan-900 shadow-lg">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarRating({ value, max }: { value: number; max: number }) {
  const stars = Math.max(0, Math.min(5, Math.round((value / max) * 5)));
  return (
    <span className="font-mono text-lg tracking-wide" aria-label={`${stars} / 5`}>
      <span className="text-amber-500">{"\u2605".repeat(stars)}</span>
      <span className="text-slate-300">{"\u2606".repeat(5 - stars)}</span>
    </span>
  );
}

function DemoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
