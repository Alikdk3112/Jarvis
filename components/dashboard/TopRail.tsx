"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemo } from "@/lib/demo/DemoContext";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/crm", label: "CRM" },
  { href: "/brain", label: "Brain" },
  { href: "/finance", label: "Finance" },
  { href: "/journal", label: "Journal" },
  { href: "/health", label: "Health" },
];

export function TopRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { demo, toggle } = useDemo();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="panel flex items-center justify-between gap-4 px-4 py-3">
      <div className="text-sm font-semibold tracking-wide text-ink-4">Personal OS</div>
      <nav className="flex gap-1 rounded-lg bg-ink-1 p-1">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                active ? "bg-accent-dim text-accent" : "text-ink-3 hover:text-ink-4"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="mono flex items-center gap-3 text-xs text-ink-3">
        <span suppressHydrationWarning>
          {now
            ? now.toLocaleString(undefined, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
        <button
          onClick={toggle}
          className={`rounded-md px-2 py-1 ${demo ? "bg-warn/20 text-warn" : "hover:bg-ink-2 hover:text-ink-4"}`}
        >
          Demo
        </button>
        <button onClick={logout} className="rounded-md px-2 py-1 hover:bg-ink-2 hover:text-ink-4">
          Log out
        </button>
      </div>
    </header>
  );
}
