"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardCharts from "@/components/DashboardCharts";
import HeatCalendar from "@/components/HeatCalendar";
import KeyDrillDown from "@/components/KeyDrillDown";

interface SessionData {
  id: string;
  mode: string;
  wpm: number;
  accuracy: number;
  duration: number;
  charsTyped: number;
  bestStreak: number;
  completedAt: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [keyStats, setKeyStats] = useState<
    Record<string, { attempts: number; errors: number }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/sessions").then((r) => r.json()),
      fetch("/api/keystats").then((r) => r.json()),
    ])
      .then(([sessionsData, statsData]) => {
        if (Array.isArray(sessionsData)) setSessions(sessionsData);
        if (statsData && !statsData.error) setKeyStats(statsData);
      })
      .finally(() => setLoading(false));
  }, [status, router, session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[calc(100vh-45px)] flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-500">Loading dashboard...</div>
      </div>
    );
  }

  // Summary stats
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgWpm =
    totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / totalSessions)
      : 0;
  const avgAccuracy =
    totalSessions > 0
      ? Math.round(
          (sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions) *
            100
        ) / 100
      : 0;
  const bestWpm =
    totalSessions > 0 ? Math.max(...sessions.map((s) => s.wpm)) : 0;

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m < 60) return `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  };

  return (
    <div
      className="min-h-[calc(100vh-45px)] bg-zinc-950 px-4 py-6"
      data-testid="dashboard-page"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-amber-400">
          Analytics Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Sessions", value: totalSessions, color: "text-amber-400" },
            { label: "Total Time", value: formatTime(totalTime), color: "text-teal-400" },
            { label: "Avg WPM", value: avgWpm, color: "text-amber-400" },
            { label: "Best WPM", value: bestWpm, color: "text-purple-400" },
            { label: "Avg Accuracy", value: `${avgAccuracy}%`, color: "text-teal-400" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
            >
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                {card.label}
              </div>
              <div className={`text-2xl font-bold font-mono ${card.color}`}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Heat Calendar */}
        <HeatCalendar sessions={sessions} />

        {/* Charts */}
        <DashboardCharts sessions={sessions} />

        {/* Key Drill Down */}
        <KeyDrillDown keyStats={keyStats} />
      </div>
    </div>
  );
}
