"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session";
import { useSettingsStore } from "@/store/settings";
import { useKeyStatsStore } from "@/store/keyStats";
import { getTopWeakKeys } from "@/lib/typing";
import { generateDrill } from "@/lib/ai";
import { FALLBACK_PASSAGES } from "@/lib/keymap";
import TextDisplay from "@/components/TextDisplay";
import HUD from "@/components/HUD";
import KeyHeatmap from "@/components/KeyHeatmap";
import ResultsModal from "@/components/ResultsModal";
import Link from "next/link";

export default function PracticePage() {
  const startSession = useSessionStore((s) => s.startSession);
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const topN = useSettingsStore((s) => s.topN);
  const stats = useKeyStatsStore((s) => s.stats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDrill = async () => {
    setLoading(true);
    setError(null);
    try {
      const weakKeys = getTopWeakKeys(stats, topN);
      const keys = weakKeys.map((k) => k.key);
      const drillText = await generateDrill("", keys, aiProvider);
      startSession("practice", drillText);
    } catch {
      setError("Failed to generate drill. Using fallback text.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load a random fallback passage on mount — user can generate AI drill manually
    const passage = FALLBACK_PASSAGES[Math.floor(Math.random() * FALLBACK_PASSAGES.length)];
    startSession("practice", passage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-45px)] flex flex-col bg-zinc-950" data-testid="practice-page">
      <HUD />
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4">
        <div className="flex items-center gap-4 mb-4 w-full">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 text-sm"
            data-testid="back-link"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-amber-400">Practice Mode</h1>
          <button
            onClick={loadDrill}
            disabled={loading}
            className="ml-auto text-sm px-3 py-1 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            data-testid="generate-btn"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Generating..." : "Generate New Drill"}
          </button>
        </div>

        {error && (
          <div className="text-amber-400 text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12" data-testid="loading">
            <svg className="animate-spin h-8 w-8 text-amber-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-zinc-500 text-sm">Generating AI drill...</span>
          </div>
        ) : (
          <TextDisplay />
        )}

        <div className="mt-8 w-full">
          <KeyHeatmap />
        </div>
      </div>
      <ResultsModal />
    </div>
  );
}
