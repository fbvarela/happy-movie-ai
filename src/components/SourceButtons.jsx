"use client";

import { useState, useEffect } from "react";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import QualityBadge from "@/components/QualityBadge";
import SourceBadge from "@/components/SourceBadge";
import { getExternalLinks } from "@/lib/external-sources";

export default function SourceButtons({ tmdbId, movieTitle }) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sources/${tmdbId}`)
      .then((r) => r.json())
      .then((data) => setSources(data))
      .catch(() => setSources(null))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  const externalLinks = movieTitle ? getExternalLinks(movieTitle) : [];

  if (loading) {
    return (
      <div className="source-buttons">
        <div className="source-loading">
          <Loader2 size={18} className="spin" /> {t("sources.checking")}
        </div>
      </div>
    );
  }

  const embeddable = sources?.sources?.filter(
    (s) => s.source === "internet-archive" || s.source === "youtube"
  ) || [];
  const best = embeddable[0];
  const hasAnySources = embeddable.length > 0 || externalLinks.length > 0;

  if (!hasAnySources) {
    return (
      <div className="source-buttons">
        <p className="source-none">{t("sources.none")}</p>
      </div>
    );
  }

  return (
    <div className="source-buttons">
      {best && (
        <button
          className="btn btn-primary source-btn-main"
          onClick={() => router.push(`/watch/${tmdbId}`)}
        >
          <Play size={18} /> {t("sources.watchNow")}
          <QualityBadge quality={best.qualityInfo?.quality} size="sm" />
        </button>
      )}

      <div className="source-btn-list">
        {embeddable.map((s, i) => (
          <div key={`${s.source}-${i}`} className="source-btn-item">
            <SourceBadge source={s.source} />
            <QualityBadge
              quality={s.qualityInfo?.quality}
              notes={s.qualityInfo?.notes}
              size="sm"
            />
            {s.source === "youtube" && (
              <a href={s.watchUrl} target="_blank" rel="noopener noreferrer" className="source-external-link">
                <ExternalLink size={14} />
              </a>
            )}
            {s.source === "internet-archive" && (
              <a href={s.detailUrl} target="_blank" rel="noopener noreferrer" className="source-external-link">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ))}

        {externalLinks.length > 0 && (
          <>
            {embeddable.length > 0 && (
              <div className="source-divider">
                <span>{lang === "es" ? "También disponible en" : "Also try on"}</span>
              </div>
            )}
            {externalLinks.map((link) => (
              <a
                key={link.source}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-btn-item source-btn-external"
              >
                <SourceBadge source={link.source} />
                <span className="source-opens-tab">
                  {lang === "es" ? "Abre en nueva pestaña" : "Opens in new tab"}
                </span>
                <ExternalLink size={14} className="source-external-link" />
              </a>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
