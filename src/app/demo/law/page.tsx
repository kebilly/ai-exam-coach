"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCheck, FileText, LockKeyhole, Scale, Sparkles } from "lucide-react";

const t = {
  back: "\u56de\u9996\u9801",
  badge: "\u975c\u614b\u5c55\u793a\u7248",
  title: "\u6c11\u6cd5\u7533\u8ad6 AI \u6279\u6539\u6d41\u7a0b\u5c55\u793a",
  desc: "\u9019\u500b\u9801\u9762\u5c55\u793a\u6c11\u6cd5\u7533\u8ad6\u6279\u6539\u7684\u4e3b\u8981\u6d41\u7a0b\uff1a\u5f9e\u984c\u76ee\u89e3\u6790\u3001\u6db5\u651d\u6aa2\u67e5\u5230\u95b1\u5377\u5f0f\u56de\u994b\u3002\u6b63\u5f0f\u7df4\u7fd2\u8acb\u767b\u5165\u5f8c\u7531\u7ba1\u7406\u8005\u555f\u7528\u3002",
  formal: "\u524d\u5f80\u6b63\u5f0f\u6c11\u6cd5\u7df4\u7fd2",
  questionLabel: "\u7bc4\u4f8b\u984c\u76ee",
  answerLabel: "\u7bc4\u4f8b\u7b54\u6848\u7247\u6bb5",
  simulate: "\u64ad\u653e\u6279\u6539\u6a21\u64ec",
  reset: "\u91cd\u7f6e\u5c55\u793a",
  memberOnly: "\u6b63\u5f0f\u7df4\u7fd2\u9700\u767b\u5165\u4e26\u555f\u7528\u6703\u54e1\u6b0a\u9650",
  score: "\u7e3d\u5206",
  rating: "\u6574\u9ad4\u661f\u7b49",
  strengths: "\u4e3b\u8981\u512a\u9ede",
  weaknesses: "\u53ef\u88dc\u5f37\u91cd\u9ede",
  suggestion: "\u4fee\u6b63\u5efa\u8b70",
  autoPlaying: "\u6b63\u5728\u81ea\u52d5\u5c55\u793a\u6279\u6539\u6d41\u7a0b...",
  stepQuestion: "\u6b65\u9a5f 1\uff1a\u5148\u8b80\u984c\uff0c\u5224\u65b7\u672c\u984c\u7684\u8acb\u6c42\u6b0a\u57fa\u790e\u8207\u6838\u5fc3\u722d\u9ede\u3002",
  stepSubsumption: "\u6b65\u9a5f 2\uff1a\u6aa2\u67e5\u7b54\u6848\u6709\u6c92\u6709\u628a\u500b\u6848\u4e8b\u5be6\u5c0d\u61c9\u5230\u6cd5\u5f8b\u8981\u4ef6\u3002",
  stepFeedback: "\u6b65\u9a5f 3\uff1a\u7d71\u6574\u5206\u6578\u3001\u512a\u9ede\u3001\u53ef\u88dc\u5f37\u91cd\u9ede\u8207\u4e0b\u6b21\u4fee\u6b63\u65b9\u5411\u3002",
  replay: "\u91cd\u65b0\u64ad\u653e",
};

const mockQuestion = "\u7532\u4e0d\u614e\u5c07\u4e59\u6240\u6709\u4e4b\u624b\u6a5f\u6454\u58de\uff0c\u4e59\u5f97\u5411\u7532\u4e3b\u5f35\u4f55\u7a2e\u6b0a\u5229\uff1f";
const mockAnswer =
  "\u4e59\u5f97\u4f9d\u6c11\u6cd5\u7b2c184\u689d\u7b2c1\u9805\u524d\u6bb5\u5411\u7532\u8acb\u6c42\u640d\u5bb3\u8ce0\u511f\u3002\u7532\u4e0d\u614e\u6454\u58de\u4e59\u6240\u6709\u4e4b\u624b\u6a5f\uff0c\u4fc2\u904e\u5931\u4e0d\u6cd5\u4fb5\u5bb3\u4e59\u4e4b\u6240\u6709\u6b0a\uff0c\u4e26\u9020\u6210\u624b\u6a5f\u6bc0\u640d\u4e4b\u640d\u5bb3\u3002";

const dimensions = [
  { label: "\u722d\u9ede", score: 21, max: 25 },
  { label: "\u6cd5\u689d", score: 22, max: 25 },
  { label: "\u8ad6\u8b49", score: 24, max: 30 },
  { label: "\u7d50\u8ad6", score: 17, max: 20 },
];

const feedback = {
  score: 84,
  strengths: ["\u80fd\u6b63\u78ba\u638c\u63e1\u6c11\u6cd5\u7b2c184\u689d\u7b2c1\u9805\u524d\u6bb5\u4f5c\u70ba\u8acb\u6c42\u6b0a\u57fa\u790e\u3002", "\u5df2\u5c07\u904e\u5931\u3001\u6b0a\u5229\u4fb5\u5bb3\u3001\u640d\u5bb3\u8207\u56e0\u679c\u95dc\u4fc2\u9023\u7d50\u5230\u500b\u6848\u4e8b\u5be6\u3002"],
  weaknesses: ["\u53ef\u518d\u88dc\u5145\u640d\u5bb3\u8ce0\u511f\u65b9\u6cd5\uff0c\u4f8b\u5982\u4fee\u5fa9\u8cbb\u3001\u50f9\u503c\u6e1b\u640d\u6216\u56de\u5fa9\u539f\u72c0\u3002"],
  suggestion:
    "\u4e0b\u6b21\u53ef\u5728\u7d50\u8ad6\u524d\u589e\u52a0\u4e00\u53e5\uff1a\u300c\u624b\u6a5f\u70ba\u52d5\u7522\uff0c\u5176\u6240\u6709\u6b0a\u5c6c\u6c11\u6cd5\u7b2c184\u689d\u6240\u4fdd\u8b77\u4e4b\u6b0a\u5229\uff0c\u4e59\u5f97\u8acb\u6c42\u4fee\u5fa9\u8cbb\u6216\u50f9\u503c\u6e1b\u640d\u3002\u300d",
};

