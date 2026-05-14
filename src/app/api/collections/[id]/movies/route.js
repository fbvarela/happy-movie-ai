import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/session";

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  // Verify ownership
  const colls = await sql`
    SELECT * FROM collections WHERE id = ${id} AND user_id = ${user.id}
  `;
  if (!colls[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { tmdbId, title, posterPath } = await request.json();
  if (!tmdbId) return NextResponse.json({ error: "tmdbId required" }, { status: 400 });

  // Get next position
  const posResult = await sql`
    SELECT COALESCE(MAX(position), -1) + 1 as next_pos
    FROM collection_movies WHERE collection_id = ${id}
  `;

  const rows = await sql`
    INSERT INTO collection_movies (collection_id, tmdb_id, title, poster_path, position)
    VALUES (${id}, ${tmdbId}, ${title || null}, ${posterPath || null}, ${posResult[0].next_pos})
    ON CONFLICT (collection_id, tmdb_id) DO NOTHING
    RETURNING *
  `;

  // Update collection timestamp
  await sql`UPDATE collections SET updated_at = now() WHERE id = ${id}`;

  return NextResponse.json({ movie: rows[0] || null });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  // Verify ownership
  const colls = await sql`
    SELECT * FROM collections WHERE id = ${id} AND user_id = ${user.id}
  `;
  if (!colls[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { tmdbId } = await request.json();
  if (!tmdbId) return NextResponse.json({ error: "tmdbId required" }, { status: 400 });

  await sql`
    DELETE FROM collection_movies
    WHERE collection_id = ${id} AND tmdb_id = ${tmdbId}
  `;

  return NextResponse.json({ ok: true });
}
