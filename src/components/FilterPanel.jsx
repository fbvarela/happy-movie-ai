"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ERAS, LANGUAGES, SORT_OPTIONS, RATING_OPTIONS, TMDB_GENRE_MAP } from "@/constants/filters";

const GENRE_ENTRIES = Object.entries(TMDB_GENRE_MAP);

export default function FilterPanel({ filters, onChange }) {
  const { lang } = useLanguage();
  const isEs = lang === "es";

  const set = (key, val) => onChange({ ...filters, [key]: val });

  const toggleGenre = (id) => {
    const current = filters.genres || [];
    const next = current.includes(id)
      ? current.filter((g) => g !== id)
      : [...current, id];
    set("genres", next);
  };

  return (
    <div className="filter-panel">
      {/* Genre chips */}
      <div className="filter-section">
        <label className="input-label">{isEs ? "Género" : "Genre"}</label>
        <div className="filter-chips">
          {GENRE_ENTRIES.map(([id, name]) => (
            <button
              key={id}
              className={`filter-chip${(filters.genres || []).includes(Number(id)) ? " active" : ""}`}
              onClick={() => toggleGenre(Number(id))}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Era / type */}
      <div className="filter-section">
        <label className="input-label">{isEs ? "Época" : "Era"}</label>
        <div className="filter-chips">
          {ERAS.map((era) => (
            <button
              key={era.id}
              className={`filter-chip${filters.era === era.id ? " active" : ""}`}
              onClick={() => set("era", filters.era === era.id ? null : era.id)}
            >
              {isEs ? era.labelEs : era.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + rating + language row */}
      <div className="filter-row">
        <div className="field" style={{ flex: 1 }}>
          <label className="input-label">{isEs ? "Ordenar" : "Sort"}</label>
          <select
            className="input"
            value={filters.sortBy || "popularity.desc"}
            onChange={(e) => set("sortBy", e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {isEs ? o.labelEs : o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ flex: 1 }}>
          <label className="input-label">{isEs ? "Puntuación" : "Rating"}</label>
          <select
            className="input"
            value={filters.voteGte || ""}
            onChange={(e) => set("voteGte", e.target.value)}
          >
            {RATING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {isEs ? o.labelEs : o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ flex: 1 }}>
          <label className="input-label">{isEs ? "Idioma" : "Language"}</label>
          <select
            className="input"
            value={filters.language || ""}
            onChange={(e) => set("language", e.target.value)}
          >
            <option value="">{isEs ? "Todos" : "All"}</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {isEs ? l.labelEs : l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters(filters) && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange({ sortBy: "popularity.desc" })}
        >
          {isEs ? "Limpiar filtros" : "Clear filters"}
        </button>
      )}
    </div>
  );
}

function hasActiveFilters(f) {
  return (
    (f.genres && f.genres.length > 0) ||
    f.era ||
    f.voteGte ||
    f.language ||
    (f.sortBy && f.sortBy !== "popularity.desc")
  );
}
