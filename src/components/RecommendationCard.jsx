"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { posterUrl } from "@/lib/omdb";
import { useLanguage } from "@/context/LanguageContext";

export default function RecommendationCard({ rec }) {
  const { lang } = useLanguage();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const movieId = rec.imdbId || null;

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    fetch(`/api/movies/${movieId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMovie(data))
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [movieId]);

  const poster = movie?.poster_path ? posterUrl(movie.poster_path) : null;

  return (
    <div className="rec-card">
      <div className="rec-card-poster">
        {loading ? (
          <div className="rec-card-loading">
            <Loader2 size={24} className="spin" />
          </div>
        ) : poster ? (
          <img src={poster} alt={rec.title} loading="lazy" />
        ) : (
          <div className="rec-card-no-poster">
            <span style={{ fontSize: "2rem" }}>🎬</span>
          </div>
        )}
      </div>
      <div className="rec-card-info">
        <div className="rec-card-header">
          <h3 className="rec-card-title">{rec.title}</h3>
          {rec.year && <span className="badge">{rec.year}</span>}
        </div>
        <p className="rec-card-reason">{rec.reason}</p>
        {movie && (
          <div className="rec-card-meta">
            {movie.vote_average > 0 && (
              <span className="badge badge-sun">
                {movie.vote_average.toFixed(1)}
              </span>
            )}
            {movie.genres?.slice(0, 3).map((g) => (
              <span key={g.id} className="badge badge-ghost">{g.name}</span>
            ))}
          </div>
        )}
        <div className="rec-card-actions">
          {movieId ? (
            <Link href={`/movie/${movieId}`} className="btn btn-primary btn-sm">
              {lang === "es" ? "Ver detalles" : "View Details"}
            </Link>
          ) : (
            <a
              href={`https://www.imdb.com/find/?q=${encodeURIComponent(rec.title + " " + (rec.year || ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              {lang === "es" ? "Buscar en IMDb" : "Find on IMDb"} <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
