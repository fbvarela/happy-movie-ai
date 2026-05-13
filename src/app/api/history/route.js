import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/session";

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const sql = getDb();
  const rows = await sql`
    SELECT * FROM watch_history
    WHERE user_id = ${user.id}
    ORDER BY watched_at DESC
  `;

  return NextResponse.json({ items: rows });
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tmdbId, title, posterPath, rating } = await request.json();
  if (!tmdbId) return NextResponse.json({ error: "tmdbId required" }, { status: 400 });

  const sql = getDb();
  const rows = await sql`
    INSERT INTO watch_history (user_id, tmdb_id, title, poster_path, rating)
    VALUES (${user.id}, ${tmdbId}, ${title || null}, ${posterPath || null}, ${rating || null})
    ON CONFLICT (user_id, tmdb_id)
    DO UPDATE SET rating = COALESCE(${rating || null}, watch_history.rating), watched_at = now()
    RETURNING *
  `;

  return NextResponse.json({ item: rows[0] });
}
