import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    SELECT ai_provider, test_duration, top_n, word_count_target, sound_enabled
    FROM user_settings WHERE user_id = ${session.user.id}
  `;
  const row = rows[0];

  if (!row) {
    return NextResponse.json({});
  }

  return NextResponse.json({
    aiProvider: row.ai_provider,
    testDuration: row.test_duration,
    topN: row.top_n,
    wordCountTarget: row.word_count_target,
    soundEnabled: !!row.sound_enabled,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await request.json();
    const userId = session.user.id;

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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
