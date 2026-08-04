"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";

type AdminData = {
  users: AdminUser[];
  law: LawRecord[];
  english: EnglishRecord[];
  postal: PostalAttemptRecord[];
  usage: UsageRecord[];
  inviteCodes: InviteCode[];
};

type AdminUser = {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin" | string;
  plan: "free" | "member" | string;
  created_at: string;
};

type LawRecord = {
  id: string;
  user_id: string;
  question: string;
  score: number | null;
  created_at: string;
};

type EnglishRecord = {
  id: string;
  user_id: string;
  level: string;
  question_type: string;
  is_correct: boolean | null;
  created_at: string;
};

type PostalAttemptRecord = {
  id: string;
  user_id: string;
  career_level: string;
  score: number | null;
  correct_count: number | null;
  total_questions: number | null;
  created_at: string;
};

type UsageRecord = {
  id: string;
  user_id: string;
  action_type: string;
  created_at: string;
};

type InviteCode = {
  id: string;
  label: string | null;
  active: boolean;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  created_at: string;
};

type GeneratedCode = {
  code: string;
  label: string;
};

type PostalRuleQuestion = {
  id: string;
  career_level: string;
  question_format: string;
  law_area: string;
  difficulty: number;
  question: string;
  options: { A: string; B: string; C: string; D: string } | null;
  answer: string;
  explanation: string;
  source_articles: { law_name: string; article_no: string; note: string }[];
  tags: string[];
  source_type: string;
  review_status: "pending" | "approved" | "rejected" | "needs_edit" | string;
  created_at: string;
};

type RecordRow = {
  cells: string[];
  action?: React.ReactNode;
};

const t = {
  title: "管理後台",
  subtitle: "管理會員啟用、邀請碼、練習紀錄與郵政法規題庫。",
  loading: "載入後台資料中...",
  users: "會員管理",
  inviteCodes: "邀請碼管理",
  inviteDesc: "邀請碼預設只能使用一次，適合分發給少量同事測試。",
  generatedCodes: "新產生的邀請碼",
  generatedHint: "邀請碼明碼只會在這裡顯示一次，請立刻記錄或分發給使用者。",
  lawRecords: "民法批改紀錄",
  englishRecords: "英文練習紀錄",
  postalRecords: "郵政法規練習紀錄",
  usageRecords: "AI 使用紀錄",
  postalRules: "郵政法規題庫審核",
  postalRulesDesc: "可產生郵政法規練習題，審核通過後才會進入正式練習。",
  generateSeedPostal: "產生種子題",
  generateAiPostal: "AI 產生題目",
  approve: "通過",
  reject: "退回",
  needsEdit: "需修改",
  setupWarning:
    "郵政法規資料表尚未建立。請先到 Supabase SQL Editor 執行更新後的 supabase/schema.sql 與 supabase/security-hardening.sql。",
  userSummary: "使用者摘要",
  filterAll: "全部使用者",
  filterLabel: "篩選使用者",
  empty: "目前沒有資料",
  correct: "答對",
  wrong: "答錯",
  notSubmitted: "未作答",
  generate: "產生邀請碼",
  generating: "產生中...",
  activate: "啟用會員",
  deactivate: "改為免費",
  makeAdmin: "設為 Admin",
  makeUser: "改為 User",
  enableCode: "啟用",
  disableCode: "停用",
  saved: "已更新",
  deleteRecord: "刪除",
  deleteConfirm: "確定要刪除這筆紀錄嗎？此操作無法復原。",
  unknownUser: "未知使用者",
  displayName: "顯示名稱",
  createdAt: "建立時間",
  registeredAt: "註冊時間",
  action: "操作",
  status: "狀態",
  usageCount: "使用次數",
  user: "使用者",
  score: "分數",
  question: "題目",
  time: "時間",
  type: "題型",
  result: "結果",
  event: "動作",
  lawCount: "民法次數",
  englishCount: "英文次數",
  postalCount: "郵政法規次數",
  aiCount: "AI 次數",
  count: "數量",
  label: "標籤",
  careerLevel: "職階",
  lawArea: "法規類別",
  answer: "答案",
  explanation: "解析",
};

