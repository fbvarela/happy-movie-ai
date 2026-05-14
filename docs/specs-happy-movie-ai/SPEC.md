# Happy Movie AI — Product Specification

> **Part of The Happy Factory suite.**
> Follows all platform conventions defined in `HAPPY-FACTORY-CONTEXT.md` and `BRAND-SPEC.md`.

---

## 1. Vision

Happy Movie AI is a movie discovery and streaming platform focused on **legally free movies** — public domain classics, Creative Commons films, and content from legal open-access platforms. It combines AI-powered mood-based recommendations with curated collections and multi-source legal streaming.

**Core insight:** Millions of great films are legally free to watch (public domain, Internet Archive, YouTube, national broadcasters) but they're scattered across dozens of sites with no unified discovery experience. Happy Movie AI is the single place to find, explore, and watch them all.

**Differentiator:** Unlike piracy-adjacent platforms, Happy Movie AI only surfaces legal sources. Unlike paid streaming services, everything is free. The AI recommendation engine understands *mood*, not just genre — "I want something mind-bending" yields different results than "Sci-Fi."

**New direction — Spanish Legal Cinema:** Integration with RTVE Play (Radio Televisión Española) as the first national broadcaster source, providing access to hundreds of Spanish-language films legally available for free. This opens the door to a broader **European public broadcaster** strategy.

---

## 2. Target Users

| Persona | Description |
|---|---|
| **Classic film buff** | Loves golden-age Hollywood, film noir, silent cinema. Wants easy access to public domain films with good metadata |
| **Spanish cinephile** | Wants to discover Spanish cinema — auteur films, comedies, dramas — legally through RTVE and similar platforms |
| **Budget-conscious viewer** | Wants to watch movies without subscriptions. Happy to explore older or independent films |
| **Mood-driven watcher** | Doesn't know what to watch. Wants AI to suggest something based on how they feel right now |
| **Film student/educator** | Needs legal access to classic and historically important films for study or teaching |

**Initial content:** Public domain films (OMDb + Internet Archive), YouTube-hosted films, RTVE Play catalogue (Spanish).
**Languages:** English and Spanish (full i18n).

---

## 3. Feature Tiers

### 3.1 Free Tier (Current — All Features)

| Feature | Limit |
|---|---|
| Movie browsing & search | Unlimited |
| Movie detail + streaming links | Unlimited |
| AI mood-based recommendations | 10 per minute |
| Watchlist | Unlimited |
| Watch history + ratings | Unlimited |
| Collections (view curated) | Unlimited |
| Collections (create own) | 20 total |
| Stats dashboard | Full access |
| RTVE Spanish movies | Unlimited |

### 3.2 Premium Tier (Planned — $4.99/mo)

| Feature | Limit |
|---|---|
| AI recommendations | Unlimited, faster models |
| Collections | Unlimited |
| Advanced stats | Genre breakdown, taste profile |
| Personalized daily picks | AI-curated daily email/feed |
| Offline watchlist sync | Save movie data for offline browsing |

### 3.3 Bundle Tier ($19.99/mo)

All Premium features + full access to every Happy Factory app.

---

## 4. Feature Details

### 4.1 Movie Discovery (`/discover`)

- **Genre grid:** Browse by genre with visual genre cards
- **Search:** Full-text search via OMDb API with debounced input
- **Pagination:** Server-side paginated results
- **Movie cards:** Poster, title, year, rating badge, genre chips, watchlist toggle
- **Files:** `src/app/discover/page.jsx`, `src/components/SearchBar.jsx`, `src/components/FilterPanel.jsx`, `src/components/MovieGrid.jsx`, `src/components/MovieCard.jsx`

### 4.2 Movie Detail (`/movie/[id]`)

- **Metadata:** Title, year, runtime, genres, director, plot, rating
- **Poster:** via OMDb `posterUrl()` helper
- **Cast list:** Scrollable actor cards
- **Source buttons:** Links to Internet Archive, YouTube, and (planned) RTVE when available
- **Quality badge:** Visual indicator of source quality (HD/SD/Archive)
- **Related movies:** AI-powered or genre-based suggestions
- **Actions:** Add to watchlist, mark as watched (with 1-5 star rating), add to collection
- **SEO:** Server-side `generateMetadata()` for OG tags and Twitter cards
- **Files:** `src/app/movie/[id]/page.jsx`, `src/app/movie/[id]/layout.jsx`, `src/components/SourceButtons.jsx`, `src/components/CastList.jsx`, `src/components/RelatedMovies.jsx`, `src/components/QualityBadge.jsx`

