"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import MovieGrid from "@/components/MovieGrid";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function WatchlistPage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const removeItem = async (tmdbId) => {
    setItems((prev) => prev.filter((i) => i.tmdb_id !== tmdbId));
    try {
      await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId }),
      });
    } catch {
      // Re-fetch on error
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setItems(data.items || []);
    }
  };

  const movies = items.map((item) => ({
    id: item.tmdb_id,
    title: item.title,
    poster_path: item.poster_path,
  }));

  return (
    <ClientLayout>
      <div className="page">
        <h1 className="page-title">{t("watchlist.title")}</h1>
        <p className="page-sub">{t("watchlist.subtitle")}</p>

        {!user && !authLoading && (
          <div className="empty-state">
            <Heart size={48} style={{ color: "var(--text-muted)" }} />
            <p>{t("auth.loginRequired")}</p>
            <button className="btn btn-primary mt16" onClick={() => router.push("/login")}>
              {t("auth.signIn")}
            </button>
          </div>
        )}

        {user && loading && (
          <MovieGrid movies={[]} loading={true} />
        )}

        {user && !loading && items.length === 0 && (
          <div className="empty-state">
            <Heart size={48} style={{ color: "var(--text-muted)" }} />
            <p>{t("watchlist.empty")}</p>
            <button className="btn btn-primary mt16" onClick={() => router.push("/discover")}>
              {lang === "es" ? "Descubrir películas" : "Discover Movies"}
            </button>
          </div>
        )}

        {user && !loading && items.length > 0 && (
          <div className="watchlist-grid">
            {items.map((item) => (
              <div key={item.tmdb_id} className="watchlist-item">
                <a href={`/movie/${item.tmdb_id}`} className="movie-card" style={{ display: "block" }}>
                  <div className="movie-card-poster">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="movie-card-no-poster" style={{ height: 200 }}>
                        <Heart size={32} />
                      </div>
                    )}
                  </div>
                  <div className="movie-card-info">
                    <h3 className="movie-card-title">{item.title || "Untitled"}</h3>
                  </div>
                </a>
                <button
                  className="watchlist-remove-btn"
                  onClick={() => removeItem(item.tmdb_id)}
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
