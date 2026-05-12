const BASE = "https://archive.org";

export async function searchIA(title, year) {
  const yearRange = year ? `date:[${year - 1} TO ${year + 1}]` : "";
  const q = `title:(${title}) ${yearRange} mediatype:movies`;

  const params = new URLSearchParams({
    q,
    fl: "identifier,title,year,description,runtime,downloads",
    rows: 10,
    output: "json",
  });

  const res = await fetch(`${BASE}/advancedsearch.php?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const docs = data.response?.docs || [];

  const results = await Promise.all(
    docs.slice(0, 5).map((doc) => getIAMetadata(doc.identifier))
  );

  return results.filter(Boolean);
}

async function getIAMetadata(identifier) {
  const res = await fetch(`${BASE}/metadata/${identifier}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const metadata = data.metadata || {};
  const files = data.files || [];

  const videoFile = files
    .filter((f) => /\.(mp4|ogv|avi|mkv|webm)$/i.test(f.name))
    .sort((a, b) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0))[0];

  if (!videoFile) return null;

  const hasAudio = files.some(
    (f) => f.format?.toLowerCase().includes("audio") || /\.(mp3|ogg|flac)$/i.test(f.name)
  );

  return {
    source: "internet-archive",
    identifier,
    title: metadata.title || identifier,
    year: parseInt(metadata.year) || null,
    embedUrl: `${BASE}/embed/${identifier}`,
    detailUrl: `${BASE}/details/${identifier}`,
    videoUrl: `${BASE}/download/${identifier}/${videoFile.name}`,
    resolution: {
      width: parseInt(videoFile.width) || null,
      height: parseInt(videoFile.height) || null,
    },
    duration: parseDuration(videoFile.length || metadata.runtime),
    fileSize: parseInt(videoFile.size) || null,
    hasAudio: hasAudio || videoFile.format?.toLowerCase().includes("mpeg4"),
  };
}

function parseDuration(val) {
  if (!val) return null;
  if (typeof val === "number") return val;
  const str = String(val);
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseFloat(str) || null;
}
