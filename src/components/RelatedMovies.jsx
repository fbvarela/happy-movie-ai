"use client";

import MovieCard from "./MovieCard";

export default function RelatedMovies({ movies }) {
  if (!movies?.length) return null;

  const visible = movies.slice(0, 6);

  return (
    <div className="movie-grid">
      {visible.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
