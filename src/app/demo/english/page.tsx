"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import type { EnglishQuestion } from "@/types";

type DemoEnglishQuestion = EnglishQuestion & {
  mode?: string;
  warning?: string;
};

const levels = [
  { value: "postal-ii-to-i", label: "專二升專一", caption: "字彙、對話、文意選填為主" },
  { value: "postal-i-to-operation", label: "專一升營運", caption: "中英翻譯與閱讀測驗為主" },
  { value: "intermediate", label: "混合隨機", caption: "郵局內升綜合練習" },
];

const questionTypes = [
  { value: "random", label: "隨機", caption: "依郵局考古題比例抽題" },
  { value: "vocabulary", label: "字彙", caption: "依句意選最適當單字" },
  { value: "dialogue", label: "對話", caption: "依上下文補完整對話" },
  { value: "reading", label: "閱讀", caption: "短文細節、主旨與推論" },
  { value: "translation_zh_en", label: "中翻英", caption: "公共議題與職場英文" },
  { value: "translation_en_zh", label: "英翻中", caption: "新聞英文與社會趨勢" },
];

const quickTopics = ["business email", "technology", "law", "travel", "workplace", "daily life"];

export default function EnglishDemoPage() {
  const [level, setLevel] = useState("intermediate");
  const [questionType, setQuestionType] = useState("random");
  const [topic, setTopic] = useState("business email");
  const [question, setQuestion] = useState<DemoEnglishQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isCorrect = useMemo(() => {
    if (!question || !submitted) return null;
    return normalize(answer) === normalize(question.correct_answer);
  }, [answer, question, submitted]);

  async function generateQuestion(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setQuestion(null);
    setAnswer("");
    setSubmitted(false);

    try {
      const response = await fetch("/api/demo/english/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, question_type: questionType, topic }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "產生題目失敗，請稍後再試。");
      setQuestion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "產生題目失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setQuestion(null);
    setAnswer("");
    setSubmitted(false);
    setError("");
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
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Sparkles size={14} />
            English Generator Demo
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                <BookOpenCheck size={14} />
                English Exam Trainer
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-normal text-slate-950 sm:text-4xl">
                英文自動出題試用
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                選擇程度、題型與主題後，系統會產生一題考試練習題，並在作答後提供正解、解析與知識點。
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
              此頁不需登入、不保存資料。AI 產生內容仍可能有誤，請以正式教材與教師說明為準。
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <form className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" onSubmit={generateQuestion}>
            <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <FileQuestion size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">出題設定</h2>
                  <p className="text-xs text-slate-500">控制難度、題型與主題</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <Selector title="程度" value={level} options={levels} onChange={setLevel} />
              <Selector title="題型" value={questionType} options={questionTypes} onChange={setQuestionType} />

              <label className="block text-sm font-medium text-slate-700">
                主題
                <input
                  className="field mt-2"
                  placeholder="business email, technology, law..."
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {quickTopics.map((item) => (
                  <button
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      topic === item
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    key={item}
                    onClick={() => setTopic(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {error ? (
                <div className="flex gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <button className="btn-primary min-w-36 bg-emerald-600 hover:bg-emerald-700" disabled={loading} type="submit">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      產生中
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      產生題目
                    </>
                  )}
                </button>
                <button className="btn-secondary" onClick={reset} type="button">
                  <RotateCcw size={16} />
                  清空
                </button>
              </div>
            </div>
          </form>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-white/10 text-white">
                    <Target size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold">練習題</h2>
                    <p className="text-xs text-slate-300">Question, answer, explanation</p>
                  </div>
                </div>
                {question ? (
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                    難度 {question.difficulty}/5
                  </div>
                ) : null}
              </div>
            </div>

            <div className="p-5">
              {!question && !loading ? <EmptyState /> : null}
              {loading ? <LoadingState /> : null}
              {question ? (
                <QuestionCard
                  answer={answer}
                  isCorrect={isCorrect}
                  onAnswer={setAnswer}
                  onSubmit={() => setSubmitted(true)}
                  question={question}
                  submitted={submitted}
                />
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Selector({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: { value: string; label: string; caption: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <div className="mt-2 grid gap-2">
        {options.map((option) => (
          <button
            className={`rounded-xl border px-4 py-3 text-left transition ${
              value === option.value
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="mt-1 block text-xs text-slate-500">{option.caption}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
      選擇出題條件後按「產生題目」，這裡會顯示題目、選項、作答結果與解析。
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl bg-emerald-50 p-6 text-sm leading-6 text-emerald-800">
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <Loader2 className="animate-spin" size={16} />
        正在產生題目
      </div>
      系統正在依程度、題型與主題設計一題練習題。
    </div>
  );
}

function QuestionCard({
  answer,
  isCorrect,
  onAnswer,
  onSubmit,
  question,
  submitted,
}: {
  answer: string;
  isCorrect: boolean | null;
  onAnswer: (value: string) => void;
  onSubmit: () => void;
  question: DemoEnglishQuestion;
  submitted: boolean;
}) {
  const isWrittenQuestion = !question.options.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge>{question.level}</Badge>
        <Badge>{question.question_type}</Badge>
        <Badge>{question.knowledge_point}</Badge>
        <Badge>{question.mode === "openai" ? "OpenAI" : "Demo bank"}</Badge>
      </div>

      {question.warning ? (
        <div className="flex gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={16} />
          OpenAI 回應：{question.warning}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question</p>
        <h3 className="mt-2 whitespace-pre-wrap text-xl font-semibold leading-8 text-slate-950">
          {question.question}
        </h3>
      </div>

      {isWrittenQuestion ? (
        <label className="block text-sm font-medium text-slate-700">
          Your answer
          <textarea
            className="field mt-2 min-h-40 resize-y leading-7"
            disabled={submitted}
            onChange={(event) => onAnswer(event.target.value)}
            placeholder="請輸入你的翻譯..."
            value={answer}
          />
        </label>
      ) : (
        <div className="grid gap-3">
          {question.options.map((option) => {
            const selected = answer === option;
            const correct = submitted && normalize(option) === normalize(question.correct_answer);
            const wrongSelected = submitted && selected && !correct;
            return (
              <button
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                  correct
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : wrongSelected
                      ? "border-rose-200 bg-rose-50 text-rose-900"
                      : selected
                        ? "border-blue-200 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                disabled={submitted}
                key={option}
                onClick={() => onAnswer(option)}
                type="button"
              >
                <span>{option}</span>
                {correct ? <CheckCircle2 size={18} /> : wrongSelected ? <XCircle size={18} /> : null}
              </button>
            );
          })}
        </div>
      )}

      <button className="btn-primary bg-emerald-600 hover:bg-emerald-700" disabled={!answer || submitted} onClick={onSubmit} type="button">
        送出答案
      </button>

      {submitted ? (
        <div className={`rounded-2xl border p-5 ${isWrittenQuestion || isCorrect ? "border-emerald-100 bg-emerald-50" : "border-rose-100 bg-rose-50"}`}>
          <div className={`flex items-center gap-2 font-semibold ${isWrittenQuestion || isCorrect ? "text-emerald-800" : "text-rose-800"}`}>
            {isWrittenQuestion || isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {isWrittenQuestion ? "參考譯文" : isCorrect ? "答對了" : "答錯了"}：{question.correct_answer}
          </div>
          <div className="mt-4 flex gap-2 text-sm leading-6 text-slate-700">
            <Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={17} />
            <p>{question.explanation}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  );
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/^[a-d]\.\s*/i, "");
}
