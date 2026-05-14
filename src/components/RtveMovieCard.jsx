"use client";

import { useState } from "react";
import Link from "next/link";
import { Clapperboard, ExternalLink, Globe, Clock, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function RtveMovieCard({ movie, rtveData }) {
  const { lang } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const year = movie.release_date?.slice(0, 4);
  const poster = movie.poster_path;
  const geoRestricted = movie._geoRestricted;
  const director = rtveData?.director;
  const duration = rtveData?.durationMin;
  const description = rtveData?.shortDescription;
  const watchUrl = movie._watchUrl || rtveData?.watchUrl;

  // If the movie has an IMDb id, link to our detail page; otherwise to RTVE
  const hasImdb = movie.id && !String(movie.id).startsWith("rtve-");
  const href = hasImdb ? `/movie/${movie.id}` : watchUrl;
  const isExternal = !hasImdb;

  const card = (
    <div className="movie-card rtve-movie-card" aria-label={`${movie.title}${year ? ` (${year})` : ""}`}>
      <div className="movie-card-poster">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-card-no-poster">
            <Clapperboard size={48} />
          </div>
        )}

        {/* RTVE badge */}
        <span className="rtve-card-badge">RTVE</span>

        {/* Duration */}
        {duration > 0 && (
          <span className="movie-card-rating">
            <Clock size={12} /> {duration} min
          </span>
        )}

        {/* Geo indicator */}
        {geoRestricted && (
          <span className="rtve-geo-badge" title={lang === "es" ? "Disponible en España" : "Available in Spain"}>
            <Globe size={12} /> ES
          </span>
        )}
      </div>

      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="rtve-card-meta">
          {year && <span className="movie-card-year">{year}</span>}
          {director && <span className="rtve-director">{director}</span>}
        </div>
        {description && (
          <p className="rtve-card-desc">{description}</p>
        )}
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rtve-card-link"
      >
        {card}
      </a>
    );
  }

  return (
    <Link href={href} className="rtve-card-link">
      {card}
    </Link>
  );
}
