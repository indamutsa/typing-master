import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { keyStats, sessions, settings } = await request.json();
    const userId = session.user.id;

    if (keyStats && typeof keyStats === "object") {
      for (const [key, val] of Object.entries(keyStats)) {
        const v = val as { attempts: number; errors: number };
        await sql`
          INSERT INTO key_stats (user_id, key, attempts, errors)
          VALUES (${userId}, ${key}, ${v.attempts}, ${v.errors})
          ON CONFLICT (user_id, key) DO UPDATE SET
            attempts = GREATEST(key_stats.attempts, EXCLUDED.attempts),
            errors = GREATEST(key_stats.errors, EXCLUDED.errors)
        `;
      }
    }

    if (Array.isArray(sessions)) {
      for (const s of sessions) {
        await sql`
          INSERT INTO session_records
            (id, user_id, mode, wpm, accuracy, duration, chars_typed, best_streak, completed_at)
          VALUES
            (${s.id}, ${userId}, ${s.mode}, ${s.wpm}, ${s.accuracy},
             ${s.duration}, ${s.charsTyped}, ${s.bestStreak}, ${s.completedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    if (settings && typeof settings === "object") {
      await sql`
        INSERT INTO user_settings (user_id, ai_provider, test_duration, top_n, word_count_target, sound_enabled)
        VALUES (${userId}, ${settings.aiProvider || "deepseek"}, ${settings.testDuration || 60},
                ${settings.topN || 5}, ${settings.wordCountTarget || 200}, ${settings.soundEnabled ? 1 : 0})
        ON CONFLICT (user_id) DO UPDATE SET
          ai_provider = EXCLUDED.ai_provider,
          test_duration = EXCLUDED.test_duration,
          top_n = EXCLUDED.top_n,
          word_count_target = EXCLUDED.word_count_target,
          sound_enabled = EXCLUDED.sound_enabled
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Migration error:", err);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
