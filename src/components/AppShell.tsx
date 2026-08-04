"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, FilePenLine, History, LayoutDashboard, LogOut, ScrollText, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const text = {
  brand: "AI Exam Coach Beta",
  dashboard: "儀表板",
  law: "民法批改",
  english: "英文練習",
  postalRules: "郵政法規",
  history: "學習紀錄",
  admin: "管理後台",
  logout: "登出",
  footer: "© 2026 AI Exam Coach. All rights reserved. Made by KK.",
};

const baseNavItems = [
  { href: "/dashboard", label: text.dashboard, icon: LayoutDashboard },
  { href: "/law", label: text.law, icon: FilePenLine },
  { href: "/english", label: text.english, icon: BookOpen },
  { href: "/postal-rules", label: text.postalRules, icon: ScrollText },
  { href: "/history", label: text.history, icon: History },
];

const adminNavItem = { href: "/admin", label: text.admin, icon: ShieldCheck };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadRole() {
      const { data } = await supabaseBrowser.auth.getSession();
      const session = data.session;
      if (!session) return;

      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!alive) return;
      setIsAdmin(payload.profile?.role === "admin");
    }

    loadRole().catch(() => {
      if (alive) setIsAdmin(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  async function signOut() {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
  }

  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className="font-semibold text-slate-950">
            {text.brand}
          </Link>
          <button className="btn-secondary w-full sm:w-auto" onClick={signOut} type="button">
            <LogOut size={16} />
            {text.logout}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="panel flex h-fit max-w-full gap-1 overflow-x-auto p-2 md:block">
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
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
      <footer className="mx-auto max-w-6xl px-4 pb-6 text-xs text-slate-500">
        <div className="border-t border-slate-200 pt-4">{text.footer}</div>
      </footer>
    </div>
  );
}