### 4.3 AI Recommendations (`/recommend`)

- **Mood selector:** 10 mood chips (Feel-Good, Mind-Bending, Film Noir, Action, Romance, Comedy, Horror, Sci-Fi, Documentary, World Cinema) with EN/ES labels
- **Chat interface:** Streaming AI responses via Vercel AI SDK `useChat` hook
- **Multi-provider fallback:** Anthropic → Cohere → Gemini (configured in `src/lib/ai.js`)
- **Movie extraction:** Parses JSON movie arrays from AI text responses, fetches metadata from OMDb
- **Follow-up:** Users can refine ("something more recent", "less scary") in the same chat
- **Rate limited:** 10 requests/minute via in-memory limiter
- **Files:** `src/app/recommend/page.jsx`, `src/app/api/recommend/route.js`, `src/components/MoodSelector.jsx`, `src/components/RecommendationCard.jsx`

### 4.4 Watchlist (`/watchlist`)

- **Toggle:** Heart button on movie cards and detail pages
- **Persistence:** Neon Postgres `watchlist` table, user-scoped
- **Files:** `src/components/WatchlistButton.jsx`, `src/app/watchlist/page.jsx`, `src/app/api/watchlist/route.js`

### 4.5 Watch History & Ratings

- **Mark as watched:** Button on movie detail page with 1-5 star rating
- **History page:** Chronological list of watched movies with ratings
- **Persistence:** Neon Postgres `watch_history` table
- **Files:** `src/components/MarkWatchedButton.jsx`, `src/components/RatingStars.jsx`, `src/app/api/history/route.js`

### 4.6 Collections (`/collections`)

- **Curated collections:** System-created themed collections (Film Noir Essentials, Silent Horror Classics, etc.)
- **User collections:** Create, edit, delete custom collections
- **Collection detail:** Movie grid with position ordering, add/remove movies
- **Add from movie detail:** Modal overlay to pick or create a collection
- **Cover art:** Auto-generated mosaic from first 1-4 movie posters
- **Files:** `src/app/collections/page.jsx`, `src/app/collections/[id]/page.jsx`, `src/app/api/collections/route.js`, `src/app/api/collections/[id]/route.js`, `src/app/api/collections/[id]/movies/route.js`, `src/components/CollectionCard.jsx`, `src/components/AddToCollectionModal.jsx`

### 4.7 Stats Dashboard (`/stats`)

- **Stat blocks:** Movies watched, hours spent, average rating, this year count
- **Timeline chart:** Monthly activity over last 12 months (CSS-only vertical bars)
- **Rating distribution:** 1-5 star horizontal bar chart
- **Recently watched:** Movie grid of latest entries
- **Files:** `src/app/stats/page.jsx`, `src/app/api/stats/route.js`, `src/components/TimelineChart.jsx`, `src/components/GenreChart.jsx`

### 4.8 Settings (`/settings`)

- **Account:** Email display, sign out
- **Appearance:** Dark/light theme toggle
- **Language:** English/Spanish switcher
- **Legal disclaimer:** OMDb/IA/YouTube attribution
- **Files:** `src/app/settings/page.jsx`, `src/components/ThemeToggle.jsx`

### 4.9 Video Sources & Streaming (`/watch/[id]`)

- **Internet Archive:** Free public domain movies via embed
- **YouTube:** Legal full-length films via embed
- **Source detection:** `src/lib/internet-archive.js`, `src/lib/youtube.js`, `src/lib/external-sources.js`
- **Quality checking:** `src/lib/quality-check.js` validates source availability
- **Files:** `src/app/watch/page.jsx`, `src/components/VideoPlayer.jsx`, `src/components/SourceBadge.jsx`

### 4.10 RTVE Integration (Planned — Phase 9)

- **Catalogue scraping:** Parse RTVE Play's "Cine Español" collection at `rtve.es/play/colecciones/cine-espanol/1546/`
- **Movie matching:** Cross-reference RTVE titles with OMDb for unified metadata
- **Source button:** "Watch on RTVE" button on movie detail pages for available titles
- **Browse section:** Dedicated "Spanish Cinema" genre/category on discover page
- **Geo-awareness:** RTVE content may be geo-restricted to Spain — detect and show appropriate messaging
- **Curated collections:** Auto-generated Spanish cinema collections from RTVE categories
- **Legal compliance:** All content is officially published by Spain's public broadcaster; no scraping of video streams, only metadata and deep links
- **Data flow:** RTVE metadata → match with OMDb → store source link in DB → surface in UI

