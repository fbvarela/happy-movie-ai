/**
 * RTVE Play API client — fetches Spanish movies from Spain's public broadcaster.
 *
 * RTVE exposes a JSON API at https://www.rtve.es/api/.
 * Movie programs:
 *   1028807 — Cine Club Play      (~69 movies, contemporary Spanish cinema)
 *   1001122 — Cine en Familia      (~35 movies, family films)
 *   43530   — El cine de La 2      (~1500 movies, classic + arthouse)
 *   1559    — Cine de barrio        (~678 movies, classic popular Spanish cinema)
 *
 * Each video object includes `idImdb` when available, enabling direct cross-ref with OMDb.
 */

import { RTVE_PROGRAMS } from "@/constants/rtve";

const BASE = "https://www.rtve.es/api";

export { RTVE_PROGRAMS };

/**
 * Fetch a page of movies from a specific RTVE program.
 * @param {string} programId  RTVE program id
 * @param {number} page       1-based
 * @param {number} size       Items per page (max 60)
 * @returns {{ items: RtveMovie[], total: number, totalPages: number }}
 */
export async function fetchRtveProgram(programId, page = 1, size = 20) {
  const url = `${BASE}/programas/${programId}/videos.json?size=${size}&page=${page}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return { items: [], total: 0, totalPages: 0 };

  const data = await res.json();
  const pg = data.page || {};

  const items = (pg.items || [])
    .filter((v) => isMovie(v))
    .map(normalizeRtveVideo);

  return {
    items,
    total: pg.total || 0,
    totalPages: pg.totalPages || 0,
  };
}

/**
 * Fetch movies from ALL RTVE movie programs (merged, deduplicated).
 * @param {number} page
 * @param {number} size
 */
export async function fetchAllRtveMovies(page = 1, size = 20) {
  // Fetch from all programs in parallel
  const results = await Promise.all(
    RTVE_PROGRAMS.map((p) =>
      fetchRtveProgram(p.id, page, size).catch(() => ({
        items: [],
        total: 0,
        totalPages: 0,
      }))
    )
  );

  // Merge and deduplicate by RTVE video id
  const seen = new Set();
  const merged = [];

  for (const r of results) {
    for (const item of r.items) {
      if (!seen.has(item.rtveId)) {
        seen.add(item.rtveId);
        merged.push(item);
      }
    }
  }

  // Approximate total from the largest program
  const totalItems = results.reduce((sum, r) => sum + r.total, 0);

  return {
    items: merged,
    total: totalItems,
    totalPages: Math.ceil(totalItems / size),
  };
}

/**
 * Search RTVE movies by title (client-side filtering on a page of results).
 * RTVE API doesn't have a great search — we fetch large pages and filter.
 */
export async function searchRtveMovies(query, page = 1) {
  const q = query.toLowerCase().trim();
  const size = 60; // max allowed by API

  // Search across top movie programs
  const results = await Promise.all(
    RTVE_PROGRAMS.slice(0, 2).map((p) =>
      fetchRtveProgram(p.id, page, size).catch(() => ({ items: [] }))
    )
  );

  const all = results.flatMap((r) => r.items || []);
  const filtered = all.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.director && m.director.toLowerCase().includes(q))
  );

  return {
    items: filtered.slice(0, 20),
    total: filtered.length,
    totalPages: 1,
  };
}

/**
 * Get a single RTVE video by its ID.
 * @param {string} videoId  RTVE video ID
 */
export async function getRtveVideo(videoId) {
  const url = `${BASE}/videos/${videoId}.json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const data = await res.json();
  const items = data.page?.items || [];
  if (!items.length) return null;

  return normalizeRtveVideo(items[0]);
}

/**
 * Check if an IMDb ID has an RTVE source available.
 * Fetches from all programs and checks for matching idImdb.
 * Uses a cached index for performance.
 */
let _imdbIndex = null;
let _imdbIndexTimestamp = 0;
const INDEX_TTL = 1000 * 60 * 60 * 4; // 4 hours

export async function findRtveByImdb(imdbId) {
  if (!imdbId) return null;

  // Build or use cached index
  if (!_imdbIndex || Date.now() - _imdbIndexTimestamp > INDEX_TTL) {
    _imdbIndex = await buildImdbIndex();
    _imdbIndexTimestamp = Date.now();
  }

  return _imdbIndex.get(imdbId) || null;
}

