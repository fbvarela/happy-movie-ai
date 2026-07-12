# Happy Movie AI

## Overview

Happy Movie AI is a movie discovery and streaming app focused on **legally free movies** — public domain classics, Creative Commons films, and content from legal open-access sources (Internet Archive, YouTube, RTVE Play for Spanish cinema). It combines AI-powered mood-based recommendations (via `/recommend` chat) with a browsable/searchable catalogue (OMDb-backed), a personal watchlist, watch history with ratings, curated collections, and a stats dashboard. Part of the Happy Factory suite of sibling apps sharing brand/auth/Stripe conventions. Full EN/ES i18n via `next-intl`.

Full product spec: `docs/specs-happy-movie-ai/SPEC.md` (and `docs/specs/movies-spec.md`, `docs/specs/PLAN.md`).

## Quick Start / Commands

```bash
npm run dev         # next dev --webpack (localhost:3000)
npm run build        # next build --webpack
npm run start        # production server
npm run lint          # next lint
npm test              # vitest
npm run test:watch    # vitest --watch
npm run test:ui       # vitest --ui
```

Note: no test files currently exist in the repo (`vitest` is configured as a dependency/script but there's no `*.test.*` yet and no `vitest.config.*`).

## Architecture

- **Framework:** Next.js 16 App Router, React 19, JavaScript (`.jsx`, not TypeScript — despite `@types/*` devDeps and `jsconfig.json`, there is no `tsconfig.json`).
- **Path alias:** `@/*` → `./src/*` (defined in `jsconfig.json`).
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` block in `src/app/globals.css`), no `tailwind.config.js` — theming is done entirely via CSS custom properties/`@theme` tokens (bark/leaf/sun/clay palette, "DM Sans" + "Fraunces" fonts). Dark mode via `.dark` class variant (`@custom-variant dark`).
- **State/context:** React context providers in `src/context/` — `AuthContext`, `ThemeContext`, `LanguageContext`, `ToastContext` — wired up in `src/components/Providers.jsx` / `ClientLayout.jsx`.
- **Routing structure:** `src/app/` holds pages (`discover`, `movie/[id]`, `recommend`, `chat`, `watchlist`, `collections`, `stats`, `settings`, `login`, `rtve`, `watch/[tmdbId]`); `src/app/api/` holds route handlers for the same domains (movies, recommend, chat, collections, watchlist, history, stats, sources, rtve, auth).
- **PWA:** `@ducanh2912/next-pwa` wraps `next.config.js`, generates a service worker into `public/` (disabled in dev), with an `/offline` fallback page and workbox runtime caching rules (API routes are `NetworkOnly`).
- **i18n:** `next-intl`, messages in `src/messages/{en,es}.json`, config in `src/i18n/request.js`.
- **AI:** Vercel AI SDK (`ai` package) with multi-provider fallback logic in `src/lib/ai.js` (text: Cohere → Anthropic → Gemini, in that priority order in code — note this differs from the priority order documented in `.env.example`/SPEC which says Anthropic > Cohere > Gemini), plus `src/lib/ai-vision.js` and `src/lib/ai-image.js` for other AI tasks.
- **External data sources:** `src/lib/omdb.js` (movie metadata/search), `src/lib/internet-archive.js`, `src/lib/youtube.js`, `src/lib/vimeo.js`, `src/lib/rtve.js` (Spanish public broadcaster), aggregated via `src/lib/external-sources.js`.
- **Rate limiting:** `src/lib/rate-limit.js` — in-memory limiter (e.g. 10 req/min on `/api/recommend`).

## Database

- **Neon Postgres**, accessed via `@neondatabase/serverless`'s `neon()` tagged-template client (`src/lib/db.js` — `getDb()` throws if `DATABASE_URL` unset). Also lists `postgres` (postgres.js) as a dependency, but `db.js` uses the Neon serverless driver.
- Schema/migrations are plain SQL files applied manually: `src/db/migrate.sql` (Phase 4 — `watchlist`, `watch_history` tables, keyed by `user_id` from the auth-provided `user` table) and `src/db/migrate-phase6.sql`.
- The `user` table itself is auto-created by Neon Auth (Better Auth) — not defined in these migration files.

## Auth

- **Neon Auth** (`@neondatabase/auth`, Better Auth under the hood).
- Server instance: `src/lib/auth/server.js` — lazily constructed via a `Proxy` (so builds don't crash without env vars), configured with `trustedOrigins` built from `NEXT_PUBLIC_APP_URL` / `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_BRANCH_URL`.
- Client instance: `src/lib/auth/client.js` — `createAuthClient()` from `@neondatabase/auth/next` (client component).
- Session helper: `src/lib/auth/session.js` — `getAuthUser(request)` wraps `auth.api.getSession()`, returns `null` on failure instead of throwing.
- Catch-all route: `src/app/api/auth/[...path]/route.js` delegates `GET`/`POST` to `auth.handler()`.
- Login UI at `src/app/login/page.jsx` and a dynamic `src/app/auth/[path]/page.jsx`.
- **Gap vs. cross-app convention:** this app does **not** currently have the `POST /api/auth/test-login` route that's standard across other Happy Factory apps — none of `src/app/api/auth/*` implements it.

## Environment Variables

From `.env.example` (see file for grouping/comments):

- **Database:** `DATABASE_URL`
- **Auth:** `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`
- **AI text (need at least one):** `ANTHROPIC_API_KEY`, `COHERE_API_KEY`, `GEMINI_API_KEY`
- **AI vision:** uses the above plus `OPENAI_API_KEY`
- **AI image gen:** `FAL_API_KEY` (plus `OPENAI_API_KEY`/Gemini)
- **Payments:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (declared in `.env.example`/deps; no Stripe route/usage found under `src/` yet — likely not wired up)
- **Email:** `RESEND_API_KEY` (declared but not referenced in `src/`)
- **Image storage:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` (declared, `@aws-sdk/client-s3` is a dep, but not referenced in `src/` yet)
- **Movie data:** `OMDB_API_KEY`
- **Video sources:** `YOUTUBE_API_KEY`, `VIMEO_ACCESS_TOKEN`
- **App:** `NEXT_PUBLIC_APP_URL`

## Code Conventions

- Plain JavaScript + JSX, no TypeScript.
- Import via `@/` alias (e.g. `@/lib/auth/server`), not relative paths across top-level dirs.
- API routes are Next.js App Router route handlers (`route.js`) under `src/app/api/**`, following REST-ish resource nesting (e.g. `/api/collections/[id]/movies`).
- Styling uses Tailwind utility classes plus the custom `@theme` design tokens in `globals.css` — reuse existing color tokens (`bark`, `leaf`, `sun`, `clay`, `bg`, `surface`, `cream`, `line`, `text`, `muted`) rather than raw hex values.
- Components in `src/components/` are flat except for `chat/` and `ui/` subfolders (`ui/` holds generic primitives like `Modal.jsx`, `ConfirmModal.jsx`).
- Security headers are set centrally in `next.config.js`, not per-route.
