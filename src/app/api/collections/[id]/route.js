import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/session";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  const sql = getDb();

  const colls = await sql`
    SELECT * FROM collections WHERE id = ${id}
  `;

  const collection = colls[0];
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only owner can see non-curated collections
  if (!collection.is_curated && collection.user_id !== user?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const movies = await sql`
    SELECT * FROM collection_movies
    WHERE collection_id = ${id}
    ORDER BY position ASC, added_at ASC
  `;

  return NextResponse.json({
    collection,
    movies,
    isOwner: collection.user_id === user?.id,
  });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  // Verify ownership
  const colls = await sql`
    SELECT * FROM collections WHERE id = ${id} AND user_id = ${user.id}
  `;
  if (!colls[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, description } = await request.json();

  const rows = await sql`
    UPDATE collections
    SET name = COALESCE(${name?.trim() || null}, name),
        description = COALESCE(${description?.trim() || null}, description),
        updated_at = now()
    WHERE id = ${id} AND user_id = ${user.id}
    RETURNING *
  `;

  return NextResponse.json({ collection: rows[0] });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  // Don't allow deleting curated collections
  const colls = await sql`
    SELECT * FROM collections WHERE id = ${id} AND user_id = ${user.id} AND is_curated = false
  `;
  if (!colls[0]) return NextResponse.json({ error: "Not found or not deletable" }, { status: 404 });

  await sql`DELETE FROM collections WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
