"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Flame, Sword, Laugh, Ghost, Rocket, Drama, Film, Tv } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import MovieGrid from "@/components/MovieGrid";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/context/LanguageContext";

const QUICK_GENRES = [
  { id: 28, icon: <Sword size={18} />, label: "Action", labelEs: "Acción" },
  { id: 35, icon: <Laugh size={18} />, label: "Comedy", labelEs: "Comedia" },
  { id: 27, icon: <Ghost size={18} />, label: "Horror", labelEs: "Terror" },
  { id: 878, icon: <Rocket size={18} />, label: "Sci-Fi", labelEs: "Ciencia ficción" },
  { id: 18, icon: <Drama size={18} />, label: "Drama", labelEs: "Drama" },
  { id: 99, icon: <Film size={18} />, label: "Documentary", labelEs: "Documental" },
];

export default function HomePage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/movies/trending")
      .then((r) => r.json())
      .then((data) => setTrending((data.results || []).slice(0, 12)))
      .catch(() => setTrending([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((q) => {
    if (q) router.push(`/discover?q=${encodeURIComponent(q)}`);
  }, [router]);

  return (
    <ClientLayout>
      <div className="page">
        <h1 className="page-title">{t("home.title")}</h1>
        <p className="page-sub">{t("home.subtitle")}</p>

        <SearchBar onSearch={handleSearch} />

        {/* Quick genre links */}
        <div className="genre-quick-links mt16">
          {QUICK_GENRES.map((g) => (
            <button
              key={g.id}
              className="genre-link"
              onClick={() => router.push(`/discover?genre=${g.id}`)}
            >
              <span className="genre-link-icon">{g.icon}</span>
              <span>{lang === "es" ? g.labelEs : g.label}</span>
            </button>
          ))}
        </div>

        {/* RTVE Spanish Cinema featured section */}
        <div className="rtve-home-banner mt16" onClick={() => router.push("/rtve")}>
          <div className="rtve-home-banner-content">
            <Tv size={24} />
            <div>
              <strong>{lang === "es" ? "Cine Español Gratis" : "Free Spanish Cinema"}</strong>
              <span>
                {lang === "es"
                  ? "Descubre películas españolas en RTVE Play"
                  : "Discover Spanish movies on RTVE Play"}
              </span>
            </div>
          </div>
          <span className="rtve-home-badge">RTVE</span>
        </div>

        {/* Trending */}
        <div className="mt16">
          <h2 className="card-title"><Flame size={20} style={{ display: "inline", verticalAlign: "middle", color: "var(--clay)" }} /> {t("home.trending")}</h2>
          <MovieGrid movies={trending} loading={loading} />
        </div>
      </div>
    </ClientLayout>
  );
}
