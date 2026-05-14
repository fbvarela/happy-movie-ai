"use client";

import Link from "next/link";
import { Library, Star } from "lucide-react";
import { posterUrl } from "@/lib/omdb";
import { useLanguage } from "@/context/LanguageContext";

export default function CollectionCard({ collection }) {
  const { lang } = useLanguage();
  const posters = (collection.cover_posters || []).filter(Boolean).slice(0, 4);
  const count = parseInt(collection.movie_count) || 0;

  return (
    <Link href={`/collections/${collection.id}`} className="collection-card">
      <div className="collection-card-cover">
        {posters.length > 0 ? (
          <div className={`collection-mosaic mosaic-${Math.min(posters.length, 4)}`}>
            {posters.map((p, i) => (
              <img key={i} src={posterUrl(p)} alt="" loading="lazy" />
            ))}
          </div>
        ) : (
          <div className="collection-card-empty">
            <Library size={32} />
          </div>
        )}
        {collection.is_curated && (
          <span className="collection-curated-badge">
            <Star size={12} /> {lang === "es" ? "Curada" : "Curated"}
          </span>
        )}
      </div>
      <div className="collection-card-info">
        <h3 className="collection-card-name">{collection.name}</h3>
        <p className="collection-card-count">
          {count} {count === 1 ? (lang === "es" ? "película" : "movie") : (lang === "es" ? "películas" : "movies")}
        </p>
      </div>
    </Link>
  );
}
