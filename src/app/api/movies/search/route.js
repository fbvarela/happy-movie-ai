import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/omdb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || 1;

  if (!query) {
    return NextResponse.json({ results: [], total_results: 0, page: 1, total_pages: 0 });
  }

  const data = await searchMovies(query, page, 14);
  return NextResponse.json(data);
}
