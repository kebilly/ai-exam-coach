"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";
import type { PostalRulesExam } from "@/types";

type StartedExam = PostalRulesExam & { id: string };

type ExamResult = {
  score: number;
  correct_count: number;
  total_questions: number;
  item_results: {
    item_no: number;
    law_area: string;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
    source_articles: { law_name: string; article_no: string; note: string }[];
  }[];
};

const careerLevels = [
  { value: "professional_2_to_1", label: "專業職（二）晉升專業職（一）" },
  { value: "professional_1_to_operations", label: "專業職（一）晉升營運職" },
];

export default function PostalRulesPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <PostalRulesTool session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function PostalRulesTool({ session }: { session: Parameters<typeof apiFetch>[0] }) {
  const [careerLevel, setCareerLevel] = useState("professional_2_to_1");
  const [count, setCount] = useState(20);
  const [exam, setExam] = useState<StartedExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);

  async function startExam(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setExam(null);
    setResult(null);
    setAnswers({});
    try {
      const data = await apiFetch<StartedExam>(session, "/api/postal-rules/start", {
        method: "POST",
        body: JSON.stringify({ career_level: careerLevel, count }),
      });
      setExam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法建立郵政法規練習。");
    } finally {
      setLoading(false);
    }
  }

  async function submitExam() {
    if (!exam) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<ExamResult>(session, "/api/postal-rules/submit", {
        method: "POST",
        body: JSON.stringify({ attempt_id: exam.id, answers }),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送出答案失敗。");
    } finally {
      setLoading(false);
    }
  }

  function setItemAnswer(itemNo: number, value: string) {
    setAnswers((current) => ({ ...current, [String(itemNo)]: value }));
  }

  return (
    <div className="space-y-5">
      <section className="panel">
        <p className="text-sm font-semibold text-blue-700">郵政法規概要</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">郵政法規選擇題練習</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          系統會從已審核或自動檢查通過的題庫中抽題。若題庫不足，請先由管理後台產生 seed 題或 AI 題。
        </p>
      </section>

      <form className="panel grid gap-4 md:grid-cols-[1fr_140px_auto]" onSubmit={startExam}>
        <label className="block text-sm font-medium text-slate-700">
          職階
          <select className="field mt-2" value={careerLevel} onChange={(event) => setCareerLevel(event.target.value)}>
            {careerLevels.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          題數
          <select className="field mt-2" value={count} onChange={(event) => setCount(Number(event.target.value))}>
            <option value={10}>10 題</option>
            <option value={20}>20 題</option>
            <option value={50}>50 題</option>
          </select>
        </label>
        <div className="flex items-end">
          <button className="btn-primary w-full md:w-auto" disabled={loading} type="submit">
            {loading ? "建立中..." : "開始練習"}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600 md:col-span-3">{error}</p> : null}
      </form>

      {exam ? (
        <section className="panel space-y-5">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{exam.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                共 {exam.total_questions} 題 / 已作答 {answeredCount} 題
              </p>
            </div>
            <button className="btn-primary" disabled={loading || answeredCount === 0 || Boolean(result)} onClick={submitExam} type="button">
              {loading ? "批改中..." : "送出答案"}
            </button>
          </div>

          <div className="space-y-4">
            {exam.items.map((item) => {
              const itemResult = result?.item_results.find((row) => row.item_no === item.item_no);
              const options = item.options;
              return (
                <article className="rounded-md border border-slate-200 bg-white p-4" key={item.item_no}>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>第 {item.item_no} 題</span>
                    <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">{item.law_area}</span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">難度 {item.difficulty}</span>
                    {itemResult ? (
                      <span className={itemResult.is_correct ? "text-green-700" : "text-red-700"}>
                        {itemResult.is_correct ? "答對" : "答錯"}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-900">{item.question}</p>

                  {options ? (
                    <div className="mt-3 grid gap-2">
                      {(["A", "B", "C", "D"] as const).map((key) => (
                        <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" key={key}>
                          <input
                            className="mt-1"
                            type="radio"
                            name={`answer-${item.item_no}`}
                            value={key}
                            checked={answers[String(item.item_no)] === key}
                            onChange={(event) => setItemAnswer(item.item_no, event.target.value)}
                            disabled={Boolean(result)}
                          />
                          <span>
                            {key}. {options[key]}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="field mt-3 min-h-28"
                      placeholder={item.question_format === "fill_blank" ? "請填入答案" : "請輸入簡答或重點關鍵字"}
                      value={answers[String(item.item_no)] ?? ""}
                      onChange={(event) => setItemAnswer(item.item_no, event.target.value)}
                      disabled={Boolean(result)}
                    />
                  )}

                  {itemResult ? (
                    <div className={`mt-3 rounded-md p-3 text-sm leading-6 ${itemResult.is_correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                      <p className="font-semibold">正確答案：{itemResult.correct_answer}</p>
                      <p className="mt-1">{itemResult.explanation}</p>
                      <p className="mt-2 text-xs opacity-80">
                        來源：
                        {itemResult.source_articles.map((source) => `${source.law_name} ${source.article_no}`).join("、")}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {result ? (
            <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-blue-900">
              <p className="text-sm font-semibold">練習結果</p>
              <p className="mt-1 text-3xl font-bold">{result.score} 分</p>
              <p className="mt-1 text-sm">
                答對 {result.correct_count} / {result.total_questions} 題
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
