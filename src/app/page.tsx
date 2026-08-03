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

const text = {
  brandSub: "\u90f5\u5c40\u5167\u5347\u8003\u8a66\u7df4\u7fd2\u5e73\u53f0",
  login: "\u767b\u5165",
  register: "\u8a3b\u518a\u5e33\u865f",
  badge: "\u5167\u90e8\u8a66\u7528\u7248\uff1a\u767b\u5165\u5f8c\u7531\u7ba1\u7406\u8005\u555f\u7528",
  heroTitle: "\u90f5\u5c40\u5167\u5347\u8003\u8a66\u7684 AI \u7df4\u7fd2\u6559\u7df4",
  heroDesc:
    "\u6574\u5408\u6c11\u6cd5\u7533\u8ad6\u6279\u6539\u8207\u82f1\u6587\u984c\u76ee\u7df4\u7fd2\uff0c\u5e6b\u52a9\u8003\u751f\u7528\u66f4\u6709\u7d50\u69cb\u7684\u65b9\u5f0f\u7df4\u7fd2\u3001\u6aa2\u8996\u5f31\u9ede\uff0c\u4e26\u7d2f\u7a4d\u81ea\u5df1\u7684\u5b78\u7fd2\u7d00\u9304\u3002",
  lawDemo: "\u8a66\u7528\u6c11\u6cd5\u6279\u6539",
  englishDemo: "\u8a66\u7528\u82f1\u6587\u7df4\u7fd2",
  lawLimit: "\u6c11\u6cd5\u7df4\u7fd2",
  englishLimit: "\u82f1\u6587\u7df4\u7fd2",
  controlledUse: "\u4f7f\u7528\u6b0a\u9650",
  moduleEyebrow: "Practice Modules",
  moduleTitle: "\u76ee\u524d\u53ef\u7528\u7df4\u7fd2\u6a21\u7d44",
  moduleDesc: "\u6b63\u5f0f\u7df4\u7fd2\u9700\u767b\u5165\u4e26\u7531\u7ba1\u7406\u8005\u555f\u7528\uff1b\u8a66\u7528\u9801\u9762\u53ef\u7528\u65bc\u5feb\u901f\u6aa2\u8996\u529f\u80fd\u6548\u679c\u3002",
  controlTitle: "\u5e33\u865f\u8207\u4f7f\u7528\u6b0a\u9650",
  controlDesc: "\u5e33\u865f\u8a3b\u518a\u5f8c\u4e0d\u6703\u81ea\u52d5\u555f\u7528\u6b63\u5f0f\u7df4\u7fd2\u3002\u7ba1\u7406\u8005\u53ef\u5728\u5f8c\u53f0\u958b\u901a\u6703\u54e1\u3001\u767c\u653e\u4e00\u6b21\u6027\u9080\u8acb\u78bc\uff0c\u4e26\u6aa2\u8996\u4f7f\u7528\u7d00\u9304\u3002",
  adminControl: "\u7ba1\u7406\u8005\u53ef\u63a7\u5236\u8ab0\u80fd\u6b63\u5f0f\u4f7f\u7528",
  adminControlDesc:
    "\u9019\u500b\u7248\u672c\u9069\u5408\u5148\u7d66\u5c11\u91cf\u540c\u4e8b\u8a66\u7528\uff0c\u900f\u904e\u5f8c\u53f0\u555f\u7528\u3001\u9080\u8acb\u78bc\u8207\u6bcf\u65e5\u6b21\u6578\u9650\u5236\uff0c\u78ba\u4fdd\u4f7f\u7528\u7bc4\u570d\u53ef\u63a7\uff0c\u4e26\u6301\u7e8c\u6821\u6e96\u6279\u6539\u54c1\u8cea\u8207\u984c\u76ee\u65b9\u5411\u3002",
  workflowEyebrow: "Workflow",
  workflowTitle: "\u5efa\u8b70\u7df4\u7fd2\u6d41\u7a0b",
  footer: "\u00a9 2026 AI Exam Coach. All rights reserved.",
  footerDesc: "Built by KK.",
};

