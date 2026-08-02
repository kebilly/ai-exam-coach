"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, FilePenLine, History, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const text = {
  brand: "AI Exam Coach Beta",
  dashboard: "\u5100\u8868\u677f",
  law: "\u6c11\u6cd5\u6279\u6539",
  english: "\u82f1\u6587\u7df4\u7fd2",
  history: "\u5b78\u7fd2\u7d00\u9304",
  admin: "\u7ba1\u7406\u5f8c\u53f0",
  logout: "\u767b\u51fa",
};

const navItems = [
  { href: "/dashboard", label: text.dashboard, icon: LayoutDashboard },
  { href: "/law", label: text.law, icon: FilePenLine },
  { href: "/english", label: text.english, icon: BookOpen },
  { href: "/history", label: text.history, icon: History },
  { href: "/admin", label: text.admin, icon: ShieldCheck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold text-slate-950">
            {text.brand}
          </Link>
          <button className="btn-secondary" onClick={signOut} type="button">
            <LogOut size={16} />
            {text.logout}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="panel flex h-fit gap-1 overflow-x-auto p-2 md:block">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
