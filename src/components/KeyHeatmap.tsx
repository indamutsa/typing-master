"use client";

import { useKeyStatsStore } from "@/store/keyStats";
import { useSessionStore } from "@/store/session";
import { QWERTY_ROWS } from "@/lib/keymap";
import { getTopWeakKeys } from "@/lib/typing";

function getHeatColor(errorRate: number): string {
  if (errorRate === 0) return "bg-zinc-800 text-zinc-400";
  if (errorRate < 0.1) return "bg-yellow-900/50 text-yellow-300";
  if (errorRate < 0.25) return "bg-orange-900/50 text-orange-300";
  return "bg-red-900/50 text-red-300";
}

export default function KeyHeatmap() {
  const stats = useKeyStatsStore((s) => s.stats);
  const activeKey = useSessionStore((s) => s.activeKey);
  const weakKeys = getTopWeakKeys(stats, 5);
  const weakKeySet = new Set(weakKeys.map((k) => k.key));

  return (
    <div className="flex flex-col items-center gap-1 py-4" data-testid="key-heatmap">
      {QWERTY_ROWS.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1"
          style={{ paddingLeft: `${rowIndex * 20}px` }}
        >
          {row.map((key) => {
            const keyStat = stats[key];
            const errorRate = keyStat
              ? keyStat.errors / keyStat.attempts
              : 0;
            const hasData = keyStat && keyStat.attempts > 0;
            const isWeak = weakKeySet.has(key);
            const isActive = activeKey === key;

            return (
              <div
                key={key}
                className={`
                  w-10 h-10 flex items-center justify-center rounded font-mono text-sm
                  transition-all duration-100
                  ${hasData ? getHeatColor(errorRate) : "bg-zinc-800/50 text-zinc-600"}
                  ${isWeak ? "ring-2 ring-red-500 font-bold" : ""}
                  ${isActive ? "ring-2 ring-amber-400 scale-110 text-amber-400 brightness-125 shadow-lg shadow-amber-500/20" : ""}
                `}
                data-testid={`key-${key}`}
                data-active={isActive || undefined}
                data-error-rate={hasData ? errorRate.toFixed(2) : "0"}
                title={
                  hasData
                    ? `${key}: ${keyStat.attempts} attempts, ${keyStat.errors} errors (${(errorRate * 100).toFixed(1)}%)`
                    : `${key}: no data`
                }
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
