# HappyMovie — Product Specification

## Overview

HappyMovie is a movie listing and discovery app that lets users browse, search, and filter films available from **legal, free sources only**. The app aggregates metadata and playback links from public domain archives, official YouTube channels, and free ad-supported platforms — never from pirated or unauthorized sources.

---

## Core Concept

A searchable, filterable catalogue of movies the user can actually watch for free, right now, legally. Not a streaming service — a discovery layer that points to legal sources.

---

## Data Sources

### Metadata & Discovery

| Source | What it provides | API key required |
|--------|-----------------|-----------------|
| **TMDB** | Posters, titles, year, genres, cast, descriptions, ratings | Yes (free, non-commercial) |

### Legal Playback Sources

| Source | Content type | How it works |
|--------|-------------|-------------|
| **Internet Archive** | Public domain films (pre-1929 silent era, noir, horror, classics) | Direct embed/stream via metadata API, no key needed |
| **YouTube** (official channels) | Ad-supported free movies from studio channels (Popcornflix, Retro Movies, Cult Cinema Classics, YouTube Movies & TV) | YouTube Data API search + embed player |
| **Tubi** | Free ad-supported modern & classic movies | Deep link to Tubi search/title page (no embed, opens in new tab) |
| **Plex** | Free ad-supported catalogue | Deep link (no embed) |
| **Pluto TV** | Free ad-supported live channels & on-demand | Deep link (no embed) |

---

## Features

### 1. Movie Catalogue & Search

- Full-text search by title, director, or actor
- Results display as a poster grid with title, year, rating, and genre tags
- Each result shows which legal sources have the film available
- Pagination or infinite scroll

### 2. Filters & Categories

Users can narrow results using the following filters (combinable):

**By genre:**
- Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, Horror, Musical, Mystery, Romance, Sci-Fi, Thriller, War, Western

**By type / era:**
- Classic (pre-1970)
- Golden Age (1930–1960)
- Silent era (pre-1930)
- Black & White
- Modern classic (1970–2000)
- Contemporary (2000+)

**By source:**
- Internet Archive (public domain)
- YouTube (official free)
- Tubi
- Plex
- Pluto TV

**By availability:**
- Embeddable (can watch in-app via Internet Archive or YouTube)
- External link (opens Tubi/Plex/Pluto in new tab)

**By rating:**
- TMDB rating range (e.g. 7+ stars)

**By language:**
- Original language filter (English, Spanish, French, etc.)

### 3. Movie Detail Page

- Full poster + backdrop image
- Title, year, runtime, genres, rating
- Synopsis
- Cast & director
- List of legal sources with action buttons:
  - **Watch on Internet Archive** — embedded player (public domain only)
  - **Watch on YouTube** — embedded player (official uploads)
  - **Watch on Tubi / Plex / Pluto** — opens external site in new tab
- Related movies (same genre/era)

### 4. AI Recommendations

- "What should I watch?" conversational prompt
- User describes mood, genre preference, or era → AI suggests matches from the catalogue
- AI uses only films known to be available on legal free sources

### 5. Watchlist

- Save movies to a personal "Watch Later" list
- Mark movies as watched
- Persisted per user (requires auth)

### 6. Collections

- User-created themed collections (e.g. "Film Noir Essentials", "Silent Horror")
- Pre-built curated collections for onboarding

### 7. Viewing Stats

- Movies watched count
- Hours spent
- Favourite genre breakdown
- Timeline of viewing history

---

## Non-Goals (Out of Scope)

- Video hosting — the app never stores or serves video files
- Paid streaming links — no Netflix, Disney+, etc. (only free sources)
- User-uploaded content
- Social features (comments, followers) — may be added later
- Mobile native app (PWA is sufficient)

---

## Legal Boundaries

| Allowed | Not allowed |
|---------|-------------|
| Embedding Internet Archive public domain videos | Embedding from unknown/unauthorized sites |
| Embedding official YouTube uploads via their player | Scraping streaming sites |
| Deep-linking to Tubi/Plex/Pluto title pages | Bypassing region restrictions |
| Displaying TMDB metadata under their non-commercial terms | Claiming paid content is free |
| Showing ads on the app (own monetization) | Using JustWatch API without commercial license |

### Footer Disclaimer

> This app does not host any video files. Movie metadata is provided by TMDB. Video playback is sourced from official YouTube channels or public domain archives (Internet Archive). Links to free streaming platforms are provided for user convenience.

---

## Technical Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind v4 + Happy Factory brand design system
- **Auth:** Supabase
- **Database:** Neon Postgres
- **AI:** Vercel AI SDK with multi-provider fallback (Anthropic > Cohere > Gemini)
- **Image storage:** Cloudflare R2
- **PWA:** @ducanh2912/next-pwa
- **i18n:** EN + ES (Spain Spanish)
- **Deployment:** Vercel

---

## API Keys Required

| Service | Env var | Purpose |
|---------|---------|---------|
| TMDB | `TMDB_API_KEY` | Movie metadata, posters, search |
| YouTube Data API | `YOUTUBE_API_KEY` | Search official free movies, get embed URLs |
| Internet Archive | (none) | Public metadata API, no key needed |

---

## Suggested Build Order

1. **Phase 1 — Catalogue:** TMDB search + poster grid with genre/type filters
2. **Phase 2 — Sources:** Internet Archive integration (public domain embed) + YouTube search/embed
3. **Phase 3 — External links:** Tubi/Plex/Pluto deep links as fallback sources
4. **Phase 4 — User features:** Auth, watchlist, watched history, viewing stats
5. **Phase 5 — AI:** Recommendation engine ("what should I watch?")
6. **Phase 6 — Collections:** User-created and curated collections
7. **Phase 7 — Polish:** Curated "Verified Free" list, region detection, performance optimization
