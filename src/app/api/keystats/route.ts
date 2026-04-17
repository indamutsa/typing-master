import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({});
  }

  const rows = await sql`
    SELECT key, attempts, errors FROM key_stats WHERE user_id = ${session.user.id}
  `;

  const stats: Record<string, { attempts: number; errors: number }> = {};
  for (const row of rows) {
    stats[row.key] = { attempts: row.attempts, errors: row.errors };
  }

  return NextResponse.json(stats);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats: Record<string, { attempts: number; errors: number }> =
      await request.json();
    const userId = session.user.id;

    for (const [key, val] of Object.entries(stats)) {
      await sql`
        INSERT INTO key_stats (user_id, key, attempts, errors)
        VALUES (${userId}, ${key}, ${val.attempts}, ${val.errors})
        ON CONFLICT (user_id, key) DO UPDATE SET
          attempts = EXCLUDED.attempts,
          errors = EXCLUDED.errors
      `;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save stats" }, { status: 500 });
  }
}
