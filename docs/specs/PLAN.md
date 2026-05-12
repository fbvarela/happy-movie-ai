
# HappyMovie — Implementation Plan

> Phases are ordered by dependency and value delivery.
> Effort: S < 2h · M 2–4h · L 4–8h · XL > 8h

---

## Phase 0 — Project Scaffolding (M) ✅ DONE

### Goal
Standing Next.js app with Happy Factory brand, no features yet — just the shell.

### Tasks

| # | Task | Effort |
|---|------|--------|
| ~~0.1~~ | ~~Next.js 16 + React 19 + Tailwind v4 setup~~ | ~~S~~ |
| ~~0.2~~ | ~~Copy globals.css from shelter-ai (full token set, component classes, dark mode)~~ | ~~S~~ |
| ~~0.3~~ | ~~Google Fonts (DM Sans + Fraunces + Caveat) in root layout~~ | ~~S~~ |
| ~~0.4~~ | ~~Sidebar nav + bottom nav + hamburger drawer (ClientLayout, SidebarNav, BottomNav)~~ | ~~M~~ |
| ~~0.5~~ | ~~PWA manifest, next-pwa config, security headers~~ | ~~S~~ |
| ~~0.6~~ | ~~ThemeContext (dark/light/system), ToastContext, LanguageContext (EN/ES)~~ | ~~S~~ |
| ~~0.7~~ | ~~AI provider helpers (ai.js, ai-vision.js, ai-image.js)~~ | ~~S~~ |
| ~~0.8~~ | ~~Modal + ConfirmModal UI components~~ | ~~S~~ |
| ~~0.9~~ | ~~i18n translation files (en.json, es.json) with nav + common keys~~ | ~~S~~ |
| ~~0.10~~ | ~~.env.example with all provider keys~~ | ~~S~~ |

### Deliverable
Branded shell app with sidebar, bottom nav, dark mode, i18n, and PWA support.

---

## Phase 1 — Movie Catalogue & Search (XL)

### Goal
Users can search for movies by title and browse results in a poster grid, powered by TMDB.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 1.1 | Create `src/lib/tmdb.js` — TMDB API client (search, discover, movie details, genres list, images) | M |
| 1.2 | Add `TMDB_API_KEY` to `.env.example` and server-side config | S |
| 1.3 | Create API route `src/app/api/movies/search/route.js` — proxies TMDB search (prevents key leak to client) | M |
| 1.4 | Create API route `src/app/api/movies/[id]/route.js` — returns full movie details + credits | M |
| 1.5 | Create API route `src/app/api/movies/discover/route.js` — filterable discover endpoint (genre, year range, rating, language) | M |
| 1.6 | Build `src/components/MovieCard.jsx` — poster, title, year, rating badge, genre tags | M |
| 1.7 | Build `src/components/MovieGrid.jsx` — responsive poster grid with loading skeletons | M |
| 1.8 | Build `src/components/SearchBar.jsx` — debounced full-text search input | S |
| 1.9 | Build `src/components/FilterPanel.jsx` — genre chips, era/type selector (Classic, Golden Age, Silent, B&W, Modern Classic, Contemporary), rating range, language dropdown, quality filter (HD only / SD+ / All) added in Phase 2 | L |
| 1.10 | Create `src/constants/filters.js` — GENRES, ERAS (with year ranges), LANGUAGES maps | S |
| 1.11 | Build `/discover` page — SearchBar + FilterPanel + MovieGrid with pagination | L |
| 1.12 | Build `/movie/[id]` page — full detail: backdrop, poster, synopsis, cast, director, genres, rating, runtime | L |
| 1.13 | Build `src/components/CastList.jsx` — horizontal scrollable cast with photo + name + role | M |
| 1.14 | Build `src/components/RelatedMovies.jsx` — "More like this" row from TMDB recommendations | M |
| 1.15 | Update home page (`src/app/page.jsx`) — trending grid + search bar + quick genre links | M |
| 1.16 | Add all new UI strings to `en.json` and `es.json` | S |
| 1.17 | Add TMDB attribution footer as required by their terms | S |

