"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/clientApi";

type AdminData = {
  users: AdminUser[];
  law: LawRecord[];
  english: EnglishRecord[];
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

const t = {
  title: "\u7ba1\u7406\u5f8c\u53f0",
  subtitle: "\u7ba1\u7406\u6703\u54e1\u555f\u7528\u3001\u9080\u8acb\u78bc\u8207\u4f7f\u7528\u7d00\u9304\u3002",
  loading: "\u8f09\u5165\u5f8c\u53f0\u8cc7\u6599\u4e2d...",
  users: "\u6703\u54e1\u7ba1\u7406",
  inviteCodes: "\u9080\u8acb\u78bc\u7ba1\u7406",
  generatedCodes: "\u65b0\u7522\u751f\u7684\u9080\u8acb\u78bc",
  generatedHint:
    "\u9080\u8acb\u78bc\u660e\u78bc\u53ea\u6703\u5728\u9019\u88e1\u986f\u793a\u4e00\u6b21\uff0c\u8acb\u7acb\u5373\u8a18\u9304\u6216\u5206\u767c\u7d66\u4f7f\u7528\u8005\u3002",
  lawRecords: "\u6c11\u6cd5\u6279\u6539\u7d00\u9304",
  englishRecords: "\u82f1\u6587\u7df4\u7fd2\u7d00\u9304",
  usageRecords: "AI \u4f7f\u7528\u7d00\u9304",
  empty: "\u76ee\u524d\u6c92\u6709\u8cc7\u6599",
  correct: "\u7b54\u5c0d",
  wrong: "\u7b54\u932f",
  notSubmitted: "\u672a\u4f5c\u7b54",
  generate: "\u7522\u751f\u9080\u8acb\u78bc",
  generating: "\u7522\u751f\u4e2d...",
  activate: "\u555f\u7528\u6703\u54e1",
  deactivate: "\u6539\u70ba\u514d\u8cbb",
  makeAdmin: "\u8a2d\u70ba Admin",
  makeUser: "\u6539\u70ba User",
  enableCode: "\u555f\u7528",
  disableCode: "\u505c\u7528",
  saved: "\u5df2\u66f4\u65b0",
};

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

  async function reload() {
    setError("");
    const result = await apiFetch<AdminData>(session, "/api/admin/records");
    setData(result);
  }

  useEffect(() => {
    reload().catch((err) => setError(err instanceof Error ? err.message : "Admin load failed"));
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
      setMessage(`\u5df2\u7522\u751f ${result.codes.length} \u7d44\u9080\u8acb\u78bc`);
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

  if (error && !data) return <div className="panel text-red-600">{error}</div>;
  if (!data) return <div className="panel">{t.loading}</div>;

  return (
    <div className="space-y-5">
      <section className="panel">
        <h1 className="text-2xl font-bold text-slate-950">{t.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t.subtitle}</p>
        {message ? <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </section>

      <section className="panel">
        <h2 className="font-semibold text-slate-950">{t.users}</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">\u986f\u793a\u540d\u7a31</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Plan</th>
                <th className="px-2 py-2">\u8a3b\u518a\u6642\u9593</th>
                <th className="px-2 py-2">\u64cd\u4f5c</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr className="border-t border-slate-200" key={user.id}>
                  <td className="px-2 py-3 text-slate-800">{user.email}</td>
                  <td className="px-2 py-3 text-slate-700">{user.display_name ?? "-"}</td>
                  <td className="px-2 py-3">
                    <StatusBadge tone={user.role === "admin" ? "blue" : "slate"}>{user.role}</StatusBadge>
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge tone={user.plan === "member" ? "green" : "slate"}>{user.plan}</StatusBadge>
                  </td>
                  <td className="px-2 py-3 text-slate-600">{formatDate(user.created_at)}</td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-2">
                      <SmallButton
                        disabled={busyId === user.id}
                        onClick={() => updateUser(user.id, { plan: user.plan === "member" ? "free" : "member" })}
                      >
                        {user.plan === "member" ? t.deactivate : t.activate}
                      </SmallButton>
                      <SmallButton
                        disabled={busyId === user.id}
                        onClick={() => updateUser(user.id, { role: user.role === "admin" ? "user" : "admin" })}
                      >
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
            <p className="mt-1 text-sm leading-6 text-slate-600">
              \u9080\u8acb\u78bc\u9810\u8a2d\u53ea\u80fd\u4f7f\u7528\u4e00\u6b21\uff0c\u9069\u5408\u5206\u767c\u7d66\u5c11\u91cf\u540c\u4e8b\u6e2c\u8a66\u3002
            </p>
          </div>
          <form className="grid gap-2 sm:grid-cols-[90px_160px_auto]" onSubmit={generateInviteCodes}>
            <input
              className="field"
              max={50}
              min={1}
              type="number"
              value={inviteCount}
              onChange={(event) => setInviteCount(Number(event.target.value))}
              aria-label="\u6578\u91cf"
            />
            <input className="field" value={inviteLabel} onChange={(event) => setInviteLabel(event.target.value)} aria-label="\u6a19\u7c64" />
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
                <th className="px-2 py-2">\u72c0\u614b</th>
                <th className="px-2 py-2">\u4f7f\u7528\u6b21\u6578</th>
                <th className="px-2 py-2">\u5efa\u7acb\u6642\u9593</th>
                <th className="px-2 py-2">\u64cd\u4f5c</th>
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
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>
                    {t.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <RecordTable
        title={t.lawRecords}
        rows={data.law.map((item) => [item.user_id, `${item.score ?? "-"} / 100`, item.question.slice(0, 80), formatDate(item.created_at)])}
      />
      <RecordTable
        title={t.englishRecords}
        rows={data.english.map((item) => [
          item.user_id,
          `${item.level}/${item.question_type}`,
          item.is_correct === null ? t.notSubmitted : item.is_correct ? t.correct : t.wrong,
          formatDate(item.created_at),
        ])}
      />
      <RecordTable title={t.usageRecords} rows={data.usage.map((item) => [item.user_id, item.action_type, formatDate(item.created_at)])} />
    </div>
  );
}

function RecordTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="panel">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr className="border-t border-slate-200" key={`${title}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td className="px-2 py-3 text-slate-700" key={`${title}-${index}-${cellIndex}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 text-slate-500">{t.empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
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
