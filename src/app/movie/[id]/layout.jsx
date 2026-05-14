import { posterUrl } from "@/lib/omdb";

// Dynamic SEO metadata for movie pages
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const BASE = "https://www.omdbapi.com";
    const KEY = process.env.OMDB_API_KEY;
    if (!KEY) return { title: "Movie — HappyMovie" };

    const u = new URL(BASE);
    u.searchParams.set("apikey", KEY);
    u.searchParams.set("i", id);
    u.searchParams.set("plot", "short");

    const res = await fetch(u.toString(), { next: { revalidate: 86400 } });
    const data = await res.json();

    if (data.Response === "False") {
      return { title: "Movie — HappyMovie" };
    }

    const title = `${data.Title} (${data.Year}) — HappyMovie`;
    const description = data.Plot !== "N/A"
      ? data.Plot.slice(0, 160)
      : `Watch ${data.Title} (${data.Year}) for free on HappyMovie`;
    const poster = data.Poster !== "N/A" ? data.Poster : null;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(poster && { images: [{ url: poster, width: 300, height: 450 }] }),
        type: "video.movie",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(poster && { images: [poster] }),
      },
    };
  } catch {
    return { title: "Movie — HappyMovie" };
  }
}

export default function MovieLayout({ children }) {
  return children;
}
