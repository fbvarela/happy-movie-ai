"use client";

import { useState, useEffect } from "react";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import QualityBadge from "@/components/QualityBadge";
import SourceBadge from "@/components/SourceBadge";

export default function SourceButtons({ tmdbId }) {
  const { t } = useLanguage();
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

  if (loading) {
    return (
      <div className="source-buttons">
        <div className="source-loading">
          <Loader2 size={18} className="spin" /> {t("sources.checking")}
        </div>
      </div>
    );
  }

  if (!sources || sources.sources?.length === 0) {
    return (
      <div className="source-buttons">
        <p className="source-none">{t("sources.none")}</p>
      </div>
    );
  }

  const embeddable = sources.sources.filter(
    (s) => s.source === "internet-archive" || s.source === "youtube"
  );
  const best = embeddable[0];

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
              <a
                href={s.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="source-external-link"
              >
                <ExternalLink size={14} />
              </a>
            )}
            {s.source === "internet-archive" && (
              <a
                href={s.detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="source-external-link"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