async function buildImdbIndex() {
  const index = new Map();

  // Fetch first few pages from each program to build index
  for (const prog of RTVE_PROGRAMS) {
    try {
      // Fetch first 3 pages (180 items max per program)
      for (let p = 1; p <= 3; p++) {
        const result = await fetchRtveProgram(prog.id, p, 60);
        for (const item of result.items) {
          if (item.imdbId) {
            index.set(item.imdbId, item);
          }
        }
        if (p >= result.totalPages) break;
      }
    } catch {
      // Skip failed programs
    }
  }

  return index;
}

// ── Helpers ──────────────────────────────────────────────

/** Filter to only full-length movies (not clips/trailers) */
function isMovie(video) {
  const subType = video.subType?.name?.toLowerCase() || "";
  const type = video.type?.name?.toLowerCase() || "";
  const duration = video.duration || 0;

  // "Película" subtype or "Completo" type with >40 min duration
  if (subType === "película" || subType === "pelicula") return true;
  if (type === "completo" && duration > 40 * 60 * 1000) return true;

  // Long videos (>60min) are likely full movies
  if (duration > 60 * 60 * 1000) return true;

  return false;
}

/** Normalize an RTVE video object to our internal format */
function normalizeRtveVideo(video) {
  const duration = video.duration || 0;
  const durationMin = Math.round(duration / 60000);

  // Extract best thumbnail
  const thumbnail =
    video.previews?.horizontal2 ||
    video.previews?.horizontal ||
    video.thumbnail ||
    video.imageSEO ||
    null;

  const poster =
    video.previews?.vertical ||
    video.previews?.vertical2 ||
    thumbnail;

  // Extract genres from RTVE's generos array
  const genres = (video.generos || []).map((g) => g.generoInf).filter(Boolean);

  // Check geo-restriction
  const geoRestricted = video.geolocalizado === true;

  // Check if content is expired
  const expired = video.expirationDate
    ? parseRtveDate(video.expirationDate) < new Date()
    : false;

  return {
    rtveId: video.id,
    imdbId: video.idImdb || null,
    title: cleanTitle(video.title || video.shortTitle || ""),
    longTitle: video.longTitle || null,
    description: stripHtml(video.description || video.shortDescription || ""),
    shortDescription: video.shortDescription || "",
    director: video.director || null,
    cast: video.casting || null,
    year: video.productionDate ? parseInt(video.productionDate) : null,
    durationMs: duration,
    durationMin,
    thumbnail,
    poster,
    genres,
    ageRange: video.ageRange || null,
    geoRestricted,
    expired,
    watchUrl: video.htmlUrl || `https://www.rtve.es/play/videos/${video.id}/`,
    shortUrl: video.htmlShortUrl || null,
    program: video.programInfo?.title || null,
    programId: video.programInfo?.id || null,
    publicationDate: video.publicationDate || null,
    expirationDate: video.expirationDate || null,
    qualities: (video.qualities || []).map((q) => ({
      preset: q.preset,
      width: q.width,
      height: q.height,
    })),
    source: "rtve",
  };
}

function cleanTitle(title) {
  // Remove program prefix like "Historia de nuestro cine - "
  return title
    .replace(/^Historia de nuestro cine\s*[-–—]\s*/i, "")
    .replace(/^Cine de barrio\s*[-–—]\s*/i, "")
    .replace(/^El cine de La 2\s*[-–—]\s*/i, "")
    .replace(/\.$/, "")
    .trim();
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&quot;/g, '"')
    .trim();
}

function parseRtveDate(dateStr) {
  if (!dateStr) return null;
  // RTVE format: "24-02-2026 07:45:00"
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("-");
  return new Date(`${year}-${month}-${day}T${timePart || "00:00:00"}`);
}

/**
 * Convert an RTVE movie to the TMDB-compatible shape used by MovieCard.
 */
export function rtveToMovieCard(rtveMovie) {
  return {
    id: rtveMovie.imdbId || `rtve-${rtveMovie.rtveId}`,
    title: rtveMovie.title,
    poster_path: rtveMovie.poster || rtveMovie.thumbnail,
    release_date: rtveMovie.year ? `${rtveMovie.year}-01-01` : null,
    vote_average: 0,
    genre_ids: [],
    _rtve: true,
    _rtveId: rtveMovie.rtveId,
    _watchUrl: rtveMovie.watchUrl,
    _geoRestricted: rtveMovie.geoRestricted,
  };
}
