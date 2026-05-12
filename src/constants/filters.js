export const ERAS = [
  { id: "silent", label: "Silent Era", labelEs: "Cine mudo", yearGte: null, yearLte: 1929 },
  { id: "golden", label: "Golden Age", labelEs: "Edad de Oro", yearGte: 1930, yearLte: 1960 },
  { id: "classic", label: "Classic", labelEs: "Clásico", yearGte: null, yearLte: 1969 },
  { id: "bw", label: "Black & White", labelEs: "Blanco y negro", yearGte: null, yearLte: 1965 },
  { id: "modern-classic", label: "Modern Classic", labelEs: "Clásico moderno", yearGte: 1970, yearLte: 1999 },
  { id: "contemporary", label: "Contemporary", labelEs: "Contemporáneo", yearGte: 2000, yearLte: null },
];

export const TMDB_GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  27: "Horror",
  10402: "Musical",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const LANGUAGES = [
  { code: "en", label: "English", labelEs: "Inglés" },
  { code: "es", label: "Spanish", labelEs: "Español" },
  { code: "fr", label: "French", labelEs: "Francés" },
  { code: "de", label: "German", labelEs: "Alemán" },
  { code: "it", label: "Italian", labelEs: "Italiano" },
  { code: "ja", label: "Japanese", labelEs: "Japonés" },
  { code: "ko", label: "Korean", labelEs: "Coreano" },
  { code: "pt", label: "Portuguese", labelEs: "Portugués" },
  { code: "zh", label: "Chinese", labelEs: "Chino" },
  { code: "hi", label: "Hindi", labelEs: "Hindi" },
  { code: "ru", label: "Russian", labelEs: "Ruso" },
];

export const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular", labelEs: "Más populares" },
  { value: "vote_average.desc", label: "Highest Rated", labelEs: "Mejor valoradas" },
  { value: "primary_release_date.desc", label: "Newest First", labelEs: "Más recientes" },
  { value: "primary_release_date.asc", label: "Oldest First", labelEs: "Más antiguas" },
];

export const RATING_OPTIONS = [
  { value: "", label: "Any Rating", labelEs: "Cualquier puntuación" },
  { value: "7", label: "7+ Stars", labelEs: "7+ estrellas" },
  { value: "8", label: "8+ Stars", labelEs: "8+ estrellas" },
  { value: "9", label: "9+ Stars", labelEs: "9+ estrellas" },
];
