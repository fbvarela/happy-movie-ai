const BASE = "https://api.vimeo.com";
const TOKEN = process.env.VIMEO_ACCESS_TOKEN;

// Curated set of channels/users known to host full-length legal movies
// (public domain, Creative Commons, or rights-holder uploads).
const OFFICIAL_USERS = new Set([
  "blender",
  "blenderfoundation",
  "sintel",
  "tearsofsteel",
  "publicdomain",
  "publicdomainmovies",
]);

export async function searchVimeo(title, year) {
  if (!TOKEN) return [];

  const query = year ? `${title} ${year}` : title;

  const params = new URLSearchParams({
    query,
    per_page: "10",
    sort: "relevant",
    direction: "desc",
    filter: "CC",
    filter_playable: "true",
  });
  // Restrict to long-form video (Vimeo durations are in seconds; > 40 min).
  params.append("filter", "duration");

  const res = await fetch(`${BASE}/videos?${params}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.data || [];

  return items
    .filter((v) => (v.duration || 0) >= 40 * 60)
    .map((v) => {
      const videoId = v.uri ? v.uri.replace("/videos/", "") : null;
      if (!videoId) return null;

      const userSlug = v.user?.uri ? v.user.uri.replace("/users/", "").toLowerCase() : "";
      const userName = (v.user?.name || "").toLowerCase().replace(/\s+/g, "");

      const best = (v.files || [])
        .filter((f) => f.type?.startsWith("video"))
        .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

      return {
        source: "vimeo",
        videoId,
        title: v.name,
        channelTitle: v.user?.name || null,
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        watchUrl: v.link || `https://vimeo.com/${videoId}`,
        thumbnail: v.pictures?.sizes?.slice(-1)[0]?.link || null,
        duration: v.duration || null,
        definition: (best?.height || 0) >= 720 ? "hd" : "sd",
        resolution: best
          ? { width: best.width || null, height: best.height || null }
          : null,
        isOfficialChannel: OFFICIAL_USERS.has(userSlug) || OFFICIAL_USERS.has(userName),
        license: v.license || null,
      };
    })
    .filter(Boolean);
}
