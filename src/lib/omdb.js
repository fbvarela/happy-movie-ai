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

function parseReleaseDate(released, year) {
  if (released && released !== "N/A") {
    const d = new Date(released);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10); // "2010-07-16"
    }
  }
  if (year) return `${year}-01-01`;
  return null;
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
    release_date: parseReleaseDate(item.Released, item.Year),
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

const OMDB_PAGE = 10;

export async function searchMovies(query, page = 1, perPage = OMDB_PAGE) {
  const appPage = parseInt(page);
  const chunks = Math.max(1, Math.ceil(perPage / OMDB_PAGE));
  const firstOmdbPage = (appPage - 1) * chunks + 1;

  try {
    const responses = await Promise.all(
      Array.from({ length: chunks }, (_, i) =>
        get({ s: query, page: firstOmdbPage + i, type: "movie" }).catch(() => ({}))
      )
    );
    const results = responses
      .flatMap((r) => r.Search || [])
      .slice(0, perPage)
      .map(normalizeListItem);
    const total = parseInt(responses[0]?.totalResults) || 0;
    return {
      results,
      page: appPage,
      total_results: total,
      total_pages: Math.ceil(total / (OMDB_PAGE * chunks)),
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

// OMDb has no real genre filter — keyed by TMDB genre id.
// IMDb IDs hand-curated; expand as needed.
const CURATED_GENRE_IDS = {
  // Action
  28: [
    "tt0095016", "tt1392190", "tt2911666", "tt0133093", "tt0172495",
    "tt0103064", "tt0258463", "tt0093409", "tt0111257", "tt0113277",
    "tt0093773", "tt0090605", "tt1899353", "tt0381061", "tt1074638",
    "tt0092099", "tt1745960", "tt0117060", "tt0468569", "tt4154796",
    "tt0993846", "tt0167260", "tt0080684", "tt0086190",
  ],
  // Comedy
  35: [
    "tt0829482", "tt0357413", "tt0838283", "tt1119646", "tt1478338",
    "tt0443453", "tt0942385", "tt0109686", "tt0107048", "tt0118715",
    "tt0080339", "tt0080487", "tt0088258", "tt0151804", "tt0196229",
    "tt0396269", "tt0478311", "tt1232829", "tt0302886", "tt0332379",
    "tt0114369", "tt0361748",
  ],
  // Horror
  27: [
    "tt0081505", "tt0077651", "tt0070047", "tt5052448", "tt7784604",
    "tt0087800", "tt0072271", "tt0054215", "tt2321549", "tt0063522",
    "tt0084787", "tt0078748", "tt3235888", "tt4263482", "tt8772262",
    "tt0117571", "tt0387564", "tt1179904", "tt1457767", "tt1922777",
  ],
  // Sci-Fi
  878: [
    "tt0083658", "tt1856101", "tt0816692", "tt1375666", "tt0062622",
    "tt0076759", "tt0133093", "tt2543164", "tt0470752", "tt1160419",
    "tt1136608", "tt0206634", "tt1182345", "tt0338013", "tt1276104",
    "tt1454468", "tt3659388", "tt1631867", "tt1706620", "tt2798920",
  ],
  // Drama
  18: [
    "tt0111161", "tt0068646", "tt0109830", "tt0108052", "tt0050083",
    "tt0099685", "tt0137523", "tt0110912", "tt0407887", "tt0469494",
    "tt0477348", "tt2582802", "tt6751668", "tt1285016", "tt4975722",
    "tt1895587", "tt0268978", "tt0169547", "tt0454921", "tt4034228",
  ],
  // Documentary
  99: [
    "tt7775622", "tt7681902", "tt5895028", "tt4044364", "tt2125608",
    "tt2375605", "tt1155592", "tt0310793", "tt0361596", "tt0390521",
    "tt0497116", "tt0428803", "tt0427312", "tt1772925", "tt1424432",
    "tt2870648", "tt8420184", "tt8760684", "tt5117320",
  ],
};

export async function getTrending(_timeWindow = "week", page = 1, perPage = OMDB_PAGE) {
  const start = (parseInt(page) - 1) * perPage;
  const ids = POPULAR_IDS.slice(start, start + perPage);

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
    total_pages: Math.ceil(POPULAR_IDS.length / perPage),
  };
}

async function fetchByIds(ids) {
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
  return results.filter(Boolean);
}

// OMDb doesn't support genre-based discovery. Use curated IMDb IDs when we
// have them, otherwise fall back to a name-based search approximation.
export async function discoverMovies({ page = 1, genreIds, perPage = OMDB_PAGE } = {}) {
  const firstGenre = genreIds ? parseInt(genreIds.split(",")[0]) : null;
  const curated = firstGenre && CURATED_GENRE_IDS[firstGenre];

  if (curated) {
    const appPage = parseInt(page);
    const start = (appPage - 1) * perPage;
    const slice = curated.slice(start, start + perPage);
    const results = await fetchByIds(slice);
    return {
      results,
      page: appPage,
      total_results: curated.length,
      total_pages: Math.ceil(curated.length / perPage),
    };
  }

  // Fall back to keyword search for genres we haven't curated yet.
  const GENRE_SEARCH_TERMS = {
    28: "action", 35: "comedy", 27: "horror", 878: "space",
    18: "drama", 99: "documentary", 12: "adventure", 16: "animation",
    80: "crime", 10751: "family", 14: "fantasy", 10402: "musical",
    9648: "mystery", 10749: "love", 53: "thriller", 10752: "war",
    37: "western",
  };

  const term = (firstGenre && GENRE_SEARCH_TERMS[firstGenre]) || "movie";

  return searchMovies(term, page, perPage);
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
