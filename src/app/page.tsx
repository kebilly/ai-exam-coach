import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  KeyRound,
  LockKeyhole,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

const practiceEntries = [
  {
    title: "民法申論批改",
    description: "針對民法申論答案提供分數、爭點、法條、論證與結論回饋，協助考生看出真正失分原因。",
    meta: "正式會員每日 2 次",
    icon: ClipboardCheck,
    href: "/demo/law",
    action: "試看民法 demo",
    accent: "sky",
  },
  {
    title: "英文完整考卷",
    description: "依郵局內升考試方向設計英文練習，包含字彙、文法、克漏字、閱讀與中文解析。",
    meta: "正式會員每日 1 回",
    icon: BookOpenCheck,
    href: "/demo/english",
    action: "試看英文 demo",
    accent: "indigo",
  },
  {
    title: "郵政法規選擇題",
    description: "依郵政法、郵儲法、壽險法、郵件處理規則與郵務營業規章建立練習題型。",
    meta: "正式會員每日 1 回",
    icon: ScrollText,
    href: "/demo/postal-rules",
    action: "試看郵政法規 demo",
    accent: "cyan",
  },
];

const safeguards = [
  "正式功能需登入並通過管理者啟用，避免未授權使用者消耗 API 額度。",
  "民法、英文與郵政法規分別設有每日使用上限，方便小規模同事測試。",
  "練習紀錄會保存於資料庫，後台可檢視使用狀態與批改紀錄。",
];

const workflow = [
  {
    title: "建立帳號",
    text: "使用者先註冊登入，尚未啟用前只能查看引導式 demo。",
  },
  {
    title: "管理者啟用",
    text: "管理者可在後台審核使用者或發放邀請碼，控制誰能使用正式功能。",
  },
  {
    title: "開始練習",
    text: "正式會員可依每日額度進行民法批改、英文考卷與郵政法規練習。",
  },
];

const statusItems = ["民法批改 MVP", "英文考卷練習", "郵政法規題庫", "會員啟用控管"];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef6ff] text-slate-950">
      <header className="border-b border-sky-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="flex min-w-0 items-center gap-3" href="/">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-600 text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950">AI Exam Coach</p>
              <p className="text-xs text-slate-500">郵局內升考試練習平台</p>
            </div>
          </Link>

          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:flex-none"
              href="/login"
            >
              登入
            </Link>
            <Link
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 sm:flex-none"
              href="/register"
            >
              建立帳號
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-sky-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:py-10">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="inline-flex max-w-full items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <ShieldCheck size={14} />
                <span>會員啟用後才可使用正式練習</span>
              </div>
              {statusItems.map((item) => (
                <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl">
              郵局內升考試的 AI 練習教練
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              以民法申論批改、英文完整考卷與郵政法規選擇題為核心，協助考生在有限時間內反覆練習、檢查弱點，並留下可追蹤的學習紀錄。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                href="/demo/law"
              >
                試看民法 demo
                <ArrowRight size={16} />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                href="/demo/english"
              >
                試看英文 demo
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 px-5 py-2.5 text-sm font-semibold text-cyan-800 shadow-sm transition hover:bg-cyan-100"
                href="/demo/postal-rules"
              >
                試看郵政法規 demo
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="民法練習" value="2 / day" />
              <Metric label="英文考卷" value="1 paper / day" />
              <Metric label="郵政法規" value="1 set / day" />
              <Metric label="使用權限" value="Admin unlock" />
            </div>
          </div>

          <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-[0_18px_45px_rgba(14,116,144,0.10)]">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-600 text-white">
                <LockKeyhole size={21} />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-slate-950">小規模試用控管</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  適合先給同事測試：先註冊，再由管理者啟用正式功能，避免公開連結造成額外使用成本。
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {safeguards.map((item) => (
                <div className="flex gap-3 rounded-md border border-sky-100 bg-sky-50/60 px-3 py-3 text-sm leading-6 text-slate-700" key={item}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-sky-600" size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <KeyRound size={16} />
                管理者控制
              </div>
              可由後台檢視使用者、邀請碼、練習紀錄與啟用狀態，方便掌握測試期間的使用情況。
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Practice Modules</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">三個練習模組</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            首頁 demo 用來讓使用者理解流程；正式練習則需登入並啟用會員資格。
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {practiceEntries.map((entry) => {
            const Icon = entry.icon;
            const isLaw = entry.accent === "sky";
            const isPostal = entry.accent === "cyan";
            const tone = isLaw ? "text-sky-700 bg-sky-50" : isPostal ? "text-cyan-700 bg-cyan-50" : "text-indigo-700 bg-indigo-50";
            const linkTone = isLaw ? "text-sky-700 group-hover:text-sky-800" : isPostal ? "text-cyan-700 group-hover:text-cyan-800" : "text-indigo-700 group-hover:text-indigo-800";

            return (
              <Link
                className="group flex min-h-[210px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href={entry.href}
                key={entry.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`grid size-12 place-items-center rounded-lg ${tone}`}>
                    <Icon size={22} />
                  </div>
                  <ArrowRight className={`text-slate-300 transition ${linkTone}`} size={20} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">{entry.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{entry.description}</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    <TimerReset size={14} />
                    {entry.meta}
                  </span>
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold ${linkTone}`}>
                    {entry.action}
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow</p>
              <h2 className="text-2xl font-bold text-slate-950">從啟用到練習</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {workflow.map((item, index) => (
              <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-4" key={item.title}>
                <div className="mb-3 inline-flex size-8 items-center justify-center rounded-md bg-sky-600 text-sm font-bold text-white">{index + 1}</div>
                <h3 className="font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AI Exam Coach. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-300">
            <TimerReset size={15} />
            Made by KK.
          </div>
        </div>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="truncate text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">{value}</p>
    </div>
  );
}
