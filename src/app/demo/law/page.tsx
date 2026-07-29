"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  Loader2,
  Scale,
  Shuffle,
  Sparkles,
  Target,
} from "lucide-react";
import { pickPostalLawQuestion } from "@/lib/postal-question-bank";
import type { LawFeedback } from "@/types";

const defaultQuestion = "甲不慎將乙所有之手機摔壞，乙得向甲主張何種權利？";

const defaultAnswer =
  "乙得依民法第184條第1項前段向甲請求損害賠償。甲不慎摔壞乙所有之手機，主觀上至少有過失，客觀上侵害乙之所有權，並造成手機毀損之損害，且甲之行為與損害間具有因果關係。因此乙得向甲請求賠償手機價值或修復費用。";

const rubricItems = [
  { label: "爭點掌握", value: "25%", tone: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "法條基礎", value: "25%", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { label: "論證涵攝", value: "30%", tone: "bg-violet-50 text-violet-700 border-violet-100" },
  { label: "結論完整", value: "20%", tone: "bg-amber-50 text-amber-700 border-amber-100" },
];

type LawQuestionBankItem = {
  rubric_id?: string;
  topic: string;
  difficulty: string;
  question: string;
  hint: string;
};

const lawQuestionBank: LawQuestionBankItem[] = [
  {
    rubric_id: "civil_law_tort_184",
    topic: "侵權行為",
    difficulty: "基礎",
    question: "甲不慎將乙所有之手機摔壞，乙得向甲主張何種權利？",
    hint: "可從民法第184條第1項前段、所有權侵害、過失、損害與因果關係切入。",
  },
  {
    rubric_id: "civil_law_unjust_enrichment_179",
    topic: "不當得利",
    difficulty: "基礎",
    question: "甲誤將新台幣一萬元匯入乙之帳戶，乙知情後仍拒絕返還。甲得向乙主張何種權利？",
    hint: "可思考給付型不當得利、無法律上原因、受有利益與返還範圍。",
  },
  {
    rubric_id: "civil_law_sale_defect",
    topic: "契約責任",
    difficulty: "中等",
    question: "甲向乙購買中古筆電一台，乙承諾交付功能正常之筆電，惟交付後發現無法開機。甲得向乙主張何種權利？",
    hint: "可從買賣契約、瑕疵擔保、債務不履行與救濟方式切入。",
  },
  {
    topic: "所有物返還",
    difficulty: "基礎",
    question: "甲將腳踏車借予乙使用三日，期限屆滿後乙拒絕返還。甲得向乙主張何種權利？",
    hint: "可思考所有物返還請求權、占有權源消滅與契約返還義務。",
  },
  {
    topic: "代理",
    difficulty: "中等",
    question: "甲未授權乙代理購買機車，乙卻以甲代理人名義向丙購買機車。丙得否向甲主張契約效力？",
    hint: "可從無權代理、本人承認、相對人催告與撤回等方向分析。",
  },
  {
    rubric_id: "civil_law_article_88_error_revocation",
    topic: "意思表示",
    difficulty: "中等",
    question: "甲因重大誤認商品真實價格而向乙表示願以高價購買，事後發現錯誤。甲得否撤銷意思表示？",
    hint: "可從錯誤意思表示、交易上重要性、表意人過失與撤銷效果切入。",
  },
  {
    topic: "租賃",
    difficulty: "中等",
    question: "甲承租乙之房屋，因屋頂漏水導致甲之家具受損。甲得向乙主張何種權利？",
    hint: "可思考出租人修繕義務、債務不履行、損害賠償與租金減免。",
  },
  {
    topic: "共有",
    difficulty: "進階",
    question: "甲、乙共有一筆土地，甲未經乙同意即將土地全部出租予丙。乙得主張何種權利？",
    hint: "可從共有物管理、無權處分或無權占有、出租契約效力與返還請求分析。",
  },
];

type FeedbackState = LawFeedback & {
  mode?: string;
  warning?: string;
};

export default function LawDemoPage() {
  const [question, setQuestion] = useState(defaultQuestion);
  const [answer, setAnswer] = useState(defaultAnswer);
  const [selectedRubricId, setSelectedRubricId] = useState<string | undefined>("civil_law_tort_184");
  const [practiceMeta, setPracticeMeta] = useState({
    topic: "侵權行為",
    difficulty: "基礎",
    hint: "可從民法第184條第1項前段、所有權侵害、過失、損害與因果關係切入。",
  });
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [error, setError] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const wordCount = useMemo(() => answer.trim().replace(/\s+/g, "").length, [answer]);
  const answerSignals = useMemo(() => getAnswerSignals(answer), [answer]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const response = await fetch("/api/demo/law/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, rubric_id: selectedRubricId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "批改失敗，請稍後再試。");
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "批改失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(file: File | null) {
    if (!file) return;
    setOcrLoading(true);
    setOcrError("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/demo/law/ocr", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "圖片辨識失敗。");
      setAnswer(data.text ?? "");
      setFeedback(null);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "圖片辨識失敗。");
    } finally {
      setOcrLoading(false);
    }
  }

  function resetExample() {
    setQuestion(defaultQuestion);
    setAnswer(defaultAnswer);
    setSelectedRubricId("civil_law_tort_184");
    setPracticeMeta({
      topic: "侵權行為",
      difficulty: "基礎",
      hint: "可從民法第184條第1項前段、所有權侵害、過失、損害與因果關係切入。",
    });
    setFeedback(null);
    setError("");
    setOcrError("");
  }

  function randomizeQuestion() {
    let next = pickPostalLawQuestion();
    if (next.question === question) next = pickPostalLawQuestion();
    setQuestion(next.question);
    setAnswer("");
    setSelectedRubricId(next.rubric_id);
    setPracticeMeta({
      topic: next.topic,
      difficulty: next.difficulty,
      hint: next.hint,
    });
    setFeedback(null);
    setError("");
    setOcrError("");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700"
            href="/"
          >
            <ArrowLeft size={16} />
            回首頁
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles size={14} />
            AI Grading Beta
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                <Scale size={14} />
                Civil Law Essay Coach
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-normal text-slate-950 sm:text-4xl">
                民法申論批改試用
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                以考試訓練為核心，將答案拆解成爭點、法條、涵攝與結論四個面向，產生可追蹤的批改報告與下一步練習方向。
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              本系統為學習輔助，不構成法律意見。AI 批改可能有誤，正式準備仍請搭配教材、法條與教師指導。
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rubricItems.map((item) => (
              <div className={`rounded-xl border px-4 py-3 ${item.tone}`} key={item.label}>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="mt-1 text-xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
          <form className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" onSubmit={onSubmit}>
            <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-950">作答工作區</h2>
                    <p className="text-xs text-slate-500">輸入題目與你的申論答案</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={randomizeQuestion} type="button">
                    <Shuffle size={16} />
                    隨機出題
                  </button>
                  <button className="btn-secondary" onClick={resetExample} type="button">
                    載入範例
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[160px_1fr]">
                <div>
                  <p className="text-xs font-semibold text-slate-500">題目類型</p>
                  <p className="mt-1 font-semibold text-slate-950">{practiceMeta.topic}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">練習提示</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {practiceMeta.difficulty}題。{practiceMeta.hint}
                  </p>
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                題目
                <textarea
                  className="field mt-2 min-h-28 resize-y leading-6"
                  value={question}
                  onChange={(event) => {
                    setQuestion(event.target.value);
                    setSelectedRubricId(undefined);
                  }}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                你的答案
                <textarea
                  className="field mt-2 min-h-80 resize-y leading-7"
                  placeholder="請輸入你的民法申論答案..."
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  required
                />
              </label>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Camera size={16} />
                      手寫答案辨識
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      可拍照或上傳手寫答案圖片，系統會先轉成文字再批改。圖片不會保存。
                    </p>
                  </div>
                  <label className="btn-secondary cursor-pointer">
                    {ocrLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        辨識中
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        上傳照片
                      </>
                    )}
                    <input
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={ocrLoading}
                      onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
                      type="file"
                    />
                  </label>
                </div>
                {ocrError ? (
                  <div className="mt-3 flex gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
                    <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                    {ocrError}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FileText size={16} />
                    答案準備度
                    <span className="font-normal text-slate-500">約 {wordCount} 字</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {answerSignals.map((signal) => (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          signal.active
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-500"
                        }`}
                        key={signal.label}
                      >
                        {signal.label}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="btn-primary min-w-36" disabled={loading} type="submit">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      批改中
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      送出批改
                    </>
                  )}
                </button>
              </div>

              {error ? (
                <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                  {error}
                </div>
              ) : null}
            </div>
          </form>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-white/10 text-white">
                      <BookOpenCheck size={20} />
                    </div>
                    <div>
                      <h2 className="font-semibold">批改報告</h2>
                      <p className="text-xs text-slate-300">AI feedback report</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                    Beta
                  </div>
                </div>
              </div>

              <div className="p-5">
                {!feedback && !loading ? <EmptyResult /> : null}
                {loading ? <LoadingResult /> : null}
                {feedback ? <ResultReport feedback={feedback} /> : null}
              </div>
            </section>

            {feedback ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <TextBlock title="修改建議" text={feedback.revision_advice} />
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <TextBlock title="示範答題架構" text={feedback.model_answer_outline} />
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function getAnswerSignals(answer: string) {
  const text = answer.replace(/\s+/g, "");
  return [
    { label: "請求權基礎", active: /請求權|民法|184|179|767/.test(text) },
    { label: "構成要件", active: /故意|過失|損害|因果|違法|侵害/.test(text) },
    { label: "事實涵攝", active: /本件|甲|乙|手機|摔壞|因此|故/.test(text) },
    { label: "結論明確", active: /得請求|不得請求|成立|不成立|賠償|修復/.test(text) },
  ];
}

function EmptyResult() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
      送出答案後，這裡會產生總分、四項能力分數、優點、弱點、完全缺漏項目與下次練習方向。
    </div>
  );
}

function LoadingResult() {
  return (
    <div className="rounded-xl bg-blue-50 p-5 text-sm leading-6 text-blue-800">
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <Loader2 className="animate-spin" size={16} />
        正在批改答案
      </div>
      系統正在分析題目、請求權基礎、論證結構與結論完整度。
    </div>
  );
}

function ResultReport({ feedback }: { feedback: FeedbackState }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
        <ScoreGauge score={feedback.score} />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Gauge size={14} />
            {feedback.mode === "openai" ? "OpenAI 語意批改" : feedback.mode === "demo_heuristic_openai_failed" ? "OpenAI 失敗，改用本地示範評分" : "本地示範評分"}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            信心程度：<span className="font-semibold text-slate-900">{feedback.confidence}</span>
          </p>
          <p className="text-sm leading-6 text-slate-600">
            報告時間：{new Date().toLocaleString("zh-TW", { hour12: false })}
          </p>
        </div>
      </div>

      {feedback.warning ? (
        <div className="flex gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={16} />
          OpenAI 回應：{feedback.warning}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Score label="爭點" value={feedback.issue_score} max={25} tone="blue" />
        <Score label="法條" value={feedback.legal_basis_score} max={25} tone="emerald" />
        <Score label="論證" value={feedback.argument_score} max={30} tone="violet" />
        <Score label="結論" value={feedback.conclusion_score} max={20} tone="amber" />
      </div>

      <RadarStars items={feedback.grading_radar ?? []} />

      <ListBlock icon="check" title="優點" items={feedback.strengths} tone="good" />
      <ListBlock icon="alert" title="弱點" items={feedback.weaknesses} tone="risk" />
      <ListBlock icon="target" title="下次練習方向" items={feedback.next_practice_focus} tone="focus" />
      <ListBlock icon="alert" title="完全缺漏項目" items={feedback.missing_points} tone="risk" emptyText="無完全缺漏項目" />
    </div>
  );
}

function RadarStars({ items }: { items: NonNullable<FeedbackState["grading_radar"]> }) {
  if (!items.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Target size={16} className="text-blue-700" />
        <h3 className="font-semibold text-slate-950">五星能力雷達</h3>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2" key={item.label}>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
            <span className="font-mono text-sm tracking-wide" aria-label={`${item.stars} / ${item.max_stars}`}>
              <span className="text-amber-500">{"★".repeat(item.stars)}</span>
              <span className="text-slate-300">{"★".repeat(Math.max(0, item.max_stars - item.stars))}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative mx-auto grid size-40 place-items-center">
      <svg className="size-40 -rotate-90" viewBox="0 0 140 140" aria-hidden="true">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-bold text-slate-950">{score}</p>
        <p className="text-xs font-semibold text-slate-500">/ 100</p>
      </div>
    </div>
  );
}

function Score({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "blue" | "emerald" | "violet" | "amber";
}) {
  const width = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const bar = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    violet: "bg-violet-600",
    amber: "bg-amber-500",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-950">
          {value}/{max}
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${bar}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone = "neutral",
  icon,
  emptyText = "無",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "good" | "risk" | "focus";
  icon: "check" | "alert" | "target";
  emptyText?: string;
}) {
  const toneClass = {
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    good: "border-emerald-100 bg-emerald-50 text-emerald-800",
    risk: "border-rose-100 bg-rose-50 text-rose-800",
    focus: "border-blue-100 bg-blue-50 text-blue-800",
  }[tone];
  const Icon = icon === "check" ? CheckCircle2 : icon === "target" ? Target : AlertTriangle;

  return (
    <div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-6">
        {items?.length ? (
          items.map((item) => (
            <li className={`flex gap-2 rounded-xl border px-3 py-2 ${toneClass}`} key={item}>
              <Icon className="mt-0.5 shrink-0" size={16} />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-slate-500">{emptyText}</li>
        )}
      </ul>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{text}</p>
    </div>
  );
}
