"use client";

import { useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";

const MIN_CARD = 160;
const GAP = 16;
const MAX_ROWS = 2;

export default function RelatedMovies({ movies }) {
  const ref = useRef(null);
  const [cols, setCols] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const update = (width) => {
      const next = Math.max(1, Math.floor((width + GAP) / (MIN_CARD + GAP)));
      setCols(next);
    };
    update(ref.current.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) update(entry.contentRect.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  if (!movies?.length) return null;

  const limit = cols > 0
    ? Math.min(movies.length - (movies.length % cols), cols * MAX_ROWS)
    : movies.length;
  const visible = movies.slice(0, limit || cols || movies.length);

  return (
    <div className="movie-grid" ref={ref}>
      {visible.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