---

## 5. Data Model

```
-- Auth (managed by Neon Auth / Better Auth)
user
  id, email, name, image, created_at, updated_at

-- Core tables (src/db/migrate.sql)
watchlist
  id (UUID PK), user_id (TEXT), tmdb_id (INT), title, poster_path, added_at

watch_history
  id (UUID PK), user_id (TEXT), tmdb_id (INT), title, poster_path,
  rating (1-5), watched_at

-- Collections (src/db/migrate-phase6.sql)
collections
  id (UUID PK), user_id (TEXT), name, description, is_curated (BOOL),
  created_at, updated_at

collection_movies
  id (UUID PK), collection_id (UUID FK→collections), tmdb_id (TEXT),
  title, poster_path, position (INT), added_at

-- Planned: RTVE sources (Phase 9)
movie_sources
  id (UUID PK), imdb_id (TEXT), source (ENUM: internet_archive, youtube, rtve),
  source_url (TEXT), quality (TEXT), geo_restricted (BOOL), last_checked (TIMESTAMPTZ),
  UNIQUE(imdb_id, source)
```

---

## 6. AI Integration

| Component | Model/Provider | Purpose |
|---|---|---|
| **Mood recommendations** | Anthropic Claude → Cohere Command → Google Gemini (fallback chain) | Streaming movie suggestions based on mood + conversation |
| **Related movies** | Same fallback chain | Suggest similar titles on movie detail page |
| **Vision (planned)** | `src/lib/ai-vision.js` | Identify movies from screenshots/posters |
| **Image generation (planned)** | `src/lib/ai-image.js` | Custom collection cover art |

**AI SDK setup:** Vercel AI SDK v4 (`ai` package) with provider-specific packages (`@ai-sdk/anthropic`, `@ai-sdk/cohere`, `@ai-sdk/google`). Model selection via `getTextModel()` in `src/lib/ai.js` which tries providers in order until one succeeds.

**System prompt strategy:** Constrain recommendations to legally free/public domain movies. Include user's mood, language preference, and conversation history for context.

---

## 7. Navigation & Screens

| Route | Screen | Auth Required |
|---|---|---|
| `/` | Home — featured movies, genre quick links | No |
| `/discover` | Browse & search movies by genre | No |
| `/movie/[id]` | Movie detail with metadata, sources, actions | No (actions require auth) |
| `/watch/[id]` | Video player with source embed | No |
| `/recommend` | AI mood-based recommendation chat | No |
| `/watchlist` | User's saved movies | Yes |
| `/collections` | Curated + user collection list | No (create requires auth) |
| `/collections/[id]` | Collection detail with movie grid | No (edit requires auth) |
| `/stats` | Viewing stats dashboard | Yes |
| `/settings` | Account, theme, language | Yes |
| `/login` | Email/password auth via Neon Auth | No |
| `/offline` | PWA offline fallback | No |

**Navigation pattern:**
- Desktop: Dark sidebar (`src/components/SidebarNav.jsx`) with icon + label links
- Mobile: Bottom tab bar (`src/components/BottomNav.jsx`) with 5 tabs (Home, Discover, Recommend, Watchlist, Settings)

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, `--webpack` flag for PWA) |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS v4 + custom CSS (Happy Factory design tokens: bark, leaf, sun, clay) |
| **Database** | Neon Serverless Postgres via `@neondatabase/serverless` |
| **Auth** | Neon Auth (Better Auth) via `@neondatabase/auth` |
| **AI** | Vercel AI SDK v4 with Anthropic, Cohere, Google providers |
| **Movie data** | OMDb API (replaces TMDB) |
| **Video sources** | Internet Archive embed, YouTube embed, RTVE deep links (planned) |
| **PWA** | `@ducanh2912/next-pwa` with offline fallback |
| **Payments** | Stripe (planned, not yet integrated) |
| **Storage** | AWS S3 (planned, for user-uploaded images) |
| **i18n** | Custom `LanguageContext` with EN/ES translations |
| **Testing** | Vitest + React Testing Library |
| **Deployment** | Vercel |
| **Icons** | Lucide React |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse PWA score | 100 |
| Offline fallback | Custom branded page at `/offline` |
| Image optimization | OMDb posters via `posterUrl()` helper with size param |
| API rate limiting | 60 req/min general, 30 req/min search, 10 req/min AI |
| WCAG | 2.1 AA compliance (aria-labels on cards, semantic HTML) |
| Supported browsers | Last 2 versions of Chrome, Safari, Firefox, Edge |
| Mobile tap targets | >= 44px |
| Responsive breakpoints | 375px (mobile), 600px (tablet), 768px, 1024px, 1440px |
| Error handling | React ErrorBoundary wrapper + branded 404/loading pages |
| SEO | Dynamic OG tags via `generateMetadata()` on movie detail pages |