const careerLevelOptions = [
  { value: "professional_2_to_1", label: "專業職（二）晉升專業職（一）" },
  { value: "professional_1_to_operations", label: "專業職（一）晉升營運職" },
];

const lawAreaOptions = ["郵政法", "郵政儲金匯兌法", "簡易人壽保險法", "郵件處理規則", "郵務營業規章"];

export default function AdminPage() {
  return (
    <AuthGuard>
      {(session) => (
        <AppShell>
          <Admin session={session} />
        </AppShell>
      )}
    </AuthGuard>
  );
}

function Admin({ session }: { session: Session }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [inviteCount, setInviteCount] = useState(10);
  const [inviteLabel, setInviteLabel] = useState("coworker");
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [postalQuestions, setPostalQuestions] = useState<PostalRuleQuestion[]>([]);
  const [postalBusy, setPostalBusy] = useState(false);
  const [postalSetupRequired, setPostalSetupRequired] = useState(false);
  const [postalCareerLevel, setPostalCareerLevel] = useState("professional_2_to_1");
  const [postalLawArea, setPostalLawArea] = useState("郵政法");
  const [postalCount, setPostalCount] = useState(5);

  async function reload() {
    setError("");
    const result = await apiFetch<AdminData>(session, "/api/admin/records");
    setData(result);
  }

  async function reloadPostalQuestions() {
    const result = await apiFetch<{ questions: PostalRuleQuestion[]; setupRequired?: boolean }>(session, "/api/admin/postal-rules");
    setPostalQuestions(result.questions);
    setPostalSetupRequired(Boolean(result.setupRequired));
  }

  useEffect(() => {
    reload().catch((err) => setError(err instanceof Error ? err.message : "Admin load failed"));
    reloadPostalQuestions().catch(() => {
      setPostalQuestions([]);
      setPostalSetupRequired(true);
    });
  }, [session]);

  async function updateUser(userId: string, patch: { role?: string; plan?: string }) {
    setBusyId(userId);
    setError("");
    setMessage("");
    try {
      await apiFetch<{ ok: boolean }>(session, "/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ user_id: userId, ...patch }),
      });
      setMessage(t.saved);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "User update failed");
    } finally {
      setBusyId("");
    }
  }

  async function generateInviteCodes(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setError("");
    setMessage("");
    setGeneratedCodes([]);
    try {
      const result = await apiFetch<{ ok: boolean; codes: GeneratedCode[] }>(session, "/api/admin/invite-codes", {
        method: "POST",
        body: JSON.stringify({ count: inviteCount, label: inviteLabel }),
      });
      setGeneratedCodes(result.codes);
      setMessage(`已產生 ${result.codes.length} 組邀請碼`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite code generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function updateInviteCode(id: string, active: boolean) {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      await apiFetch<{ ok: boolean }>(session, "/api/admin/invite-codes", {
        method: "PATCH",
        body: JSON.stringify({ id, active }),
      });
      setMessage(t.saved);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite code update failed");
    } finally {
      setBusyId("");
    }
  }

  async function generatePostalQuestions(mode: "seed" | "ai") {
    setPostalBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await apiFetch<{ questions: PostalRuleQuestion[] }>(session, "/api/admin/postal-rules", {
        method: "POST",
        body: JSON.stringify({
          mode,
          count: postalCount,
          career_level: postalCareerLevel,
          question_format: "single_choice",
          law_area: postalLawArea,
        }),
      });
      setMessage(`已產生 ${result.questions.length} 題郵政法規題目`);
      await reloadPostalQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Postal rules generation failed");
    } finally {
      setPostalBusy(false);
    }
  }

  async function reviewPostalQuestion(id: string, reviewStatus: "approved" | "rejected" | "needs_edit") {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      await apiFetch<{ ok: boolean }>(session, "/api/admin/postal-rules", {
        method: "PATCH",
        body: JSON.stringify({ id, review_status: reviewStatus }),
      });
      setMessage(t.saved);
      await reloadPostalQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Postal rules review failed");
    } finally {
      setBusyId("");
    }
  }

  async function deleteRecord(type: "law" | "english" | "postal" | "usage", id: string) {
    if (!window.confirm(t.deleteConfirm)) return;
    const busyKey = `${type}:${id}`;
    setBusyId(busyKey);
    setError("");
    setMessage("");
    try {
      await apiFetch<{ ok: boolean }>(session, "/api/admin/records", {
        method: "DELETE",
        body: JSON.stringify({ type, id }),
      });
      setMessage(t.saved);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId("");
    }
  }

  const filtered = useMemo(() => {
    if (!data || selectedUserId === "all") return data;
    return {
      ...data,
      law: data.law.filter((item) => item.user_id === selectedUserId),
      english: data.english.filter((item) => item.user_id === selectedUserId),
      postal: data.postal.filter((item) => item.user_id === selectedUserId),
      usage: data.usage.filter((item) => item.user_id === selectedUserId),
    };
  }, [data, selectedUserId]);

  const summaries = useMemo(() => {
    if (!data) return [];
    return data.users.map((user) => ({
      user,
      lawCount: data.law.filter((item) => item.user_id === user.id).length,
      englishCount: data.english.filter((item) => item.user_id === user.id).length,
      postalCount: data.postal.filter((item) => item.user_id === user.id).length,
      usageCount: data.usage.filter((item) => item.user_id === user.id).length,
    }));
  }, [data]);

  if (error && !data) return <div className="panel text-red-600">{error}</div>;
  if (!data || !filtered) return <div className="panel">{t.loading}</div>;

  function userLabel(userId: string) {
    const user = data?.users.find((item) => item.id === userId);
    if (!user) return `${t.unknownUser} (${userId.slice(0, 8)})`;
    return `${user.email}${user.display_name ? ` / ${user.display_name}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">{t.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t.subtitle}</p>
        {message ? <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </section>

      <section className="panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-950">{t.userSummary}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.filterLabel}</p>
          </div>
          <select className="field max-w-sm" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            <option value="all">{t.filterAll}</option>
            {data.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <StatCard label={t.lawCount} value={filtered.law.length} />
          <StatCard label={t.englishCount} value={filtered.english.length} />
          <StatCard label={t.postalCount} value={filtered.postal.length} />
          <StatCard label={t.aiCount} value={filtered.usage.length} />
        </div>
      </section>

      <section className="panel">
        <h2 className="font-semibold text-slate-950">{t.users}</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">{t.displayName}</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">{t.lawCount}</th>
                <th className="px-2 py-2">{t.englishCount}</th>
                <th className="px-2 py-2">{t.postalCount}</th>
                <th className="px-2 py-2">{t.registeredAt}</th>
                <th className="px-2 py-2">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map(({ user, lawCount, englishCount, postalCount }) => (
                <tr className="border-t border-slate-200" key={user.id}>
                  <td className="px-2 py-3 text-slate-800">{user.email}</td>
                  <td className="px-2 py-3 text-slate-700">{user.display_name ?? "-"}</td>
                  <td className="px-2 py-3">
                    <StatusBadge tone={user.role === "admin" ? "blue" : "slate"}>{user.role}</StatusBadge>
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge tone={user.plan === "member" ? "green" : "slate"}>{user.plan}</StatusBadge>
                  </td>
                  <td className="px-2 py-3 text-slate-700">{lawCount}</td>
                  <td className="px-2 py-3 text-slate-700">{englishCount}</td>
                  <td className="px-2 py-3 text-slate-700">{postalCount}</td>
                  <td className="px-2 py-3 text-slate-600">{formatDate(user.created_at)}</td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-2">
                      <SmallButton disabled={busyId === user.id} onClick={() => updateUser(user.id, { plan: user.plan === "member" ? "free" : "member" })}>
                        {user.plan === "member" ? t.deactivate : t.activate}
                      </SmallButton>
                      <SmallButton disabled={busyId === user.id} onClick={() => updateUser(user.id, { role: user.role === "admin" ? "user" : "admin" })}>
                        {user.role === "admin" ? t.makeUser : t.makeAdmin}
                      </SmallButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-950">{t.inviteCodes}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t.inviteDesc}</p>
          </div>
          <form className="grid gap-2 sm:grid-cols-[90px_160px_auto]" onSubmit={generateInviteCodes}>
            <input aria-label={t.count} className="field" max={50} min={1} type="number" value={inviteCount} onChange={(event) => setInviteCount(Number(event.target.value))} />
            <input aria-label={t.label} className="field" value={inviteLabel} onChange={(event) => setInviteLabel(event.target.value)} />
            <button className="btn-primary" disabled={generating} type="submit">
              {generating ? t.generating : t.generate}
            </button>
          </form>
        </div>

        {generatedCodes.length ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-950">{t.generatedCodes}</h3>
            <p className="mt-1 text-sm text-amber-800">{t.generatedHint}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {generatedCodes.map((item) => (
                <div className="rounded-md bg-white px-3 py-2 font-mono text-sm text-slate-800" key={item.code}>
                  {item.code} <span className="font-sans text-slate-500">({item.label})</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-2 py-2">Label</th>
                <th className="px-2 py-2">{t.status}</th>
                <th className="px-2 py-2">{t.usageCount}</th>
                <th className="px-2 py-2">{t.createdAt}</th>
                <th className="px-2 py-2">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {data.inviteCodes.length ? (
                data.inviteCodes.map((item) => (
                  <tr className="border-t border-slate-200" key={item.id}>
                    <td className="px-2 py-3 text-slate-800">{item.label ?? "-"}</td>
                    <td className="px-2 py-3">
                      <StatusBadge tone={item.active ? "green" : "slate"}>{item.active ? "active" : "disabled"}</StatusBadge>
                    </td>
                    <td className="px-2 py-3 text-slate-700">
                      {item.used_count}/{item.max_uses}
                    </td>
                    <td className="px-2 py-3 text-slate-600">{formatDate(item.created_at)}</td>
                    <td className="px-2 py-3">
                      <SmallButton disabled={busyId === item.id} onClick={() => updateInviteCode(item.id, !item.active)}>
                        {item.active ? t.disableCode : t.enableCode}
                      </SmallButton>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={5} />
              )}
            </tbody>
          </table>
        </div>
      </section>

      <RecordTable
        title={t.lawRecords}
        headers={[t.user, t.score, t.question, t.time, t.action]}
        rows={filtered.law.map((item) => ({
          cells: [userLabel(item.user_id), `${item.score ?? "-"} / 100`, item.question.slice(0, 80), formatDate(item.created_at)],
          action: (
            <SmallButton disabled={busyId === `law:${item.id}`} onClick={() => deleteRecord("law", item.id)}>
              {t.deleteRecord}
            </SmallButton>
          ),
        }))}
      />
      <RecordTable
        title={t.englishRecords}
        headers={[t.user, t.type, t.result, t.time, t.action]}
        rows={filtered.english.map((item) => ({
          cells: [userLabel(item.user_id), `${item.level}/${item.question_type}`, item.is_correct === null ? t.notSubmitted : item.is_correct ? t.correct : t.wrong, formatDate(item.created_at)],
          action: (
            <SmallButton disabled={busyId === `english:${item.id}`} onClick={() => deleteRecord("english", item.id)}>
              {t.deleteRecord}
            </SmallButton>
          ),
        }))}
      />
      <RecordTable
        title={t.postalRecords}
        headers={[t.user, t.careerLevel, t.score, "答對題數", t.time, t.action]}
        rows={filtered.postal.map((item) => ({
          cells: [userLabel(item.user_id), item.career_level, `${item.score ?? "-"} / 100`, `${item.correct_count ?? "-"} / ${item.total_questions ?? "-"}`, formatDate(item.created_at)],
          action: (
            <SmallButton disabled={busyId === `postal:${item.id}`} onClick={() => deleteRecord("postal", item.id)}>
              {t.deleteRecord}
            </SmallButton>
          ),
        }))}
      />
      <RecordTable
        title={t.usageRecords}
        headers={[t.user, t.event, t.time, t.action]}
        rows={filtered.usage.map((item) => ({
          cells: [userLabel(item.user_id), item.action_type, formatDate(item.created_at)],
          action: (
            <SmallButton disabled={busyId === `usage:${item.id}`} onClick={() => deleteRecord("usage", item.id)}>
              {t.deleteRecord}
            </SmallButton>
          ),
        }))}
      />

      <section className="panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-950">{t.postalRules}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{t.postalRulesDesc}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-[220px_160px_90px_auto_auto]">
            <select className="field" value={postalCareerLevel} onChange={(event) => setPostalCareerLevel(event.target.value)}>
              {careerLevelOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select className="field" value={postalLawArea} onChange={(event) => setPostalLawArea(event.target.value)}>
              {lawAreaOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input className="field" max={10} min={1} type="number" value={postalCount} onChange={(event) => setPostalCount(Number(event.target.value))} />
            <button className="btn-secondary" disabled={postalBusy} onClick={() => generatePostalQuestions("seed")} type="button">
              {t.generateSeedPostal}
            </button>
            <button className="btn-primary" disabled={postalBusy} onClick={() => generatePostalQuestions("ai")} type="button">
              {postalBusy ? "產生中..." : t.generateAiPostal}
            </button>
          </div>
        </div>

        {postalSetupRequired ? <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">{t.setupWarning}</div> : null}

        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-2 py-2">{t.status}</th>
                <th className="px-2 py-2">{t.careerLevel}</th>
                <th className="px-2 py-2">{t.lawArea}</th>
                <th className="px-2 py-2">{t.question}</th>
                <th className="px-2 py-2">{t.answer}</th>
                <th className="px-2 py-2">{t.explanation}</th>
                <th className="px-2 py-2">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {postalQuestions.length ? (
                postalQuestions.map((item) => (
                  <tr className="border-t border-slate-200" key={item.id}>
                    <td className="px-2 py-3">
                      <StatusBadge tone={item.review_status === "approved" ? "green" : item.review_status === "rejected" ? "slate" : "blue"}>{item.review_status}</StatusBadge>
                    </td>
                    <td className="px-2 py-3 text-slate-700">{item.career_level}</td>
                    <td className="px-2 py-3 text-slate-700">{item.law_area}</td>
                    <td className="px-2 py-3 text-slate-800">{item.question}</td>
                    <td className="px-2 py-3 text-slate-700">{item.answer}</td>
                    <td className="px-2 py-3 text-slate-600">{item.explanation.slice(0, 100)}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <SmallButton disabled={busyId === item.id} onClick={() => reviewPostalQuestion(item.id, "approved")}>
                          {t.approve}
                        </SmallButton>
                        <SmallButton disabled={busyId === item.id} onClick={() => reviewPostalQuestion(item.id, "needs_edit")}>
                          {t.needsEdit}
                        </SmallButton>
                        <SmallButton disabled={busyId === item.id} onClick={() => reviewPostalQuestion(item.id, "rejected")}>
                          {t.reject}
                        </SmallButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={7} />
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function RecordTable({ title, headers, rows }: { title: string; headers: string[]; rows: RecordRow[] }) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {headers.map((header) => (
                <th className="px-2 py-2" key={`${title}-${header}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr className="border-t border-slate-200" key={`${title}-${index}`}>
                  {row.cells.map((cell, cellIndex) => (
                    <td className="px-2 py-3 text-slate-700" key={`${title}-${index}-${cellIndex}`}>
                      {cell}
                    </td>
                  ))}
                  {row.action ? <td className="px-2 py-3">{row.action}</td> : null}
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={headers.length} />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td className="py-3 text-slate-500" colSpan={colSpan}>
        {t.empty}
      </td>
    </tr>
  );
}

function SmallButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function StatusBadge({ children, tone }: { children: React.ReactNode; tone: "blue" | "green" | "slate" }) {
  const className = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    slate: "bg-slate-100 text-slate-600",
  }[tone];

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", { hour12: false });
}