export default function LawDemoPage() {
  const [stage, setStage] = useState(0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    setStage(0);
    const timers = [
      window.setTimeout(() => setStage(1), 900),
      window.setTimeout(() => setStage(2), 2200),
      window.setTimeout(() => setStage(3), 3900),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [runId]);

  function replay() {
    setRunId((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700" href="/">
            <ArrowLeft size={16} />
            {t.back}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
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
                <Scale size={14} />
                {t.badge}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-normal text-slate-950 sm:text-4xl">{t.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{t.desc}</p>
            </div>
            <Link className="btn-primary justify-center" href="/law">
              {t.formal}
            </Link>
          </div>
        </section>

        <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
          <CursorGuide stage={stage} />
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-sky-600 text-white">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">{t.questionLabel}</h2>
                <p className="text-xs text-slate-500">{stage >= 1 ? t.stepQuestion : t.autoPlaying}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{mockQuestion}</div>
            <h3 className="mt-5 text-sm font-semibold text-slate-700">{t.answerLabel}</h3>
            <div className="mt-2 min-h-48 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">{mockAnswer}</div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={replay} type="button">
                <Sparkles size={16} />
                {t.replay}
              </button>
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {stage < 3 ? <WaitingState stage={stage} /> : <ResultPanel />}
          </aside>
        </div>
      </div>
    </main>
  );
}

function WaitingState({ stage }: { stage: number }) {
  const steps = [t.stepQuestion, t.stepSubsumption, t.stepFeedback];

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <div className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
        <FileText size={17} />
        {t.autoPlaying}
      </div>
      {steps.map((step, index) => (
        <div
          className={`rounded-xl border px-3 py-2 transition ${
            stage >= index ? "border-sky-100 bg-white text-sky-900 shadow-sm" : "border-slate-200 bg-slate-100 text-slate-400"
          }`}
          key={step}
        >
          {step}
        </div>
      ))}
    </div>
  );
}

function ResultPanel() {
  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="rounded-xl bg-sky-50 p-5 text-center">
        <p className="text-sm font-semibold text-sky-700">{t.rating}</p>
        <div className="mt-2 flex justify-center">
          <StarRating value={feedback.score} max={100} />
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-600">{feedback.score} / 100</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {dimensions.map((item) => (
          <ScoreCard key={item.label} {...item} />
        ))}
      </div>
      <List title={t.strengths} items={feedback.strengths} />
      <List title={t.weaknesses} items={feedback.weaknesses} />
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-blue-900">
        <h3 className="mb-2 font-semibold text-blue-950">{t.suggestion}</h3>
        {feedback.suggestion}
      </div>
    </div>
  );
}

function ScoreCard({ label, score, max }: { label: string; score: number; max: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-semibold text-slate-500">{score}/{max}</span>
      </div>
      <div className="mt-2">
        <StarRating value={score} max={max} compact />
      </div>
    </div>
  );
}

function StarRating({ value, max, compact = false }: { value: number; max: number; compact?: boolean }) {
  const stars = Math.max(0, Math.min(5, Math.round((value / max) * 5)));
  return (
    <span className={`font-mono tracking-wide ${compact ? "text-base" : "text-2xl"}`} aria-label={`${stars} / 5`}>
      <span className="text-amber-500">{"\u2605".repeat(stars)}</span>
      <span className="text-slate-300">{"\u2606".repeat(5 - stars)}</span>
    </span>
  );
}

function CursorGuide({ stage }: { stage: number }) {
  if (stage >= 3) return null;

  const positions = [
    "left-[18%] top-[112px]",
    "left-[44%] top-[310px]",
    "left-[74%] top-[150px]",
  ];
  const label = [t.stepQuestion, t.stepSubsumption, t.stepFeedback][stage] ?? t.stepQuestion;

  return (
    <div
      className={`pointer-events-none absolute z-20 hidden transition-all duration-700 ease-out xl:block ${positions[stage] ?? positions[0]}`}
      aria-hidden="true"
    >
      <div className="relative">
        <div className="absolute -left-3 -top-3 size-10 animate-ping rounded-full bg-sky-300/35" />
        <div className="relative flex items-start gap-2">
          <svg className="mt-1 h-7 w-7 drop-shadow" viewBox="0 0 28 28" fill="none">
            <path d="M6 3l15 14-7 1.2L10 25 6 3z" fill="#0284c7" stroke="white" strokeWidth="2" />
          </svg>
          <div className="max-w-64 rounded-xl border border-sky-100 bg-white/95 px-3 py-2 text-xs font-semibold leading-5 text-sky-900 shadow-lg">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li className="flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-900" key={item}>
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
