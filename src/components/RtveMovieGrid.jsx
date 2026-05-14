"use client";

import { Clapperboard } from "lucide-react";
import { MovieCardSkeleton } from "@/components/MovieCard";
import RtveMovieCard from "@/components/RtveMovieCard";

export default function RtveMovieGrid({ movies = [], rtveItems = [], loading }) {
  if (loading) {
    return (
      <div className="movie-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <div className="movie-grid">
      {movies.map((movie, idx) => (
        <RtveMovieCard
          key={movie.id || idx}
          movie={movie}
          rtveData={rtveItems[idx]}
        />
      ))}
    </div>
  );
}
