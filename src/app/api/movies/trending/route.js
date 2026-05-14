import { NextResponse } from "next/server";
import { getTrending } from "@/lib/omdb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;

  const data = await getTrending("week", page);
  return NextResponse.json(data);
}
