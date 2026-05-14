import { createNeonAuth } from "@neondatabase/auth/next/server";

let _auth;

function getAuth() {
  if (!_auth) {
    const trustedOrigins = [
      "http://localhost:3000",
      "http://localhost:3002",
    ];

    // Add production / preview origins
    if (process.env.NEXT_PUBLIC_APP_URL) {
      trustedOrigins.push(process.env.NEXT_PUBLIC_APP_URL);
    }
    if (process.env.VERCEL_URL) {
      trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      trustedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    }
    if (process.env.VERCEL_BRANCH_URL) {
      trustedOrigins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
    }

    _auth = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      trustedOrigins,
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
