import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/session";

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  // Run all queries in parallel
  const [countResult, hoursResult, genreResult, avgResult, monthlyResult, recentResult] =
    await Promise.all([
      // Total movies watched
      sql`SELECT COUNT(*) as count FROM watch_history WHERE user_id = ${user.id}`,

      // Total runtime (fetch all tmdb_ids, we'll compute later from titles)
      sql`SELECT COUNT(*) as count FROM watch_history WHERE user_id = ${user.id}`,

      // We don't have genre data in watch_history, so we'll skip genre breakdown
      // unless we enrich the table later. For now, return empty.
      Promise.resolve([]),

      // Average rating
      sql`SELECT ROUND(AVG(rating)::numeric, 1) as avg_rating
          FROM watch_history
          WHERE user_id = ${user.id} AND rating IS NOT NULL`,

      // Monthly activity (last 12 months)
      sql`SELECT
            TO_CHAR(watched_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM watch_history
          WHERE user_id = ${user.id}
            AND watched_at >= NOW() - INTERVAL '12 months'
          GROUP BY month
          ORDER BY month ASC`,

      // Recently watched (last 10)
      sql`SELECT tmdb_id, title, poster_path, rating, watched_at
          FROM watch_history
          WHERE user_id = ${user.id}
          ORDER BY watched_at DESC
          LIMIT 10`,
    ]);

  const totalWatched = parseInt(countResult[0]?.count) || 0;
  // Estimate ~2 hours per movie since we don't store runtime in history
  const estimatedHours = totalWatched * 2;
  const avgRating = parseFloat(avgResult[0]?.avg_rating) || 0;

  // Build monthly data with zero-filled gaps
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = monthlyResult.find((r) => r.month === key);
    months.push({
      month: key,
      label: d.toLocaleDateString("en", { month: "short" }),
      count: parseInt(found?.count) || 0,
    });
  }

  // Rating distribution
  const ratingDist = [1, 2, 3, 4, 5].map((star) => ({
    stars: star,
    count: 0,
  }));

  if (totalWatched > 0) {
    const distResult = await sql`
      SELECT rating, COUNT(*) as count
      FROM watch_history
      WHERE user_id = ${user.id} AND rating IS NOT NULL
      GROUP BY rating
      ORDER BY rating
    `;
    for (const row of distResult) {
      const idx = ratingDist.findIndex((d) => d.stars === row.rating);
      if (idx >= 0) ratingDist[idx].count = parseInt(row.count);
    }
  }

  return NextResponse.json({
    totalWatched,
    estimatedHours,
    avgRating,
    months,
    ratingDistribution: ratingDist,
    recent: recentResult,
  });
}
