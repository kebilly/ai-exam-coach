"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";
import type { LawFeedback } from "@/types";

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

function LawTool({ session }: { session: Parameters<typeof apiFetch>[0] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<(LawFeedback & { id: string }) | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFeedback(null);
    try {
      const result = await apiFetch<LawFeedback & { id: string }>(session, "/api/law/grade", {
        method: "POST",
        body: JSON.stringify({ question, answer }),
      });
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "批改失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">民法申論批改</h1>
        <p className="mt-2 text-sm text-slate-600">
          本系統提供考試學習與答題訓練輔助，不構成法律意見。
        </p>
      </section>

      <form className="panel space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          題目
          <textarea className="field mt-2 min-h-28" value={question} onChange={(e) => setQuestion(e.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          你的答案
          <textarea className="field mt-2 min-h-52" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "批改中..." : "送出批改"}
        </button>
      </form>

      {feedback ? (
        <section className="panel space-y-5">
          <div>
            <p className="text-sm text-slate-500">總分</p>
            <p className="text-4xl font-bold text-blue-700">{feedback.score}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Score label="爭點" value={feedback.issue_score} />
            <Score label="法條" value={feedback.legal_basis_score} />
            <Score label="論證" value={feedback.argument_score} />
            <Score label="結論" value={feedback.conclusion_score} />
          </div>
          <ListBlock title="優點" items={feedback.strengths} />
          <ListBlock title="弱點" items={feedback.weaknesses} />
          <ListBlock title="完全缺漏項目" items={feedback.missing_points} emptyText="無完全缺漏項目" />
          <TextBlock title="修改建議" text={feedback.revision_advice} />
          <TextBlock title="示範答題架構" text={feedback.model_answer_outline} />
          <ListBlock title="下次練習方向" items={feedback.next_practice_focus} />
          <p className="text-sm text-slate-500">信心程度：{feedback.confidence}</p>
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

function ListBlock({ title, items, emptyText = "無" }: { title: string; items: string[]; emptyText?: string }) {
  return (
    <div>
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {items?.length ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyText}</li>}
      </ul>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}
