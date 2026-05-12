"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import VideoPlayer from "@/components/VideoPlayer";
import QualityBadge from "@/components/QualityBadge";
import SourceBadge from "@/components/SourceBadge";
import { useLanguage } from "@/context/LanguageContext";
import { posterUrl } from "@/lib/tmdb";

export default function WatchPage() {
  const { tmdbId } = useParams();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [sources, setSources] = useState(null);
  const [movie, setMovie] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/sources/${tmdbId}`).then((r) => r.json()),
      fetch(`/api/movies/${tmdbId}`).then((r) => r.json()),
    ])
      .then(([srcData, movieData]) => {
        setSources(srcData);
        setMovie(movieData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tmdbId]);

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

  const available = sources?.sources || [];
  const current = available[selectedIdx];

  if (available.length === 0) {
    return (
      <ClientLayout>
        <div className="page">
          <button className="btn btn-ghost btn-sm mb8" onClick={() => router.back()}>
            <ArrowLeft size={16} style={{ display: "inline", verticalAlign: "middle" }} /> {t("common.back")}
          </button>
          <div className="empty-state">
            <p>{t("sources.none")}</p>
            <button className="btn btn-primary mt16" onClick={() => router.push(`/movie/${tmdbId}`)}>
              {lang === "es" ? "Ver detalles" : "View Details"}
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="watch-page">
        <div className="watch-header">
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
            <ArrowLeft size={16} /> {t("common.back")}
          </button>
          <h1 className="watch-title">{movie?.title}</h1>
        </div>

        <VideoPlayer source={current} />

        <div className="watch-controls">
          <div className="watch-source-info">
            <SourceBadge source={current.source} />
            <QualityBadge
              quality={current.qualityInfo?.quality}
              notes={current.qualityInfo?.notes}
            />
          </div>

          {available.length > 1 && (
            <div className="watch-source-selector">
              <span className="watch-source-label">
                {lang === "es" ? "Fuente" : "Source"} {selectedIdx + 1}/{available.length}
              </span>
              {available.map((s, i) => (
                <button
                  key={`${s.source}-${i}`}
                  className={`btn btn-sm ${i === selectedIdx ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <SourceBadge source={s.source} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>

        {movie && (
          <>
            <button
              className="btn btn-ghost btn-sm mt8"
              onClick={() => setShowInfo(!showInfo)}
            >
              {showInfo
                ? <><ChevronUp size={14} /> {lang === "es" ? "Ocultar info" : "Hide info"}</>
                : <><ChevronDown size={14} /> {lang === "es" ? "Ver info" : "Show info"}</>
              }
            </button>

            {showInfo && (
              <div className="watch-info">
                <div className="watch-info-poster">
                  {movie.poster_path && (
                    <img src={posterUrl(movie.poster_path, "w185")} alt={movie.title} />
                  )}
                </div>
                <div className="watch-info-text">
                  <h2>{movie.title}</h2>
                  {movie.release_date && (
                    <span className="badge">{movie.release_date.slice(0, 4)}</span>
                  )}
                  {movie.runtime && (
                    <span className="badge">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  )}
                  {movie.overview && (
                    <p style={{ marginTop: 8, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {movie.overview}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
}
