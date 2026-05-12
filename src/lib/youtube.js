const BASE = "https://www.googleapis.com/youtube/v3";
const KEY = process.env.YOUTUBE_API_KEY;

const OFFICIAL_CHANNELS = new Set([
  "YouTube Movies",
  "Timeless Classic Movies",
  "Paramount Vault",
  "FilmRise",
  "Popcornflix",
  "Kings of Horror",
  "Classic Movies Channel",
]);

export async function searchYouTube(title, year) {
  if (!KEY) return [];

  const query = year ? `${title} ${year} full movie` : `${title} full movie`;

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoDuration: "long",
    videoCategoryId: "1",
    maxResults: 10,
    key: KEY,
  });

  const res = await fetch(`${BASE}/search?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.items || [];

  if (items.length === 0) return [];

  const videoIds = items.map((i) => i.id.videoId).join(",");
  const details = await getVideoDetails(videoIds);

  return items
    .map((item) => {
      const detail = details[item.id.videoId];
      if (!detail) return null;

      return {
        source: "youtube",
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        duration: parseISO8601Duration(detail.contentDetails?.duration),
        definition: detail.contentDetails?.definition || "sd",
        isOfficialChannel: OFFICIAL_CHANNELS.has(item.snippet.channelTitle),
        viewCount: parseInt(detail.statistics?.viewCount) || 0,
      };
    })
    .filter(Boolean);
}

async function getVideoDetails(videoIds) {
  const params = new URLSearchParams({
    part: "contentDetails,statistics",
    id: videoIds,
    key: KEY,
  });

  const res = await fetch(`${BASE}/videos?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return {};

  const data = await res.json();
  const map = {};
  for (const item of data.items || []) {
    map[item.id] = item;
  }
  return map;
}

function parseISO8601Duration(iso) {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  return (parseInt(match[1]) || 0) * 3600 +
    (parseInt(match[2]) || 0) * 60 +
    (parseInt(match[3]) || 0);
}