### Deliverable
Users can search movies, filter by genre/era/rating/language, and view detailed movie pages with cast and recommendations.

---

## Phase 2 — Legal Sources: Internet Archive & YouTube (XL)

### Goal
Each movie shows where it can be watched for free, with in-app playback for public domain and YouTube sources.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 2.1 | Create `src/lib/internet-archive.js` — search IA by title + year, check for video files, return embed URL | M |
| 2.2 | Create `src/lib/youtube.js` — YouTube Data API search for official free movies (filter: long duration, Film category, official channels) | M |
| 2.3 | Add `YOUTUBE_API_KEY` to `.env.example` | S |
| 2.4 | Create API route `src/app/api/sources/[tmdbId]/route.js` — aggregates availability from IA + YouTube for a given movie | L |
| 2.5 | Build video quality check in `src/lib/quality-check.js` — score each source result by resolution (IA: check `height` in file metadata; YouTube: check `definition` field from API), audio presence, and duration match vs TMDB runtime; flag as `hd` / `sd` / `low` / `unwatchable`; reject results under 240p or with >30% runtime mismatch (likely trailers or clips) | L |
| 2.6 | Build `src/components/QualityBadge.jsx` — visual indicator on each source: HD (leaf badge), SD (sun badge), Low Quality (clay badge with warning); tooltip shows resolution + notes | S |
| 2.7 | Build `src/components/SourceBadge.jsx` — small icon + label badge per source (IA, YouTube, Tubi, etc.) | S |
| 2.8 | Build `src/components/SourceButtons.jsx` — action buttons on movie detail ("Watch on Internet Archive", "Watch on YouTube"); show QualityBadge next to each | M |
| 2.9 | Build `src/components/VideoPlayer.jsx` — embedded player that handles both IA `<video>` and YouTube `<iframe>` | M |
| 2.10 | Build `/watch/[tmdbId]` page — full-screen-ish player with movie info sidebar; auto-select best quality source | L |
| 2.11 | Add source availability + quality indicators to `MovieCard.jsx` (small icons showing where it's available and best quality level) | S |
| 2.12 | Build era detection logic — auto-flag movies pre-1929 as likely public domain, surface IA results first | S |
| 2.13 | Cache source lookups + quality scores in memory or DB to avoid repeated API calls | M |
| 2.14 | Add i18n strings for source names, watch actions, and quality labels (HD, SD, Low Quality) | S |

### Deliverable
Movies show legal source availability. Users can watch public domain films (Internet Archive) and official YouTube uploads directly in the app.

---

## Phase 3 — External Platform Links (M)

### Goal
Movies link out to free ad-supported platforms (Tubi, Plex, Pluto TV) as fallback sources.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 3.1 | Create `src/lib/external-sources.js` — generates deep-link URLs for Tubi, Plex, Pluto TV search by title | S |
| 3.2 | Add Tubi/Plex/Pluto buttons to `SourceButtons.jsx` — open in new tab with `rel="noopener"` | S |
| 3.3 | Build `src/components/SourceList.jsx` — unified list of all sources for a movie (embeddable + external), sorted by preference | M |
| 3.4 | Add "availability" filter to FilterPanel — Embeddable vs External Link | S |
| 3.5 | Add i18n strings for external source names and "Opens in new tab" labels | S |

### Deliverable
Every movie has maximum source coverage. Users can jump to Tubi/Plex/Pluto for movies not available on IA or YouTube.

---

## Phase 4 — Auth, Watchlist & Watch History (L)

### Goal
Users can sign in, save movies to a watchlist, and track what they've watched.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 4.1 | Set up Supabase auth (magic link via Resend) | M |
| 4.2 | Create `src/lib/supabase.js` — server + client Supabase helpers | S |
| 4.3 | Create `AuthContext.jsx` with login/logout, current user state | M |
| 4.4 | Build `/login` page — email input, magic link flow | M |
| 4.5 | Set up Neon DB + schema: `users`, `watchlist` (user_id, tmdb_id, added_at), `watch_history` (user_id, tmdb_id, watched_at, rating) | M |
| 4.6 | Create API routes: `/api/watchlist` (GET/POST/DELETE), `/api/history` (GET/POST) | M |
| 4.7 | Build `src/components/WatchlistButton.jsx` — toggle add/remove, heart icon, optimistic UI | M |
| 4.8 | Add WatchlistButton to MovieCard and movie detail page | S |
| 4.9 | Build `/watchlist` page — grid of saved movies with remove action | M |
| 4.10 | Build "Mark as watched" + star rating flow on movie detail (after watching) | M |
| 4.11 | Update nav items for authenticated vs unauthenticated state | S |
| 4.12 | Add i18n strings for auth, watchlist, and history | S |

### Deliverable
Users can sign in, build a watchlist, mark movies as watched with a rating, and see their history.

---

## Phase 5 — AI Recommendations (L)

### Goal
Users describe what they're in the mood for and get AI-powered movie suggestions from the legal catalogue.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 5.1 | Create API route `src/app/api/recommend/route.js` — accepts user prompt, calls AI with structured movie prompt | L |
| 5.2 | Design AI system prompt: recommend only movies likely available for free (public domain, classic, well-known free titles); return structured JSON with TMDB IDs | M |
| 5.3 | Build `/recommend` page — chat-style UI: text input, AI response as movie cards | L |
| 5.4 | Build `src/components/MoodSelector.jsx` — quick-pick mood/genre buttons ("Feel-good", "Mind-bending", "Classic Noir", etc.) that pre-fill the prompt | M |
| 5.5 | Cross-reference AI suggestions with TMDB to get full metadata + posters | M |
| 5.6 | Cross-reference with source availability (Phase 2/3) to show "watchable now" vs "might be available" | S |
| 5.7 | Conversation history: allow follow-ups ("something darker", "from the 1950s") | M |
| 5.8 | Add i18n strings for recommendation UI | S |

### Deliverable
Users can ask the AI for movie recommendations by mood, era, or genre and get results they can actually watch for free.

---

## Phase 6 — Collections (L)

### Goal
Users can organize movies into themed collections, and browse curated starter collections.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 6.1 | DB schema: `collections` (id, user_id, name, description, is_curated), `collection_movies` (collection_id, tmdb_id, position) | S |
| 6.2 | Create API routes: `/api/collections` (CRUD), `/api/collections/[id]/movies` (add/remove/reorder) | M |
| 6.3 | Build `/collections` page — grid of collection cards with cover (first 4 posters mosaic) | M |
| 6.4 | Build `/collections/[id]` page — collection detail with movie grid, edit name/description, reorder | L |
| 6.5 | Build "Add to collection" action on movie detail + MovieCard context menu | M |
| 6.6 | Seed curated collections: "Film Noir Essentials", "Silent Horror Classics", "Golden Age Comedies", "Public Domain Gems", "Best Free Documentaries" | M |
| 6.7 | Add i18n strings for collections | S |

### Deliverable
Users can create and manage themed movie collections. New users see curated collections for discovery.

---

## Phase 7 — Viewing Stats (M)

### Goal
Users see insights about their movie watching habits.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 7.1 | Create API route `/api/stats` — aggregates from watch_history: count, hours, genre breakdown, monthly timeline | M |
| 7.2 | Build `/stats` page — stat blocks (movies watched, hours, top genre, avg rating) + genre pie/bar chart + monthly timeline | L |
| 7.3 | Build `src/components/GenreChart.jsx` — simple CSS-based bar chart (no charting library needed for MVP) | M |
| 7.4 | Build `src/components/TimelineChart.jsx` — monthly viewing activity | M |
| 7.5 | Add i18n strings for stats | S |

### Deliverable
Users can see a dashboard of their viewing habits — what they watch, how much, and trends over time.

---

## Phase 8 — Polish & Optimization (L)

### Goal
Production-ready quality: performance, curated content, legal compliance, and edge cases.

### Tasks

| # | Task | Effort |
|---|------|--------|
| 8.1 | Build "Verified Free" curated list — manually confirmed movies available on IA/YouTube with direct links | L |
| 8.2 | Add region detection (via IP or browser locale) to surface region-relevant free sources | M |
| 8.3 | Image optimization: TMDB poster proxy with Next.js Image for lazy loading + responsive sizes | M |
| 8.4 | Add legal disclaimer footer to layout | S |
| 8.5 | SEO: generate `<meta>` tags per movie page (title, description, poster as og:image) | M |
| 8.6 | Offline page (`/offline`) for PWA fallback | S |
| 8.7 | Rate limiting on API routes (TMDB/YouTube quota protection) | M |
| 8.8 | Error boundaries + loading states for all pages | M |
| 8.9 | Accessibility audit: keyboard nav, aria labels, contrast ratios | M |
| 8.10 | Final i18n review — ensure all strings are translated | S |

### Deliverable
Production-ready app with curated content, good performance, legal compliance, and polished UX.

---

## Execution Order (Single Developer)

```
Phase 0  (scaffolding)         ✅ DONE
Phase 1  (catalogue + search)  ← START HERE — core value prop
Phase 2  (IA + YouTube)        ← makes movies watchable
Phase 3  (external links)      ← quick win, max source coverage
Phase 4  (auth + watchlist)    ← user accounts, persistence
Phase 5  (AI recommendations)  ← differentiator
Phase 6  (collections)         ← engagement + curation
--- MVP LAUNCH ---
Phase 7  (viewing stats)       ← retention feature
Phase 8  (polish)              ← production readiness
```

---

## Effort Summary

| Phase | Focus | Effort | Cumulative |
|-------|-------|--------|------------|
| ~~0 — Scaffolding~~ | ~~Brand shell + PWA~~ | ~~M (3h)~~ | ~~3h~~ |
| 1 — Catalogue | TMDB search + filters + detail pages | XL (16h) | 19h |
| 2 — Sources + Quality | Internet Archive + YouTube embed + quality scoring | XL (14h) | 33h |
| 3 — External Links | Tubi/Plex/Pluto deep links | M (3h) | 36h |
| 4 — Auth + Watchlist | Magic link, save/watch tracking | L (8h) | 44h |
| 5 — AI Recommendations | Mood-based AI suggestions | L (8h) | 52h |
| 6 — Collections | User + curated movie lists | L (7h) | 59h |
| **MVP Total** | | | **~59h** |
| 7 — Viewing Stats | Watch habit dashboard | M (4h) | 63h |
| 8 — Polish | Curation, SEO, perf, a11y | L (8h) | 71h |
| **Full Total** | | | **~71h** |

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Movie data | TMDB API (no local DB for movies) | Avoids data staleness; TMDB is comprehensive and free |
| Source detection | On-demand API calls to IA + YouTube, cached | Avoids maintaining a stale availability database |
| Video playback | IA `<video>` embed + YouTube `<iframe>` | Both are legally embeddable; no self-hosting |
| External platforms | Deep links only (no embed, no scraping) | Respects ToS; simple and legal |
| AI provider | Vercel AI SDK multi-provider (Anthropic > Cohere > Gemini) | Already configured in scaffold |
| Auth | Supabase magic link | Platform standard for Happy Factory apps |
| Database | Neon Postgres | Only needed for user data (watchlist, history, collections) — not movie metadata |
| Charts | CSS-based (no library) | Stats page is simple enough; avoids bundle bloat |

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| TMDB API rate limits (40 req/s) | Server-side proxy with in-memory cache; debounce search input |
| YouTube API quota (10,000 units/day) | Cache results aggressively; only search when user clicks "Find on YouTube" |
| Internet Archive search quality | Match by title + year; fallback to manual curated list for known public domain films |
| Source availability changes | Sources are checked on-demand; stale links are a minor UX issue, not a data integrity problem |
| Low quality video results | Quality check scores resolution + runtime match; results under 240p or with >30% runtime mismatch are auto-hidden; QualityBadge warns users about SD sources; curated "Verified Free" list in Phase 8 guarantees quality for top titles |
| AI recommending unavailable movies | System prompt constrains to classic/public domain films; cross-reference with source check |
| Legal exposure | Footer disclaimer; never host video; only embed from explicitly legal sources; respect TMDB attribution requirements |
