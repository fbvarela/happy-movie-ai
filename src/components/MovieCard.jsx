"use client";

import Link from "next/link";
import { Clapperboard, Star } from "lucide-react";
import { posterUrl } from "@/lib/omdb";
import { TMDB_GENRE_MAP } from "@/constants/filters";
import WatchlistButton from "@/components/WatchlistButton";

export default function MovieCard({ movie }) {
  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const genres = (movie.genre_ids || [])
    .slice(0, 2)
    .map((id) => TMDB_GENRE_MAP[id])
    .filter(Boolean);

  return (
    <Link href={`/movie/${movie.id}`} className="movie-card">
      <div className="movie-card-poster">
        {movie.poster_path ? (
          <img
            src={posterUrl(movie.poster_path, "w342")}
            alt={movie.title}
            loading="lazy"
          />
        ) : (
          <div className="movie-card-no-poster"><Clapperboard size={48} /></div>
        )}
        {rating && rating > 0 && (
          <span className="movie-card-rating"><Star size={14} fill="var(--sun)" stroke="var(--sun)" /> {rating}</span>
        )}
        <WatchlistButton
          tmdbId={movie.id}
          title={movie.title}
          posterPath={movie.poster_path}
          size="sm"
        />
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        {year && <span className="movie-card-year">{year}</span>}
        {genres.length > 0 && (
          <div className="movie-card-genres">
            {genres.map((g) => (
              <span key={g} className="badge badge-sm">{g}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="movie-card movie-card--skeleton">
      <div className="movie-card-poster skeleton-pulse" />
      <div className="movie-card-info">
        <div className="skeleton-line skeleton-pulse" style={{ width: "80%" }} />
        <div className="skeleton-line skeleton-pulse" style={{ width: "40%" }} />
      </div>
    </div>
  );
}
