import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    SELECT id, mode, wpm, accuracy, duration, chars_typed, best_streak, completed_at
    FROM session_records
    WHERE user_id = ${session.user.id}
    ORDER BY completed_at DESC
  `;

  const sessions = rows.map((r) => ({
    id: r.id,
    mode: r.mode,
    wpm: r.wpm,
    accuracy: r.accuracy,
    duration: r.duration,
    charsTyped: r.chars_typed,
    bestStreak: r.best_streak,
    completedAt: r.completed_at,
  }));

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const record = await request.json();
    const userId = session.user.id;

    await sql`
      INSERT INTO session_records
        (id, user_id, mode, wpm, accuracy, duration, chars_typed, best_streak, completed_at)
      VALUES
        (${record.id}, ${userId}, ${record.mode}, ${record.wpm}, ${record.accuracy},
         ${record.duration}, ${record.charsTyped}, ${record.bestStreak}, ${record.completedAt})
      ON CONFLICT (id) DO NOTHING
    `;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
