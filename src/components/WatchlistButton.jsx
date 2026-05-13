"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function WatchlistButton({ tmdbId, title, posterPath, size = "default" }) {
  const { user } = useAuth();
  const router = useRouter();
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.items || []).some((i) => i.tmdb_id === tmdbId);
        setInList(found);
      })
      .catch(() => {});
  }, [user, tmdbId]);

  const toggle = useCallback(async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setInList((prev) => !prev);

    try {
      if (inList) {
        await fetch("/api/watchlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId }),
        });
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId, title, posterPath }),
        });
      }
    } catch {
      setInList((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }, [user, inList, tmdbId, title, posterPath, router]);

  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      className={`watchlist-btn${inList ? " active" : ""}${size === "sm" ? " watchlist-btn--sm" : ""}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={loading}
      aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
      title={inList ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Heart
        size={iconSize}
        fill={inList ? "var(--clay)" : "none"}
        stroke={inList ? "var(--clay)" : "currentColor"}
      />
    </button>
  );
}
