import { auth } from "@/lib/auth/server";

export async function GET(request, context) {
  const { GET: handler } = auth.handler();
  return handler(request, context);
}

export async function POST(request, context) {
  const { POST: handler } = auth.handler();
  return handler(request, context);
}
