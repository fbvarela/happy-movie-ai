import { NextResponse } from "next/server";
import { getMovie } from "@/lib/omdb";
import { searchIA } from "@/lib/internet-archive";
import { searchYouTube } from "@/lib/youtube";
import { rankSources } from "@/lib/quality-check";

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60;

export async function GET(request, { params }) {
  const { tmdbId } = await params;

  const cached = cache.get(tmdbId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const movie = await getMovie(tmdbId);
  if (!movie || movie.success === false) {
    return NextResponse.json({ sources: [], error: "Movie not found" }, { status: 404 });
  }

  const title = movie.title;
  const year = movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null;
  const runtime = movie.runtime || null;

  const [iaResults, ytResults] = await Promise.all([
    searchIA(title, year).catch(() => []),
    searchYouTube(title, year).catch(() => []),
  ]);

  const allSources = [...iaResults, ...ytResults];
  const ranked = rankSources(allSources, runtime);

  const isPreSound = year && year < 1929;

  const data = {
    tmdbId,
    title,
    year,
    runtime,
    isPreSound,
    sources: ranked,
    bestQuality: ranked[0]?.qualityInfo?.quality || null,
  };

  cache.set(tmdbId, { data, timestamp: Date.now() });

  return NextResponse.json(data);
}
