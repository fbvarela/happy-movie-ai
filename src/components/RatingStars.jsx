"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({ value = 0, onChange, size = 20, readOnly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="rating-star"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            fill={(hover || value) >= star ? "var(--sun)" : "none"}
            stroke={(hover || value) >= star ? "var(--sun)" : "var(--text-muted)"}
          />
        </button>
      ))}
    </div>
  );
}
