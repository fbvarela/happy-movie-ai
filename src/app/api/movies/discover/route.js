import { NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const data = await discoverMovies({
    page: searchParams.get("page") || 1,
    genreIds: searchParams.get("genres") || undefined,
    yearGte: searchParams.get("yearGte") || undefined,
    yearLte: searchParams.get("yearLte") || undefined,
    voteGte: searchParams.get("voteGte") || undefined,
    language: searchParams.get("language") || undefined,
    sortBy: searchParams.get("sortBy") || "popularity.desc",
  });

  return NextResponse.json(data);
}
