"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/session";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import AuthButton from "./AuthButton";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/test", label: "Test" },
  { href: "/free", label: "Free" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { mode, startedAt, duration, finished } = useSessionStore();
  const finishSession = useSessionStore((s) => s.finishSession);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleTimerEnd = useCallback(() => {
    finishSession();
  }, [finishSession]);

  useEffect(() => {
    if (mode !== "test" || !startedAt || finished) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        clearInterval(interval);
        handleTimerEnd();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startedAt, duration, mode, finished, handleTimerEnd]);

  const showTimer = mode === "test" && pathname === "/test";

  return (
    <nav
      className="relative flex items-center gap-1 px-4 py-2 bg-zinc-900/80 backdrop-blur border-b border-zinc-800"
      data-testid="navbar"
    >
      <Link
        href="/"
        className="text-amber-400 font-bold text-lg mr-4 hover:text-amber-300 transition-colors"
        data-testid="navbar-brand"
      >
        TypeMaster
      </Link>

      <div className="flex gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-1.5 rounded text-sm transition-colors
                ${
                  isActive
                    ? "bg-zinc-800 text-amber-400"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }
              `}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.label}
            </Link>
          );
        })}
        {session?.user && (
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              pathname === "/dashboard"
                ? "bg-zinc-800 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
            data-testid="nav-dashboard"
          >
            Dashboard
          </Link>
        )}
      </div>

      <div className="ml-auto">
        <AuthButton />
      </div>

      {showTimer && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
          data-testid="hud-timer"
        >
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            Time
          </span>
          <span
            className={`text-lg font-bold font-mono ${
              timeLeft !== null && timeLeft <= 10
                ? "text-red-400"
                : "text-amber-400"
            }`}
          >
            {timeLeft !== null ? `${timeLeft}s` : `${duration}s`}
          </span>
        </div>
      )}
    </nav>
  );
}
