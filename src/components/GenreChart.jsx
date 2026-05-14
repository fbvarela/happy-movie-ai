"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function GenreChart({ distribution }) {
  const { lang } = useLanguage();
  if (!distribution?.length) return null;

  const max = Math.max(...distribution.map((d) => d.count), 1);
  const starLabels = { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" };

  return (
    <div className="stat-chart">
      <h3 className="stat-chart-title">
        {lang === "es" ? "Distribución de puntuaciones" : "Rating Distribution"}
      </h3>
      <div className="bar-chart">
        {distribution.map((d) => (
          <div key={d.stars} className="bar-row">
            <span className="bar-label">{"★".repeat(d.stars)}</span>
            <div className="bar-track">
              <div
                className="bar-fill bar-fill-sun"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <span className="bar-value">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
