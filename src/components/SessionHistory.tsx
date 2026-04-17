"use client";

import { useHistoryStore } from "@/store/history";
import { SessionRecord } from "@/types";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function modeLabel(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function modeBadgeColor(mode: string): string {
  switch (mode) {
    case "practice":
      return "bg-amber-500/20 text-amber-400";
    case "test":
      return "bg-purple-500/20 text-purple-400";
    case "free":
      return "bg-teal-500/20 text-teal-400";
    default:
      return "bg-zinc-700 text-zinc-400";
  }
}

function SessionRow({ session, onRemove }: { session: SessionRecord; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors group"
      data-testid={`session-${session.id}`}
    >
      <span
        className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${modeBadgeColor(session.mode)}`}
      >
        {modeLabel(session.mode)}
      </span>

      <div className="flex gap-6 flex-1 text-sm font-mono">
        <div>
          <span className="text-zinc-500">WPM </span>
          <span className="text-amber-400 font-bold">{session.wpm}</span>
        </div>
        <div>
          <span className="text-zinc-500">Acc </span>
          <span className="text-teal-400 font-bold">{session.accuracy}%</span>
        </div>
        <div>
          <span className="text-zinc-500">Time </span>
          <span className="text-zinc-300">{session.duration}s</span>
        </div>
        <div>
          <span className="text-zinc-500">Chars </span>
          <span className="text-zinc-300">{session.charsTyped}</span>
        </div>
        <div>
          <span className="text-zinc-500">Streak </span>
          <span className="text-purple-400">{session.bestStreak}</span>
        </div>
      </div>

      <span className="text-xs text-zinc-600">{formatDate(session.completedAt)}</span>

      <button
        onClick={onRemove}
        className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm"
        title="Remove session"
        data-testid={`remove-session-${session.id}`}
      >
        ✕
      </button>
    </div>
  );
}

export default function SessionHistory() {
  const sessions = useHistoryStore((s) => s.sessions);
  const removeSession = useHistoryStore((s) => s.removeSession);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-600 text-sm" data-testid="history-empty">
        No sessions yet. Complete a typing session to see your history.
      </div>
    );
  }

  // Aggregate stats
  const avgWpm = Math.round(
    sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length
  );
  const avgAccuracy =
    Math.round(
      (sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length) * 100
    ) / 100;
  const bestWpm = Math.max(...sessions.map((s) => s.wpm));
  const totalSessions = sessions.length;

  return (
    <div data-testid="session-history">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Sessions</div>
          <div className="text-xl font-bold text-zinc-300 font-mono" data-testid="history-total">
            {totalSessions}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Avg WPM</div>
          <div className="text-xl font-bold text-amber-400 font-mono" data-testid="history-avg-wpm">
            {avgWpm}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Best WPM</div>
          <div className="text-xl font-bold text-amber-400 font-mono" data-testid="history-best-wpm">
            {bestWpm}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 text-center">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Avg Acc</div>
          <div className="text-xl font-bold text-teal-400 font-mono" data-testid="history-avg-acc">
            {avgAccuracy}%
          </div>
        </div>
      </div>

      {/* Session list */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm uppercase tracking-wider text-zinc-500">Recent Sessions</h3>
        <button
          onClick={clearHistory}
          className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
          data-testid="clear-history"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            onRemove={() => removeSession(session.id)}
          />
        ))}
      </div>
    </div>
  );
}
