import { auth } from "@/lib/auth/server";

export async function GET(request) {
  const handler = auth.handler();
  return handler.GET(request);
}

export async function POST(request) {
  const handler = auth.handler();
  return handler.POST(request);
}
