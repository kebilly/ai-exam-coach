"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenCheck, CheckCircle2, FileQuestion, LockKeyhole, Sparkles, Target } from "lucide-react";

const t = {
  back: "\u56de\u9996\u9801",
  badge: "\u975c\u614b\u5c55\u793a\u7248",
  memberOnly: "\u6b63\u5f0f\u7df4\u7fd2\u9700\u767b\u5165\u4e26\u555f\u7528\u6703\u54e1\u6b0a\u9650",
  title: "\u82f1\u6587\u8003\u5377\u7df4\u7fd2\u6d41\u7a0b\u5c55\u793a",
  desc: "\u9019\u500b\u9801\u9762\u5c55\u793a\u82f1\u6587\u8003\u5377\u7df4\u7fd2\u7684\u4e3b\u8981\u6d41\u7a0b\uff1a\u984c\u578b\u8a2d\u5b9a\u3001\u9078\u9805\u5224\u65b7\u3001\u7b54\u6848\u56de\u994b\u8207\u4e2d\u6587\u89e3\u6790\u3002\u6b63\u5f0f\u8003\u5377\u8acb\u767b\u5165\u5f8c\u7531\u7ba1\u7406\u8005\u555f\u7528\u3002",
  formal: "\u524d\u5f80\u6b63\u5f0f\u82f1\u6587\u7df4\u7fd2",
  setup: "\u984c\u578b\u8a2d\u5b9a\u7bc4\u4f8b",
  preview: "\u984c\u76ee\u9810\u89bd",
  play: "\u64ad\u653e\u4f5c\u7b54\u6a21\u64ec",
  reset: "\u91cd\u7f6e\u5c55\u793a",
  replay: "\u91cd\u65b0\u64ad\u653e",
  autoPlaying: "\u6b63\u5728\u81ea\u52d5\u5c55\u793a\u4f5c\u7b54\u6d41\u7a0b...",
  stepQuestion: "\u6b65\u9a5f 1\uff1a\u5148\u8b80\u984c\uff0c\u5224\u65b7\u53e5\u5b50\u8981\u6e2c\u9a57\u7684\u6587\u6cd5\u9ede\u3002",
  stepAnswer: "\u6b65\u9a5f 2\uff1a\u5c0d\u7167\u56db\u500b\u9078\u9805\uff0c\u6392\u9664\u4e0d\u7b26\u5408\u7528\u6cd5\u7684\u7b54\u6848\u3002",
  stepExplain: "\u6b65\u9a5f 3\uff1a\u986f\u793a\u6b63\u89e3\u8207\u4e2d\u6587\u89e3\u6790\uff0c\u8b93\u5b78\u751f\u77e5\u9053\u932f\u5728\u54ea\u88e1\u3002",
  answer: "\u4e2d\u6587\u89e3\u6790",
  result: "\u7b54\u5c0d",
  rating: "\u7df4\u7fd2\u8868\u73fe",
  explanation:
    "remember \u5f8c\u9762\u82e5\u63a5\u300c\u8981\u8a18\u5f97\u53bb\u505a\u67d0\u4e8b\u300d\uff0c\u8981\u7528 remember to + \u539f\u578b\u52d5\u8a5e\u3002\u56e0\u6b64\u6b63\u78ba\u7b54\u6848\u662f to apply\u3002",
};

const options = ["A. apply", "B. applying", "C. applied", "D. to apply"];

export default function EnglishDemoPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
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
                <BookOpenCheck size={14} />
                {t.badge}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-normal text-slate-950 sm:text-4xl">{t.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{t.desc}</p>
            </div>
            <Link className="btn-primary justify-center bg-emerald-600 hover:bg-emerald-700" href="/english">
              {t.formal}
            </Link>
          </div>
        </section>

        <div className="relative grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <CursorGuide stage={stage} />
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
                <FileQuestion size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">{t.setup}</h2>
                <p className="text-xs text-slate-500">{stage >= 1 ? t.stepQuestion : t.autoPlaying}</p>
              </div>
            </div>
            <div className="grid gap-3">
              <DemoField label="Level" value="Postal promotion / intermediate" />
              <DemoField label="Question type" value="Grammar + vocabulary + reading" />
              <DemoField label="Daily limit" value="1 paper / day after member activation" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn-primary bg-emerald-600 hover:bg-emerald-700" onClick={replay} type="button">
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
                <p className="text-xs text-slate-500">Question, answer, Chinese explanation</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question</p>
              <h3 className="mt-2 text-xl font-semibold leading-8 text-slate-950">Please remember _____ the application form before Friday.</h3>
              <div className="mt-4 grid gap-2">
                {options.map((option) => {
                  const isCorrect = stage >= 2 && option.startsWith("D.");
                  return (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"
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
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
                    <CheckCircle2 size={18} />
                    {t.result}: D. to apply
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-blue-900">
                    <h3 className="mb-2 font-semibold text-blue-950">{t.answer}</h3>
                    {t.explanation}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function WaitingState({ stage }: { stage: number }) {
  const steps = [t.stepQuestion, t.stepAnswer, t.stepExplain];

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      <div className="mb-2 font-semibold text-slate-800">{t.autoPlaying}</div>
      {steps.map((step, index) => (
        <div
          className={`rounded-xl border px-3 py-2 transition ${
            stage >= index ? "border-emerald-100 bg-white text-emerald-900 shadow-sm" : "border-slate-200 bg-slate-100 text-slate-400"
          }`}
          key={step}
        >
          {step}
        </div>
      ))}
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

function CursorGuide({ stage }: { stage: number }) {
  if (stage >= 3) return null;

  const positions = [
    "left-[48%] top-[115px]",
    "left-[70%] top-[250px]",
    "left-[70%] top-[405px]",
  ];
  const label = [t.stepQuestion, t.stepAnswer, t.stepExplain][stage] ?? t.stepQuestion;

  return (
    <div
      className={`pointer-events-none absolute z-20 hidden transition-all duration-700 ease-out xl:block ${positions[stage] ?? positions[0]}`}
      aria-hidden="true"
    >
      <div className="relative">
        <div className="absolute -left-3 -top-3 size-10 animate-ping rounded-full bg-emerald-300/35" />
        <div className="relative flex items-start gap-2">
          <svg className="mt-1 h-7 w-7 drop-shadow" viewBox="0 0 28 28" fill="none">
            <path d="M6 3l15 14-7 1.2L10 25 6 3z" fill="#059669" stroke="white" strokeWidth="2" />
          </svg>
          <div className="max-w-64 rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-xs font-semibold leading-5 text-emerald-900 shadow-lg">
            {label}
          </div>
        </div>
      </div>
    </div>
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
