"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";
import type { EnglishQuestion } from "@/types";

type GeneratedQuestion = EnglishQuestion & { id: string };

export default function EnglishPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <EnglishTool session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function EnglishTool({ session }: { session: Parameters<typeof apiFetch>[0] }) {
  const [level, setLevel] = useState("intermediate");
  const [questionType, setQuestionType] = useState("grammar");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{ is_correct: boolean; correct_answer: string; explanation: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setQuestion(null);
    setResult(null);
    setAnswer("");
    try {
      const data = await apiFetch<GeneratedQuestion>(session, "/api/english/generate", {
        method: "POST",
        body: JSON.stringify({ level, question_type: questionType, topic }),
      });
      setQuestion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "產題失敗");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!question) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ is_correct: boolean; correct_answer: string; explanation: string }>(session, "/api/english/submit", {
        method: "POST",
        body: JSON.stringify({ exercise_id: question.id, user_answer: answer }),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送出失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">英文自動出題</h1>
        <p className="mt-2 text-sm text-slate-600">AI 產生題目與解析可能有誤，請以正式教材與教師說明為準。</p>
      </section>

      <form className="panel grid gap-4 md:grid-cols-3" onSubmit={generate}>
        <label className="block text-sm font-medium text-slate-700">
          程度
          <select className="field mt-2" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="beginner">初級</option>
            <option value="intermediate">中級</option>
            <option value="upper-intermediate">中高級</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          題型
          <select className="field mt-2" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
            <option value="vocabulary">單字</option>
            <option value="grammar">文法</option>
            <option value="reading">閱讀</option>
            <option value="cloze">克漏字</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          主題
          <input className="field mt-2" placeholder="business, law, technology..." value={topic} onChange={(e) => setTopic(e.target.value)} />
        </label>
        <div className="md:col-span-3">
          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? "產生中..." : "產生題目"}
          </button>
        </div>
      </form>

      {question ? (
        <section className="panel space-y-4">
          <div>
            <p className="text-sm text-slate-500">{question.level} / {question.question_type} / 難度 {question.difficulty}</p>
            <h2 className="mt-2 whitespace-pre-wrap text-lg font-semibold leading-7 text-slate-950">{question.question}</h2>
          </div>
          <div className="grid gap-2">
            {question.options.map((option) => (
              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" key={option}>
                <input type="radio" name="answer" value={option} checked={answer === option} onChange={(e) => setAnswer(e.target.value)} />
                {option}
              </label>
            ))}
          </div>
          <button className="btn-primary" disabled={loading || !answer} onClick={submitAnswer} type="button">
            送出答案
          </button>
          {result ? (
            <div className={`rounded-md p-4 text-sm ${result.is_correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <p className="font-semibold">{result.is_correct ? "答對" : "答錯"}，正解：{result.correct_answer}</p>
              <p className="mt-2 leading-6">{result.explanation}</p>
              <p className="mt-2 text-slate-600">知識點：{question.knowledge_point}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

