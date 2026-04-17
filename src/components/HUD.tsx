"use client";

import { useSessionStore } from "@/store/session";

export default function HUD() {
  const { wpm, accuracy, streak } = useSessionStore();

  return (
    <div
      className="flex items-center justify-center px-6 py-3 bg-zinc-900/80 backdrop-blur border-b border-zinc-800"
      data-testid="hud"
    >
      <div className="flex gap-8">
        <div className="flex flex-col items-center" data-testid="hud-wpm">
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            WPM
          </span>
          <span className="text-2xl font-bold text-amber-400 font-mono">
            {wpm}
          </span>
        </div>
        <div className="flex flex-col items-center" data-testid="hud-accuracy">
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            Accuracy
          </span>
          <span className="text-2xl font-bold text-teal-400 font-mono">
            {accuracy}%
          </span>
        </div>
        <div className="flex flex-col items-center" data-testid="hud-streak">
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            Streak
          </span>
          <span className="text-2xl font-bold text-purple-400 font-mono">
            {streak}
          </span>
        </div>
      </div>
    </div>
  );
}
