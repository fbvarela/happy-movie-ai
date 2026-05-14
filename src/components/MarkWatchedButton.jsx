"use client";

import { useState } from "react";
import { Eye, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import RatingStars from "@/components/RatingStars";

export default function MarkWatchedButton({ tmdbId, title, posterPath }) {
  const { user } = useAuth();
  const router = useRouter();
  const { lang } = useLanguage();
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMark = async (selectedRating) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, title, posterPath, rating: selectedRating || null }),
      });
      setSaved(true);
      setRating(selectedRating);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="mark-watched-done">
        <CheckCircle size={18} style={{ color: "var(--leaf)" }} />
        <span>{lang === "es" ? "Marcada como vista" : "Marked as watched"}</span>
        {rating > 0 && <RatingStars value={rating} size={16} readOnly />}
      </div>
    );
  }

  if (showRating) {
    return (
      <div className="mark-watched-rating">
        <span className="mark-watched-label">
          {lang === "es" ? "Tu valoración:" : "Your rating:"}
        </span>
        <RatingStars value={rating} onChange={(r) => { setRating(r); handleMark(r); }} />
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => handleMark(0)}
          disabled={loading}
        >
          {lang === "es" ? "Sin nota" : "Skip"}
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-ghost mark-watched-btn"
      onClick={() => setShowRating(true)}
      disabled={loading}
    >
      <Eye size={18} />
      {lang === "es" ? "Marcar como vista" : "Mark as watched"}
    </button>
  );
}
