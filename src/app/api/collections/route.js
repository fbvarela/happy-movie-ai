import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/session";

export async function GET(request) {
  const user = await getAuthUser(request);
  const sql = getDb();

  // Get curated collections + user collections (if logged in)
  const rows = await sql`
    SELECT c.*,
      (SELECT COUNT(*) FROM collection_movies cm WHERE cm.collection_id = c.id) as movie_count,
      (SELECT ARRAY_AGG(cm.poster_path ORDER BY cm.position)
       FROM (SELECT poster_path, position FROM collection_movies WHERE collection_id = c.id ORDER BY position LIMIT 4) cm
      ) as cover_posters
    FROM collections c
    WHERE c.is_curated = true
       OR c.user_id = ${user?.id || ''}
    ORDER BY c.is_curated DESC, c.updated_at DESC
  `;

  return NextResponse.json({ collections: rows });
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const sql = getDb();
  const rows = await sql`
    INSERT INTO collections (user_id, name, description)
    VALUES (${user.id}, ${name.trim()}, ${description?.trim() || null})
    RETURNING *
  `;

  return NextResponse.json({ collection: rows[0] });
}
