import { createNeonAuth } from "@neondatabase/auth/next/server";

let _auth;

function getAuth() {
  if (!_auth) {
    _auth = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET,
      },
    });
  }
  return _auth;
}

// Proxy that lazily initialises auth so the build doesn't crash when env vars are missing.
export const auth = new Proxy(
  {},
  {
    get(_target, prop) {
      return getAuth()[prop];
    },
  }
);
