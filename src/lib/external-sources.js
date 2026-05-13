const PLATFORMS = [
  {
    id: "tubi",
    name: "Tubi",
    searchUrl: (title) =>
      `https://tubitv.com/search/${encodeURIComponent(title)}`,
    color: "#fa382f",
  },
  {
    id: "plex",
    name: "Plex",
    searchUrl: (title) =>
      `https://watch.plex.tv/search?q=${encodeURIComponent(title)}`,
    color: "#e5a00d",
  },
  {
    id: "pluto",
    name: "Pluto TV",
    searchUrl: (title) =>
      `https://pluto.tv/en/search/details/movies/${encodeURIComponent(title)}`,
    color: "#00b4e6",
  },
];

export function getExternalLinks(title) {
  return PLATFORMS.map((p) => ({
    source: p.id,
    name: p.name,
    url: p.searchUrl(title),
    color: p.color,
  }));
}

export { PLATFORMS };
