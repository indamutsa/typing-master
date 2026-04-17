"use client";

import { useState } from "react";

interface KeyData {
  key: string;
  attempts: number;
  errors: number;
  errorRate: number;
}

type SortField = "key" | "attempts" | "errors" | "errorRate";

export default function KeyDrillDown({
  keyStats,
}: {
  keyStats: Record<string, { attempts: number; errors: number }>;
}) {
  const [sortBy, setSortBy] = useState<SortField>("errorRate");
  const [sortAsc, setSortAsc] = useState(false);

  const keys: KeyData[] = Object.entries(keyStats).map(([key, val]) => ({
    key,
    attempts: val.attempts,
    errors: val.errors,
    errorRate: val.attempts > 0 ? val.errors / val.attempts : 0,
  }));

  const sorted = [...keys].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortBy === "key") return mul * a.key.localeCompare(b.key);
    return mul * (a[sortBy] - b[sortBy]);
  });

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  const arrow = (field: SortField) =>
    sortBy === field ? (sortAsc ? " ↑" : " ↓") : "";

  if (keys.length === 0) {
    return (
      <div className="text-zinc-500 text-center py-8">
        No key data tracked yet.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">
        Per-Key Breakdown
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
              {(
                [
                  ["key", "Key"],
                  ["attempts", "Attempts"],
                  ["errors", "Errors"],
                  ["errorRate", "Error Rate"],
                ] as [SortField, string][]
              ).map(([field, label]) => (
                <th
                  key={field}
                  className="py-2 px-3 text-left cursor-pointer hover:text-zinc-300 transition-colors"
                  onClick={() => handleSort(field)}
                >
                  {label}
                  {arrow(field)}
                </th>
              ))}
              <th className="py-2 px-3 text-left">Visual</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((k) => (
              <tr
                key={k.key}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
              >
                <td className="py-2 px-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-800 rounded font-mono font-bold text-amber-400">
                    {k.key === " " ? "␣" : k.key}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono text-zinc-300">
                  {k.attempts}
                </td>
                <td className="py-2 px-3 font-mono text-zinc-300">
                  {k.errors}
                </td>
                <td className="py-2 px-3 font-mono">
                  <span
                    className={
                      k.errorRate > 0.3
                        ? "text-red-400"
                        : k.errorRate > 0.15
                        ? "text-amber-400"
                        : "text-teal-400"
                    }
                  >
                    {(k.errorRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        k.errorRate > 0.3
                          ? "bg-red-500"
                          : k.errorRate > 0.15
                          ? "bg-amber-500"
                          : "bg-teal-500"
                      }`}
                      style={{
                        width: `${Math.min(k.errorRate * 100, 100)}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
