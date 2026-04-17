"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SessionData {
  mode: string;
  wpm: number;
  accuracy: number;
  completedAt: number;
}

const MODE_COLORS: Record<string, string> = {
  practice: "#f59e0b",
  test: "#a855f7",
  free: "#2dd4bf",
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardCharts({
  sessions,
}: {
  sessions: SessionData[];
}) {
  const sorted = [...sessions].sort(
    (a, b) => a.completedAt - b.completedAt
  );

  const data = sorted.map((s) => ({
    date: formatDate(s.completedAt),
    wpm: s.wpm,
    accuracy: s.accuracy,
    mode: s.mode,
    fill: MODE_COLORS[s.mode] || "#f59e0b",
  }));

  if (data.length === 0) {
    return (
      <div className="text-zinc-500 text-center py-12">
        No sessions yet. Complete some typing sessions to see charts.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">
          WPM Over Time
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              tick={{ fontSize: 11 }}
            />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="wpm"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">
          Accuracy Over Time
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value) => [`${value}%`, "Accuracy"]}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#2dd4bf"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
