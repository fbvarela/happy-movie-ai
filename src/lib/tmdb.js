const BASE = "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY;

function url(path, params = {}) {
  const u = new URL(`${BASE}${path}`);
  u.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  }
  return u.toString();
}

async function get(path, params) {
  const res = await fetch(url(path, params), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${path}: ${res.status}`);
  return res.json();
}

export async function searchMovies(query, page = 1) {
  return get("/search/movie", { query, page, include_adult: false });
}

export async function discoverMovies({
  page = 1,
  genreIds,
  yearGte,
  yearLte,
  voteGte,
  language,
  sortBy = "popularity.desc",
} = {}) {
  return get("/discover/movie", {
    page,
    sort_by: sortBy,
    with_genres: genreIds,
    "primary_release_date.gte": yearGte ? `${yearGte}-01-01` : undefined,
    "primary_release_date.lte": yearLte ? `${yearLte}-12-31` : undefined,
    "vote_average.gte": voteGte,
    with_original_language: language,
    include_adult: false,
  });
}

export async function getMovie(id) {
  return get(`/movie/${id}`, { append_to_response: "credits,recommendations,videos" });
}

export async function getTrending(timeWindow = "week", page = 1) {
  return get(`/trending/movie/${timeWindow}`, { page });
}

export async function getGenres() {
  const data = await get("/genre/movie/list", {});
  return data.genres;
}

export function posterUrl(path, size = "w342") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function backdropUrl(path, size = "w1280") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
