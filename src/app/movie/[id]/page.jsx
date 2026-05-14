"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clapperboard, Star } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import CastList from "@/components/CastList";
import RelatedMovies from "@/components/RelatedMovies";
import SourceButtons from "@/components/SourceButtons";
import WatchlistButton from "@/components/WatchlistButton";
import MarkWatchedButton from "@/components/MarkWatchedButton";
import { useLanguage } from "@/context/LanguageContext";
import { posterUrl, backdropUrl } from "@/lib/omdb";
import { TMDB_GENRE_MAP } from "@/constants/filters";

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/movies/${id}`)
      .then((r) => r.json())
      .then((data) => setMovie(data))
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="page">
          <div className="empty-state">
            <p>{t("common.loading")}</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!movie || movie.success === false) {
    return (
      <ClientLayout>
        <div className="page">
          <div className="empty-state">
            <div className="empty-icon"><Clapperboard size={48} /></div>
            <p>{t("common.noResults")}</p>
            <button className="btn btn-primary mt16" onClick={() => router.push("/discover")}>
              {t("common.back")}
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const year = movie.release_date?.slice(0, 4);
  const hours = Math.floor((movie.runtime || 0) / 60);
  const mins = (movie.runtime || 0) % 60;
  const runtime = movie.runtime ? `${hours}h ${mins}m` : null;
  const rating = movie.vote_average?.toFixed(1);
  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const cast = movie.credits?.cast || [];
  const related = movie.recommendations?.results || [];
  const genres = (movie.genres || []).map((g) => g.name);

  return (
    <ClientLayout>
      {/* Backdrop */}
      {movie.backdrop_path && (
        <div
          className="movie-backdrop"
          style={{ backgroundImage: `url(${backdropUrl(movie.backdrop_path)})` }}
        >
          <div className="movie-backdrop-overlay" />
        </div>
      )}

      <div className="page">
        <button className="btn btn-ghost btn-sm mb8" onClick={() => router.back()}>
          <ArrowLeft size={16} style={{ display: "inline", verticalAlign: "middle" }} /> {t("common.back")}
        </button>

        <div className="movie-detail-header">
          <div className="movie-detail-poster">
            {movie.poster_path ? (
              <img src={posterUrl(movie.poster_path, "w500")} alt={movie.title} />
            ) : (
              <div className="movie-card-no-poster" style={{ height: 450 }}><Clapperboard size={48} /></div>
            )}
          </div>

          <div className="movie-detail-info">
            <h1 className="page-title">{movie.title}</h1>

            {movie.tagline && (
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", marginBottom: 12 }}>
                {movie.tagline}
              </p>
            )}

            <div className="flex gap8" style={{ flexWrap: "wrap", flexDirection: "row", marginBottom: 16 }}>
              {year && <span className="badge">{year}</span>}
              {runtime && <span className="badge">{runtime}</span>}
              {rating > 0 && <span className="badge badge-sun"><Star size={14} fill="var(--sun)" stroke="var(--sun)" /> {rating}</span>}
              {genres.map((g) => (
                <span key={g} className="badge badge-leaf">{g}</span>
              ))}
            </div>

            {director && (
              <p style={{ marginBottom: 8 }}>
                <strong>{lang === "es" ? "Director" : "Director"}:</strong> {director.name}
              </p>
            )}

            <div className="movie-detail-actions">
              <WatchlistButton tmdbId={parseInt(id)} title={movie.title} posterPath={movie.poster_path} />
              <MarkWatchedButton tmdbId={parseInt(id)} title={movie.title} posterPath={movie.poster_path} />
            </div>

            <SourceButtons tmdbId={id} movieTitle={movie.title} />

            {movie.overview && (
              <div style={{ marginTop: 12 }}>
                <h3 className="card-title">{lang === "es" ? "Sinopsis" : "Synopsis"}</h3>
                <p style={{ lineHeight: 1.7, color: "var(--text-muted)" }}>{movie.overview}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mt16">
            <h2 className="card-title">{lang === "es" ? "Reparto" : "Cast"}</h2>
            <CastList cast={cast} />
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt16">
            <h2 className="card-title">{lang === "es" ? "Películas similares" : "More Like This"}</h2>
            <RelatedMovies movies={related} />
          </div>
        )}

        {/* TMDB attribution */}
        <div className="tmdb-attribution mt16">
          <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" height="14" />
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
        </div>
      </div>
    </ClientLayout>
  );
}