---

## 10. Phased Roadmap

### Phases 0-4 — Foundation & Core ✅ COMPLETE

- Next.js 16 scaffold with Happy Factory brand system
- Neon Auth (Better Auth) email/password authentication
- OMDb API integration with TMDB-compatible normalization
- Movie discovery (search, genre browsing, pagination)
- Movie detail with cast, plot, ratings, poster
- Internet Archive + YouTube source detection and streaming
- Watchlist (add/remove) and watch history with 1-5 star ratings
- Video player page with source embed

### Phase 5 — AI Recommendations ✅ COMPLETE

- Mood selector with 10 moods (EN/ES)
- Streaming AI chat via Vercel AI SDK
- Multi-provider fallback (Anthropic → Cohere → Gemini)
- JSON movie extraction from AI responses with OMDb enrichment
- Rate limiting (10 req/min)

### Phase 6 — Collections ✅ COMPLETE

- Collections CRUD (create, edit, delete)
- 5 seeded curated collections with classic films
- Add/remove movies from collections
- Collection detail with poster mosaic covers
- Add-to-collection modal on movie detail page

### Phase 7 — Stats Dashboard ✅ COMPLETE

- 4 stat blocks (watched, hours, avg rating, this year)
- Monthly activity timeline chart (CSS-only)
- Rating distribution chart (CSS-only)
- Recently watched movie grid

### Phase 8 — Production Polish ✅ COMPLETE

- Settings page (account, theme, language)
- PWA offline fallback page
- React ErrorBoundary
- Footer with legal disclaimers
- SEO metadata on movie detail pages
- In-memory rate limiting on all API routes
- Global loading spinner and branded 404 page

### Phase 9 — RTVE Spanish Cinema (PLANNED)

| # | Task | Effort |
|---|---|---|
| 9.1 | Research RTVE Play API/feed structure; identify catalogue endpoints or RSS feeds | M |
| 9.2 | Build RTVE scraper/parser (`src/lib/rtve.js`) to extract movie titles, URLs, thumbnails | L |
| 9.3 | Create `movie_sources` DB table and migration for multi-source tracking | S |
| 9.4 | Implement RTVE-to-OMDb title matching pipeline (fuzzy match by title + year) | M |
| 9.5 | Add "Watch on RTVE" source button to movie detail page | S |
| 9.6 | Add "Spanish Cinema" category to discover page with RTVE-sourced films | M |
| 9.7 | Create auto-generated RTVE curated collections (by decade, genre, director) | M |
| 9.8 | Implement geo-restriction detection and user-friendly messaging | S |
| 9.9 | Add RTVE content refresh cron job (weekly catalogue sync) | M |
| 9.10 | Spanish-language UI polish — ensure all RTVE features have proper ES translations | S |

### Phase 10 — European Public Broadcasters (PLANNED)

- Add additional free legal sources: Arte (France/Germany), BFI Player (UK free tier), Filmin free catalogue
- Generalize `movie_sources` to support N sources per movie
- Source availability dashboard in settings
- Regional content recommendations based on user locale

### Phase 11 — Premium & Payments (PLANNED)

- Stripe integration for Premium ($4.99/mo) and Bundle ($19.99/mo) plans
- `<PremiumGate>` component for gated features
- `isPremium(plan)` helper recognizing both `'premium'` and `'bundle'`
- Advanced stats (genre breakdown, taste profile, viewing streaks)
- Personalized daily picks via AI
- Unlimited AI recommendations for premium users

### Phase 12 — Social & Sharing (PLANNED)

- Public user profiles with viewing stats
- Share movie/collection links with OG previews
- Movie reviews (text + rating) visible to other users
- "Friends watching" feed
