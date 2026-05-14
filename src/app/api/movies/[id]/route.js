import { NextResponse } from "next/server";
import { getMovie } from "@/lib/omdb";

export async function GET(request, { params }) {
  const { id } = await params;

  const data = await getMovie(id);
  return NextResponse.json(data);
}
