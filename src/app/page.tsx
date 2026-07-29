import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

const practiceEntries = [
  {
    title: "民法申論批改",
    description: "針對爭點、請求權基礎、法條理解、三段論與具體涵攝提供批改回饋，適合考前反覆練習手感。",
    meta: "每日正式練習 3 次",
    icon: ClipboardCheck,
    href: "/demo/law",
    action: "開始民法練習",
    accent: "emerald",
  },
  {
    title: "郵局英文題目練習",
    description: "以郵局內升考試題型為基礎，練習單字、對話、閱讀與翻譯，解析改用中文方便快速訂正。",
    meta: "每日正式練習 5 次",
    icon: BookOpenCheck,
    href: "/demo/english",
    action: "開始英文練習",
    accent: "indigo",
  },
];

const workflow = [
  { title: "選擇科目", text: "先選民法申論或英文題型，不需要設定複雜參數。" },
  { title: "完成作答", text: "民法輸入申論答案，英文依題型作答或翻譯。" },
  { title: "取得回饋", text: "系統整理分數、弱點、缺漏與下次練習方向。" },
];

const safeguards = [
  "未解鎖帳號不得呼叫正式 API，避免試用期間 token 被誤用。",
  "每日練習次數由後端控管，避免只靠前端限制被繞過。",
  "英文先採 seed 題庫與小幅變形，降低成本，也保留考古題風格。",
];

const statusItems = ["民法申論批改 MVP", "郵局英文題庫", "解鎖碼內測"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#eef6ff] text-slate-950">
      <header className="border-b border-sky-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link className="flex items-center gap-3" href="/">
            <div className="grid size-10 place-items-center rounded-lg bg-sky-600 text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">AI Exam Coach</p>
              <p className="text-xs text-slate-500">郵局內升考試練習平台</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50" href="/login">
              登入
            </Link>
            <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700" href="/register">
              建立帳號
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-sky-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-10">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <ShieldCheck size={14} />
                內測版本：給同事考前練習使用
              </div>
              {statusItems.map((item) => (
                <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl">
              郵局內升考試的 AI 練習教練
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              先聚焦民法申論與英文題目練習，讓考生可以在短時間內反覆作答、取得具體回饋，知道下一次該補強哪一段，而不是只看到一個分數。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700" href="/demo/law">
                試用民法批改
                <ArrowRight size={16} />
              </Link>
              <Link className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50" href="/demo/english">
                試用英文出題
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="民法練習" value="3 次 / 日" />
              <Metric label="英文練習" value="5 次 / 日" />
              <Metric label="內測規模" value="約 10 人" />
            </div>
          </div>

          <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-[0_18px_45px_rgba(14,116,144,0.10)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-sky-600 text-white">
                <LockKeyhole size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">正式會員採解鎖碼啟用</h2>
                <p className="text-sm text-slate-500">註冊後先建立帳號，由管理者提供解鎖碼才開放正式練習。</p>
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
                管理者可控制誰能正式使用
              </div>
              這個版本適合先給小規模同事試用，等確認批改品質與題目方向穩定後，再擴充完整會員制與付費方案。
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Practice Modules</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">選一科，直接開始練習</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">首頁不堆功能說明，讓考生一眼看懂目前能做什麼，也讓作品集展示更像一個可用產品。</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {practiceEntries.map((entry) => {
            const isLaw = entry.accent === "emerald";
            return (
              <Link
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href={entry.href}
                key={entry.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`grid size-12 place-items-center rounded-lg ${isLaw ? "bg-sky-50 text-sky-700" : "bg-indigo-50 text-indigo-700"}`}>
                    <entry.icon size={22} />
                  </div>
                  <ArrowRight className={`text-slate-300 transition ${isLaw ? "group-hover:text-sky-700" : "group-hover:text-indigo-700"}`} size={20} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">{entry.title}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600">{entry.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    <TimerReset size={14} />
                    {entry.meta}
                  </span>
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold ${isLaw ? "text-sky-700" : "text-indigo-700"}`}>
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
              <h2 className="text-2xl font-bold text-slate-950">考生使用流程</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {workflow.map((item, index) => (
              <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-4" key={item.title}>
                <div className="mb-3 inline-flex size-8 items-center justify-center rounded-md bg-sky-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>AI Exam Coach Beta - Postal promotion practice MVP.</p>
          <div className="flex items-center gap-2 text-slate-300">
            <TimerReset size={15} />
            先用 seed 題庫降低 token 成本，再逐步導入 AI 變形題。
          </div>
        </div>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