const practiceEntries = [
  {
    title: "\u6c11\u6cd5\u7533\u8ad6 AI \u6279\u6539",
    description: "\u8f38\u5165\u6c11\u6cd5\u7533\u8ad6\u7b54\u6848\u5f8c\uff0c\u7cfb\u7d71\u6703\u4f9d\u722d\u9ede\u3001\u6cd5\u689d\u3001\u6db5\u651d\u8207\u7d50\u8ad6\u7d66\u4e88\u56de\u994b\u3002",
    meta: "\u6bcf\u65e5\u6700\u591a 2 \u6b21",
    icon: ClipboardCheck,
    href: "/demo/law",
    action: "\u958b\u59cb\u6c11\u6cd5\u7df4\u7fd2",
    accent: "sky",
  },
  {
    title: "\u82f1\u6587\u7d9c\u5408\u984c\u76ee\u7df4\u7fd2",
    description: "\u4f9d\u90f5\u5c40\u5167\u5347\u8003\u8a66\u984c\u578b\u8a2d\u8a08\uff0c\u63d0\u4f9b\u55ae\u5b57\u3001\u6587\u6cd5\u3001\u95b1\u8b80\u8207\u89e3\u6790\u7df4\u7fd2\u3002",
    meta: "\u6bcf\u65e5\u6700\u591a 1 \u4efd\u8003\u5377",
    icon: BookOpenCheck,
    href: "/demo/english",
    action: "\u958b\u59cb\u82f1\u6587\u7df4\u7fd2",
    accent: "indigo",
  },
];

const workflow = [
  { title: "\u9078\u64c7\u984c\u578b", text: "\u5148\u9078\u6c11\u6cd5\u6216\u82f1\u6587\u7df4\u7fd2\uff0c\u4f9d\u7cfb\u7d71\u984c\u76ee\u9032\u884c\u4f5c\u7b54\u3002" },
  { title: "\u53d6\u5f97\u56de\u994b", text: "\u6c11\u6cd5\u6703\u56de\u994b\u5206\u6578\u3001\u722d\u9ede\u3001\u6db5\u651d\u8207\u4fee\u6b63\u65b9\u5411\uff1b\u82f1\u6587\u63d0\u4f9b\u7b54\u6848\u8207\u4e2d\u6587\u89e3\u6790\u3002" },
  { title: "\u8ffd\u8e64\u5f31\u9ede", text: "\u767b\u5165\u5f8c\u53ef\u4fdd\u7559\u7df4\u7fd2\u7d00\u9304\uff0c\u4fbf\u65bc\u5f8c\u7e8c\u6aa2\u8996\u5206\u6578\u8207\u5b78\u7fd2\u72c0\u614b\u3002" },
];

const safeguards = [
  "\u672a\u555f\u7528\u5e33\u865f\u7121\u6cd5\u4f7f\u7528\u6b63\u5f0f\u7df4\u7fd2\uff0c\u78ba\u4fdd\u7df4\u7fd2\u8cc7\u6e90\u4f9d\u540d\u55ae\u958b\u653e\u3002",
  "\u6c11\u6cd5\u8207\u82f1\u6587\u5747\u6709\u6bcf\u65e5\u6b21\u6578\u9650\u5236\uff0c\u9069\u5408\u5c0f\u7bc4\u570d\u7a69\u5b9a\u8a66\u7528\u3002",
  "\u5f8c\u53f0\u53ef\u67e5\u770b\u4f7f\u7528\u8005\u7d00\u9304\u3001\u555f\u7528\u6703\u54e1\u8207\u505c\u7528\u9080\u8acb\u78bc\u3002",
];

const statusItems = ["\u6c11\u6cd5\u6279\u6539 MVP", "\u82f1\u6587\u984c\u76ee\u7df4\u7fd2", "\u5f8c\u53f0\u6b0a\u9650\u63a7\u7ba1"];

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
              <p className="text-xs text-slate-500">{text.brandSub}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50" href="/login">
              {text.login}
            </Link>
            <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700" href="/register">
              {text.register}
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
                {text.badge}
              </div>
              {statusItems.map((item) => (
                <span className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl">{text.heroTitle}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{text.heroDesc}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700" href="/demo/law">
                {text.lawDemo}
                <ArrowRight size={16} />
              </Link>
              <Link className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50" href="/demo/english">
                {text.englishDemo}
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label={text.lawLimit} value="2 / day" />
              <Metric label={text.englishLimit} value="1 paper / day" />
              <Metric label={text.controlledUse} value="Admin unlock" />
            </div>
          </div>

          <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-[0_18px_45px_rgba(14,116,144,0.10)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-sky-600 text-white">
                <LockKeyhole size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">{text.controlTitle}</h2>
                <p className="text-sm text-slate-500">{text.controlDesc}</p>
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
                {text.adminControl}
              </div>
              {text.adminControlDesc}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{text.moduleEyebrow}</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{text.moduleTitle}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{text.moduleDesc}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {practiceEntries.map((entry) => {
            const isLaw = entry.accent === "sky";
            return (
              <Link className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" href={entry.href} key={entry.title}>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{text.workflowEyebrow}</p>
              <h2 className="text-2xl font-bold text-slate-950">{text.workflowTitle}</h2>
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
          <p>{text.footer}</p>
          <div className="flex items-center gap-2 text-slate-300">
            <TimerReset size={15} />
            {text.footerDesc}
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
