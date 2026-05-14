"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function TimelineChart({ months }) {
  const { lang } = useLanguage();
  if (!months?.length) return null;

  const max = Math.max(...months.map((m) => m.count), 1);

  return (
    <div className="stat-chart">
      <h3 className="stat-chart-title">
        {lang === "es" ? "Actividad mensual" : "Monthly Activity"}
      </h3>
      <div className="timeline-chart">
        {months.map((m) => (
          <div key={m.month} className="timeline-bar-col">
            <div className="timeline-bar-wrapper">
              <div
                className="timeline-bar"
                style={{ height: `${Math.max((m.count / max) * 100, 4)}%` }}
              >
                {m.count > 0 && (
                  <span className="timeline-bar-count">{m.count}</span>
                )}
              </div>
            </div>
            <span className="timeline-label">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
