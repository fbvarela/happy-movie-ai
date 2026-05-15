import { NextResponse } from "next/server";
import { getMovie } from "@/lib/omdb";
import { searchIA } from "@/lib/internet-archive";
import { searchYouTube } from "@/lib/youtube";
import { searchVimeo } from "@/lib/vimeo";
import { findRtveByImdb } from "@/lib/rtve";
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

  const [iaResults, ytResults, vimeoResults, rtveResult] = await Promise.all([
    searchIA(title, year).catch(() => []),
    searchYouTube(title, year).catch(() => []),
    searchVimeo(title, year).catch(() => []),
    findRtveByImdb(tmdbId).catch(() => null),
  ]);

  // Build RTVE source entry if found
  const rtveSources = [];
  if (rtveResult) {
    const bestQuality = rtveResult.qualities?.[0];
    rtveSources.push({
      source: "rtve",
      title: rtveResult.title,
      watchUrl: rtveResult.watchUrl,
      detailUrl: rtveResult.watchUrl,
      geoRestricted: rtveResult.geoRestricted,
      duration: rtveResult.durationMs ? rtveResult.durationMs / 1000 : null,
      resolution: bestQuality
        ? { width: bestQuality.width, height: bestQuality.height }
        : null,
      qualityInfo: {
        quality: bestQuality?.height >= 720 ? "hd" : "sd",
        notes: rtveResult.geoRestricted ? "Spain only" : null,
      },
    });
  }

  const allSources = [...rtveSources, ...iaResults, ...vimeoResults, ...ytResults];
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
