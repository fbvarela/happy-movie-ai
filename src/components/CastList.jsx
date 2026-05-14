"use client";

import { posterUrl } from "@/lib/omdb";

export default function CastList({ cast }) {
  if (!cast?.length) return null;

  const visible = cast.slice(0, 20);

  return (
    <div className="cast-list">
      {visible.map((person) => (
        <div key={person.credit_id || person.id} className="cast-item">
          <div className="cast-photo">
            {person.profile_path ? (
              <img
                src={posterUrl(person.profile_path, "w185")}
                alt={person.name}
                loading="lazy"
              />
            ) : (
              <span className="cast-photo-placeholder">👤</span>
            )}
          </div>
          <div className="cast-name">{person.name}</div>
          <div className="cast-role">{person.character}</div>
        </div>
      ))}
    </div>
  );
}
