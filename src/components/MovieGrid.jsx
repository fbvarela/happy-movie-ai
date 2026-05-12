"use client";

import MovieCard, { MovieCardSkeleton } from "./MovieCard";

export default function MovieGrid({ movies, loading }) {
  if (loading) {
    return (
      <div className="movie-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!movies?.length) {
    return null;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
