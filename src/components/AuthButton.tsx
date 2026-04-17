"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-16 h-6 bg-zinc-800 rounded animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 hidden sm:inline">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-3 py-1.5 rounded text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          data-testid="auth-logout"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="px-3 py-1.5 rounded text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
      data-testid="auth-login"
    >
      Login
    </Link>
  );
}
