"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, FilePenLine, History, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const navItems = [
  { href: "/dashboard", label: "總覽", icon: LayoutDashboard },
  { href: "/law", label: "民法批改", icon: FilePenLine },
  { href: "/english", label: "英文練習", icon: BookOpen },
  { href: "/history", label: "紀錄", icon: History },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
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
            AI Exam Coach Beta
          </Link>
          <button className="btn-secondary" onClick={signOut} type="button">
            <LogOut size={16} />
            登出
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 md:grid-cols-[220px_1fr]">
        <nav className="panel h-fit p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
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
        <main>{children}</main>
      </div>
    </div>
  );
}

