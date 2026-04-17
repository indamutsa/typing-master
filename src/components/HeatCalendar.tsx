"use client";

interface HeatCalendarProps {
  sessions: { completedAt: number }[];
}

function getDayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-zinc-800";
  if (count === 1) return "bg-amber-900";
  if (count === 2) return "bg-amber-700";
  if (count <= 4) return "bg-amber-500";
  return "bg-amber-400";
}

export default function HeatCalendar({ sessions }: HeatCalendarProps) {
  // Count sessions per day
  const dayCounts: Record<string, number> = {};
  for (const s of sessions) {
    const key = getDayKey(s.completedAt);
    dayCounts[key] = (dayCounts[key] || 0) + 1;
  }

  // Generate last 52 weeks of days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { date: Date; key: string; count: number }[] = [];

  // Start from 52 weeks ago, aligned to Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - 363 - start.getDay());

  for (let i = 0; i < 371; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d > today) break;
    const key = getDayKey(d.getTime());
    days.push({ date: d, key, count: dayCounts[key] || 0 });
  }

  // Group into weeks (columns)
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  for (const day of days) {
    if (day.date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week[0];
    const month = firstDay.date.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({
        label: firstDay.date.toLocaleDateString("en-US", { month: "short" }),
        col: i,
      });
      lastMonth = month;
    }
  });

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-4">
        Practice Activity
      </h3>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 ml-6">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-[10px] text-zinc-500"
              style={{
                position: "relative",
                left: `${m.col * 15}px`,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div key={i} className="w-4 h-3 text-[10px] text-zinc-600 leading-3">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week.find((d) => d.date.getDay() === di);
                if (!day) {
                  return <div key={di} className="w-3 h-3" />;
                }
                return (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${getIntensityClass(day.count)} transition-colors`}
                    title={`${day.key}: ${day.count} session${day.count !== 1 ? "s" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-zinc-600">Less</span>
        {[0, 1, 2, 3, 5].map((c) => (
          <div
            key={c}
            className={`w-3 h-3 rounded-sm ${getIntensityClass(c)}`}
          />
        ))}
        <span className="text-[10px] text-zinc-600">More</span>
      </div>
    </div>
  );
}
