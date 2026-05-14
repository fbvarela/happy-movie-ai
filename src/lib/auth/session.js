import { auth } from "@/lib/auth/server";

/**
 * Get the authenticated user from the request.
 * Returns the user object or null if not authenticated.
 */
export async function getAuthUser(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session?.user ?? null;
  } catch {
    return null;
  }
}
