import { NextResponse } from "next/server";
import { fetchAllRtveMovies, searchRtveMovies, rtveToMovieCard } from "@/lib/rtve";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const query = searchParams.get("q") || "";
  const programId = searchParams.get("program") || "";

  try {
    let result;

    if (query) {
      result = await searchRtveMovies(query, page);
    } else if (programId) {
      const { fetchRtveProgram } = await import("@/lib/rtve");
      result = await fetchRtveProgram(programId, page, 20);
    } else {
      result = await fetchAllRtveMovies(page, 20);
    }

    const movies = result.items.map(rtveToMovieCard);

    return NextResponse.json({
      results: movies,
      rtveItems: result.items,
      page,
      total_results: result.total,
      total_pages: result.totalPages,
    });
  } catch (err) {
    console.error("RTVE API error:", err);
    return NextResponse.json(
      { results: [], page: 1, total_results: 0, total_pages: 0 },
      { status: 500 }
    );
  }
}
