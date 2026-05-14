const BASE = "https://www.omdbapi.com";
const KEY = process.env.OMDB_API_KEY;

async function get(params = {}) {
  const u = new URL(BASE);
  u.searchParams.set("apikey", KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  }
  const res = await fetch(u.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`OMDb: ${res.status}`);
  const data = await res.json();
  if (data.Response === "False") throw new Error(data.Error || "OMDb error");
  return data;
}

// ── Normalize OMDb data → TMDB-compatible shape ───────────

const GENRE_TO_ID = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35,
  Crime: 80, Documentary: 99, Drama: 18, Family: 10751,
  Fantasy: 14, Horror: 27, Musical: 10402, Mystery: 9648,
  Romance: 10749, "Sci-Fi": 878, Thriller: 53, War: 10752,
  Western: 37, "Film-Noir": 9648, Biography: 18, History: 36,
  Sport: 10751, Music: 10402,
};

function normalizeListItem(item) {
  return {
    id: item.imdbID,
    title: item.Title,
    poster_path: item.Poster !== "N/A" ? item.Poster : null,
    release_date: item.Year ? `${item.Year}-01-01` : null,
    vote_average: 0,
    genre_ids: [],
  };
}

function normalizeDetail(item) {
  const genres = (item.Genre || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const genreObjs = genres.map((g) => ({ id: GENRE_TO_ID[g] || 0, name: g }));
  const genreIds = genreObjs.map((g) => g.id).filter(Boolean);

  const ratingStr = item.imdbRating;
  const voteAvg = ratingStr && ratingStr !== "N/A" ? parseFloat(ratingStr) : 0;

  const runtimeMin = parseInt(item.Runtime) || 0;

  const cast = (item.Actors || "")
    .split(",")
    .map((name, i) => ({ id: i, name: name.trim(), character: "", profile_path: null }))
    .filter((c) => c.name && c.name !== "N/A");

  const crew = [];
  if (item.Director && item.Director !== "N/A") {
    item.Director.split(",").forEach((d, i) => {
      crew.push({ id: 1000 + i, name: d.trim(), job: "Director" });
    });
  }

  return {
    id: item.imdbID,
    title: item.Title,
    poster_path: item.Poster !== "N/A" ? item.Poster : null,
    backdrop_path: null,
    release_date: item.Released && item.Released !== "N/A" ? item.Released : (item.Year ? `${item.Year}-01-01` : null),
    vote_average: voteAvg,
    runtime: runtimeMin,
    overview: item.Plot !== "N/A" ? item.Plot : "",
    tagline: null,
    genres: genreObjs,
    genre_ids: genreIds,
    credits: { cast, crew },
    recommendations: { results: [] },
    videos: { results: [] },
  };
}

// ── Public API (matches old tmdb.js exports) ──────────────

export async function searchMovies(query, page = 1) {
  try {
    const data = await get({ s: query, page, type: "movie" });
    const results = (data.Search || []).map(normalizeListItem);
    const total = parseInt(data.totalResults) || 0;
    return {
      results,
      page: parseInt(page),
      total_results: total,
      total_pages: Math.ceil(total / 10),
    };
  } catch {
    return { results: [], page: 1, total_results: 0, total_pages: 0 };
  }
}

export async function getMovie(id) {
  const data = await get({ i: id, plot: "full" });
  return normalizeDetail(data);
}

// OMDb doesn't support trending — use curated popular IMDb IDs
const POPULAR_IDS = [
  "tt1375666", "tt0111161", "tt0068646", "tt0468569", "tt0167260",
  "tt0110912", "tt0137523", "tt0109830", "tt0120737", "tt0080684",
  "tt0816692", "tt0133093", "tt0076759", "tt0099685", "tt0114369",
  "tt0361748", "tt0482571", "tt1853728", "tt0120815", "tt0993846",
  "tt0172495", "tt2582802", "tt0407887", "tt7286456", "tt0086190",
];

export async function getTrending(_timeWindow = "week", page = 1) {
  const start = (parseInt(page) - 1) * 10;
  const ids = POPULAR_IDS.slice(start, start + 10);

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const data = await get({ i: id });
        return normalizeListItem(data);
      } catch {
        return null;
      }
    })
  );

  return {
    results: results.filter(Boolean),
    page: parseInt(page),
    total_results: POPULAR_IDS.length,
    total_pages: Math.ceil(POPULAR_IDS.length / 10),
  };
}

// OMDb doesn't support genre-based discovery — fall back to search
export async function discoverMovies({ page = 1, genreIds } = {}) {
  // Use a generic search term based on genre to approximate discovery
  const GENRE_SEARCH_TERMS = {
    28: "action", 35: "comedy", 27: "horror", 878: "space",
    18: "drama", 99: "documentary", 12: "adventure", 16: "animation",
    80: "crime", 10751: "family", 14: "fantasy", 10402: "musical",
    9648: "mystery", 10749: "love", 53: "thriller", 10752: "war",
    37: "western",
  };

  const firstGenre = genreIds ? genreIds.split(",")[0] : null;
  const term = (firstGenre && GENRE_SEARCH_TERMS[firstGenre]) || "movie";

  return searchMovies(term, page);
}

export function posterUrl(path, _size = "w342") {
  if (!path) return null;
  // OMDb returns full URLs; TMDB returns relative paths
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${_size}${path}`;
}

export function backdropUrl(path, _size = "w1280") {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${_size}${path}`;
}
