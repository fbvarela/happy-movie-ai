import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/session";

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const sql = getDb();
  const rows = await sql`
    SELECT * FROM watchlist
    WHERE user_id = ${user.id}
    ORDER BY added_at DESC
  `;

  return NextResponse.json({ items: rows });
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tmdbId, title, posterPath } = await request.json();
  if (!tmdbId) return NextResponse.json({ error: "tmdbId required" }, { status: 400 });

  const sql = getDb();
  const rows = await sql`
    INSERT INTO watchlist (user_id, tmdb_id, title, poster_path)
    VALUES (${user.id}, ${tmdbId}, ${title || null}, ${posterPath || null})
    ON CONFLICT (user_id, tmdb_id) DO NOTHING
    RETURNING *
  `;

  return NextResponse.json({ item: rows[0] || null });
}

export async function DELETE(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tmdbId } = await request.json();
  if (!tmdbId) return NextResponse.json({ error: "tmdbId required" }, { status: 400 });

  const sql = getDb();
  await sql`
    DELETE FROM watchlist
    WHERE user_id = ${user.id} AND tmdb_id = ${tmdbId}
  `;

  return NextResponse.json({ ok: true });
}
