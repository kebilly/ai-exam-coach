"use client";

import type { Session } from "@supabase/supabase-js";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";
import { lawCategoryOptions, pickPostalLawQuestion, type LawCategory } from "@/lib/postal-question-bank";
import type { LawFeedback } from "@/types";

const text = {
  title: "\u6c11\u6cd5\u7533\u8ad6\u6279\u6539",
  desc: "\u9078\u64c7\u985e\u5225\u5f8c\u53ef\u96a8\u6a5f\u51fa\u984c\uff0c\u4e5f\u53ef\u4ee5\u81ea\u884c\u8cbc\u4e0a\u984c\u76ee\u3002\u4f5c\u7b54\u53ef\u76f4\u63a5\u8f38\u5165\uff0c\u6216\u62cd\u7167\u4e0a\u50b3\u624b\u5beb\u7b54\u6848\u8fa8\u8b58\u6210\u6587\u5b57\u3002",
  category: "\u984c\u76ee\u985e\u5225",
  random: "\u96a8\u6a5f\u51fa\u984c",
  question: "\u984c\u76ee",
  answer: "\u4f5c\u7b54\u5167\u5bb9",
  verifiedRubric: "\u672c\u984c\u4f7f\u7528\u5df2\u9a57\u8b49 rubric \u6279\u6539",
  ocrTitle: "\u62cd\u7167\u4e0a\u50b3\u624b\u5beb\u7b54\u6848",
  ocrDesc: "OCR \u53ea\u6703\u8fa8\u8b58\u6587\u5b57\uff0c\u4e0d\u6703\u6279\u6539\u6216\u6539\u5beb\u7b54\u6848\u3002\u6b63\u5f0f\u9801\u9700\u767b\u5165\u4e26\u555f\u7528\u6703\u54e1\u624d\u80fd\u4f7f\u7528\u3002",
  upload: "\u4e0a\u50b3\u7167\u7247",
  ocrLoading: "\u8fa8\u8b58\u4e2d...",
  grade: "\u9001\u51fa\u6279\u6539",
  grading: "\u6279\u6539\u4e2d...",
  gradeFailed: "\u6279\u6539\u5931\u6557\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002",
  ocrFailed: "\u7167\u7247\u8fa8\u8b58\u5931\u6557\uff0c\u8acb\u6539\u7528\u6587\u5b57\u8f38\u5165\u3002",
  total: "\u7e3d\u5206",
  issue: "\u722d\u9ede",
  legal: "\u6cd5\u689d",
  argument: "\u8ad6\u8b49",
  conclusion: "\u7d50\u8ad6",
  strengths: "\u512a\u9ede",
  weaknesses: "\u5f31\u9ede",
  missing: "\u5b8c\u5168\u7f3a\u6f0f\u9805\u76ee",
  noMissing: "\u76ee\u524d\u672a\u986f\u793a\u5b8c\u5168\u7f3a\u6f0f\u9805\u76ee\u3002",
  revision: "\u4fee\u6539\u5efa\u8b70",
  outline: "\u793a\u7bc4\u7b54\u984c\u67b6\u69cb",
  focus: "\u4e0b\u6b21\u7df4\u7fd2\u65b9\u5411",
  confidence: "\u4fe1\u5fc3\u7a0b\u5ea6",
  empty: "\u7121",
};

export default function LawPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <LawTool session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function LawTool({ session }: { session: Session }) {
  const [category, setCategory] = useState<LawCategory>("all");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [rubricId, setRubricId] = useState<string | undefined>();
  const [practiceMeta, setPracticeMeta] = useState<{ topic: string; difficulty: string; hint: string } | null>(null);
  const [feedback, setFeedback] = useState<(LawFeedback & { id: string }) | null>(null);
  const [error, setError] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const result = await apiFetch<LawFeedback & { id: string }>(session, "/api/law/grade", {
        method: "POST",
        body: JSON.stringify({ question, answer, rubric_id: rubricId }),
      });
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : text.gradeFailed);
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
      const result = await apiFetch<{ text: string }>(session, "/api/law/ocr", {
        method: "POST",
        body: formData,
      });
      setAnswer(result.text ?? "");
      setFeedback(null);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : text.ocrFailed);
    } finally {
      setOcrLoading(false);
    }
  }

  function randomizeQuestion() {
    let next = pickPostalLawQuestion({ verifiedOnly: true, category });
    if (next.question === question) next = pickPostalLawQuestion({ verifiedOnly: true, category });
    setQuestion(next.question);
    setAnswer("");
    setRubricId(next.rubric_id);
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
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">{text.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text.desc}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="block text-sm font-medium text-slate-700">
            {text.category}
            <select className="field mt-2" value={category} onChange={(event) => setCategory(event.target.value as LawCategory)}>
              {lawCategoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button className="btn-secondary w-full md:w-auto" onClick={randomizeQuestion} type="button">
              {text.random}
            </button>
          </div>
        </div>
      </section>

      <form className="panel space-y-4" onSubmit={onSubmit}>
        {practiceMeta ? (
          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
            <p className="font-semibold">
              {practiceMeta.topic} / {practiceMeta.difficulty}
            </p>
            <p className="mt-1">{practiceMeta.hint}</p>
            {rubricId ? <p className="mt-1 text-xs font-semibold text-blue-700">{text.verifiedRubric}</p> : null}
          </div>
        ) : null}

        <label className="block text-sm font-medium text-slate-700">
          {text.question}
          <textarea
            className="field mt-2 min-h-28"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setRubricId(undefined);
              setPracticeMeta(null);
            }}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          {text.answer}
          <textarea className="field mt-2 min-h-52" value={answer} onChange={(event) => setAnswer(event.target.value)} required />
        </label>

        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{text.ocrTitle}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{text.ocrDesc}</p>
            </div>
            <label className="btn-secondary cursor-pointer">
              {ocrLoading ? text.ocrLoading : text.upload}
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
          {ocrError ? <p className="mt-3 text-sm text-red-600">{ocrError}</p> : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? text.grading : text.grade}
        </button>
      </form>

      {feedback ? (
        <section className="panel space-y-5">
          <div>
            <p className="text-sm text-slate-500">{text.total}</p>
            <p className="text-4xl font-bold text-blue-700">{feedback.score}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Score label={text.issue} value={feedback.issue_score} />
            <Score label={text.legal} value={feedback.legal_basis_score} />
            <Score label={text.argument} value={feedback.argument_score} />
            <Score label={text.conclusion} value={feedback.conclusion_score} />
          </div>
          <ListBlock title={text.strengths} items={feedback.strengths} />
          <ListBlock title={text.weaknesses} items={feedback.weaknesses} />
          <ListBlock title={text.missing} items={feedback.missing_points} emptyText={text.noMissing} />
          <TextBlock title={text.revision} text={feedback.revision_advice} />
          <TextBlock title={text.outline} text={feedback.model_answer_outline} />
          <ListBlock title={text.focus} items={feedback.next_practice_focus} />
          <p className="text-sm text-slate-500">
            {text.confidence}: {feedback.confidence}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ListBlock({ title, items, emptyText = text.empty }: { title: string; items: string[]; emptyText?: string }) {
  return (
    <div>
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {items?.length ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyText}</li>}
      </ul>
    </div>
  );
}

function TextBlock({ title, text: value }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
