"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";
import type { EnglishExam } from "@/types";

type GeneratedExam = EnglishExam & { id: string };

type ExamResult = {
  mode: "exam";
  score: number;
  correct_count: number;
  total_questions: number;
  item_results: {
    item_no: number;
    section: string;
    question_type: string;
    user_answer: string;
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
  }[];
};

const levelOptions = [
  { value: "postal-ii-to-i", label: "專業職（二）晉升專業職（一）" },
  { value: "postal-i-to-operation", label: "專業職（一）晉升營運職" },
];

export default function EnglishPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <EnglishExamTool session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function EnglishExamTool({ session }: { session: Parameters<typeof apiFetch>[0] }) {
  const [level, setLevel] = useState("postal-ii-to-i");
  const [exam, setExam] = useState<GeneratedExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const answeredCount = useMemo(() => Object.values(answers).filter((value) => value.trim()).length, [answers]);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setExam(null);
    setResult(null);
    setAnswers({});
    try {
      const data = await apiFetch<GeneratedExam>(session, "/api/english/generate", {
        method: "POST",
        body: JSON.stringify({ level, question_type: "full_exam" }),
      });
      setExam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法產生英文考卷。");
    } finally {
      setLoading(false);
    }
  }

  async function submitExam() {
    if (!exam) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<ExamResult>(session, "/api/english/submit", {
        method: "POST",
        body: JSON.stringify({ exercise_id: exam.id, answers }),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送出英文考卷失敗。");
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
        <p className="text-sm font-semibold text-blue-700">英文完整考卷</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">郵局內升英文練習</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          專業職（二）晉升專業職（一）以選擇題為主；專業職（一）晉升營運職會加入中翻英與英翻中。每次練習會從題池抽題，避免每天完全相同。
        </p>
      </section>

      <form className="panel grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={generate}>
        <label className="block text-sm font-medium text-slate-700">
          考試職階
          <select className="field mt-2" value={level} onChange={(event) => setLevel(event.target.value)}>
            {levelOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button className="btn-primary w-full md:w-auto" disabled={loading} type="submit">
            {loading ? "產生中..." : "產生一回考卷"}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
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
              {loading ? "批改中..." : "送出考卷"}
            </button>
          </div>

          <div className="space-y-4">
            {exam.items.map((item) => {
              const itemResult = result?.item_results.find((row) => row.item_no === item.item_no);
              return (
                <article className="rounded-md border border-slate-200 bg-white p-4" key={item.item_no}>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>第 {item.item_no} 題</span>
                    <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">{sectionLabel(item.section)}</span>
                    {itemResult ? (
                      <span className={itemResult.is_correct ? "text-green-700" : "text-red-700"}>{itemResult.is_correct ? "答對" : "需檢討"}</span>
                    ) : null}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-900">{item.question}</p>

                  {item.answer_type === "choice" ? (
                    <div className="mt-3 grid gap-2">
                      {item.options.map((option) => (
                        <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" key={option}>
                          <input
                            className="mt-1"
                            type="radio"
                            name={`answer-${item.item_no}`}
                            value={option}
                            checked={answers[String(item.item_no)] === option}
                            onChange={(event) => setItemAnswer(item.item_no, event.target.value)}
                            disabled={Boolean(result)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="field mt-3 min-h-28"
                      placeholder="請輸入翻譯答案"
                      value={answers[String(item.item_no)] ?? ""}
                      onChange={(event) => setItemAnswer(item.item_no, event.target.value)}
                      disabled={Boolean(result)}
                    />
                  )}

                  {itemResult ? (
                    <div className={`mt-3 rounded-md p-3 text-sm leading-6 ${itemResult.is_correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                      <p className="font-semibold">參考答案：{itemResult.correct_answer}</p>
                      <p className="mt-1">{itemResult.explanation}</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {result ? (
            <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-blue-900">
              <p className="text-sm font-semibold">考卷結果</p>
              <p className="mt-1 text-3xl font-bold">{result.score} 分</p>
              <p className="mt-1 text-sm">
                答對 {result.correct_count} / {result.total_questions} 題。翻譯題以關鍵內容比對，仍建議對照參考答案自行修正語句。
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function sectionLabel(section: string) {
  const labels: Record<string, string> = {
    Vocabulary: "字彙",
    Grammar: "文法",
    Cloze: "克漏字",
    Reading: "閱讀",
    Translation: "翻譯",
  };
  return labels[section] ?? section;
}
