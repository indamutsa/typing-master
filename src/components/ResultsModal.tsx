"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/session";
import { useKeyStatsStore } from "@/store/keyStats";
import { useHistoryStore } from "@/store/history";
import { getTopWeakKeys } from "@/lib/typing";
import { useRouter } from "next/navigation";
import { playSessionComplete } from "@/lib/sound";

export default function ResultsModal() {
  const { wpm, accuracy, typed, startedAt, finished, text, mode, bestStreak } =
    useSessionStore();
  const reset = useSessionStore((s) => s.reset);
  const stats = useKeyStatsStore((s) => s.stats);
  const addSession = useHistoryStore((s) => s.addSession);
  const router = useRouter();
  const savedRef = useRef(false);

  // Save session to history when it finishes
  useEffect(() => {
    if (finished && typed.length > 0 && !savedRef.current) {
      savedRef.current = true;
      playSessionComplete();
      const elapsed = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
      const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        mode,
        wpm,
        accuracy,
        duration: elapsed,
        charsTyped: typed.length,
        bestStreak,
        completedAt: Date.now(),
      };
      addSession(record);
      // Also save to server for logged-in users
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(() => {});
    }
    if (!finished) {
      savedRef.current = false;
    }
  }, [finished, typed, startedAt, mode, wpm, accuracy, bestStreak, addSession]);

  if (!finished) return null;

  const elapsed = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
  const weakKeys = getTopWeakKeys(stats, 5);

  const handleNewSession = () => {
    reset();
    router.push("/");
  };

  const handleRetry = () => {
    const sessionStore = useSessionStore.getState();
    sessionStore.startSession(mode, text, sessionStore.duration);
  };

  const handleDrill = () => {
    reset();
    router.push("/practice");
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      data-testid="results-modal"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-lg w-full mx-4 relative">
        <button
          onClick={handleNewSession}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
          data-testid="results-close"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">
          Session Complete
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className="bg-zinc-800/50 rounded-lg p-4 text-center"
            data-testid="result-wpm"
          >
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
              WPM
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {wpm}
            </div>
          </div>
          <div
            className="bg-zinc-800/50 rounded-lg p-4 text-center"
            data-testid="result-accuracy"
          >
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
              Accuracy
            </div>
            <div className="text-3xl font-bold text-teal-400 font-mono">
              {accuracy}%
            </div>
          </div>
          <div
            className="bg-zinc-800/50 rounded-lg p-4 text-center"
            data-testid="result-time"
          >
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
              Time
            </div>
            <div className="text-3xl font-bold text-zinc-300 font-mono">
              {elapsed}s
            </div>
          </div>
          <div
            className="bg-zinc-800/50 rounded-lg p-4 text-center"
            data-testid="result-chars"
          >
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
              Characters
            </div>
            <div className="text-3xl font-bold text-zinc-300 font-mono">
              {typed.length}
            </div>
          </div>
        </div>

        {weakKeys.length > 0 && (
          <div className="mb-6" data-testid="result-weak-keys">
            <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-3">
              Top Struggling Keys
            </h3>
            <div className="space-y-2">
              {weakKeys.map(({ key, errorRate }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-red-400 font-bold">
                    {key}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${Math.min(errorRate * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono w-12 text-right">
                    {(errorRate * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDrill}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
            data-testid="btn-drill"
          >
            AI Drill
          </button>
          <button
            onClick={handleRetry}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg transition-colors"
            data-testid="btn-retry"
          >
            Retry
          </button>
          <button
            onClick={handleNewSession}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg transition-colors"
            data-testid="btn-new-session"
          >
            New Session
          </button>
        </div>
      </div>
    </div>
  );
}
