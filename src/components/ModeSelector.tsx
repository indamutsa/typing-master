"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settings";
import { useKeyStatsStore } from "@/store/keyStats";
import { calculateAccuracy } from "@/lib/typing";
import SessionHistory from "./SessionHistory";

const modes = [
  {
    id: "practice" as const,
    title: "Practice",
    description:
      "AI-generated drills targeting your weakest keys. No timer — just focused improvement.",
    icon: "🎯",
    href: "/practice",
    accent: true,
  },
  {
    id: "test" as const,
    title: "Test",
    description:
      "Timed typing test. Pick a duration and see your WPM and accuracy.",
    icon: "⏱️",
    href: "/test",
    accent: false,
  },
  {
    id: "free" as const,
    title: "Free",
    description:
      "Paste any text and type it. Practice domain-specific vocabulary at your own pace.",
    icon: "📝",
    href: "/free",
    accent: false,
  },
];

export default function ModeSelector() {
  const testDuration = useSettingsStore((s) => s.testDuration);
  const setTestDuration = useSettingsStore((s) => s.setTestDuration);
  const stats = useKeyStatsStore((s) => s.stats);
  const [customDuration, setCustomDuration] = useState("");

  const totalAttempts = Object.values(stats).reduce(
    (sum, s) => sum + s.attempts,
    0
  );
  const totalErrors = Object.values(stats).reduce(
    (sum, s) => sum + s.errors,
    0
  );
  const avgAccuracy = calculateAccuracy(
    totalAttempts - totalErrors,
    totalAttempts
  );

  return (
    <div className="min-h-[calc(100vh-45px)] flex flex-col bg-zinc-950">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" className="mb-4">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#d97706"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="6" fill="url(#bg)"/>
            <rect x="3" y="3" width="26" height="26" rx="4" fill="#18181b" opacity="0.9"/>
            <text x="16" y="22.5" fontFamily="monospace" fontSize="18" fontWeight="bold" fill="#f59e0b" textAnchor="middle">T</text>
            <rect x="6" y="25" width="20" height="2" rx="1" fill="#f59e0b" opacity="0.3"/>
          </svg>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2 font-mono">
            TypeMaster
          </h1>
          <p className="text-zinc-500">
            AI-powered typing trainer — target your weak keys
          </p>
        </div>

        {/* Mode cards */}
        <div
          className="grid md:grid-cols-3 gap-4 mb-10"
          data-testid="mode-selector"
        >
          {modes.map((mode) => (
            <Link
              key={mode.id}
              href={mode.href}
              className={`
                p-6 rounded-xl border text-left transition-all block
                hover:scale-[1.02] hover:shadow-lg
                ${
                  mode.accent
                    ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-400"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                }
              `}
              data-testid={`mode-${mode.id}`}
            >
              <div className="text-3xl mb-3">{mode.icon}</div>
              <h2
                className={`text-xl font-bold mb-2 ${
                  mode.accent ? "text-amber-400" : "text-zinc-200"
                }`}
              >
                {mode.title}
              </h2>
              <p className="text-sm text-zinc-500">{mode.description}</p>

              {mode.id === "test" && (
                <div
                  className="mt-4 flex gap-2"
                  onClick={(e) => e.preventDefault()}
                >
                  {[30, 60].map((d) => (
                    <button
                      key={d}
                      onClick={(e) => {
                        e.preventDefault();
                        setTestDuration(d);
                      }}
                      className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                        testDuration === d
                          ? "bg-amber-500 text-black"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                      data-testid={`duration-${d}`}
                    >
                      {d}s
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customDuration}
                    onChange={(e) => {
                      setCustomDuration(e.target.value);
                      const val = parseInt(e.target.value);
                      if (val > 0) setTestDuration(val);
                    }}
                    onClick={(e) => e.preventDefault()}
                    className="w-20 px-2 py-1 rounded text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 focus:border-amber-500 outline-none"
                    data-testid="duration-custom"
                  />
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Session history */}
        <SessionHistory />
      </div>

      {/* Stats strip */}
      <div
        className="border-t border-zinc-800 px-6 py-4 flex justify-center gap-8 text-sm"
        data-testid="stats-strip"
      >
        <div>
          <span className="text-zinc-500">Total keystrokes: </span>
          <span className="text-zinc-300 font-mono" data-testid="total-keystrokes">
            {totalAttempts}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Overall accuracy: </span>
          <span className="text-teal-400 font-mono" data-testid="overall-accuracy">
            {avgAccuracy}%
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Keys tracked: </span>
          <span className="text-zinc-300 font-mono" data-testid="keys-tracked">
            {Object.keys(stats).length}
          </span>
        </div>
      </div>
    </div>
  );
}
