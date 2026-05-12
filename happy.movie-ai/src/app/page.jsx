"use client";

import ClientLayout from "@/components/ClientLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <ClientLayout>
      <div className="page">
        <h1 className="page-title">{t("home.title")}</h1>
        <p className="page-sub">{t("home.subtitle")}</p>

        <div className="grid2">
          <div className="card">
            <h3 className="card-title">🔥 {t("home.trending")}</h3>
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <p>{t("common.loading")}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">🤖 {t("home.recommended")}</h3>
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <p>{t("common.loading")}</p>
            </div>
          </div>
        </div>

        <div className="mt16">
          <div className="card">
            <h3 className="card-title">🕐 {t("home.recentlyWatched")}</h3>
            <div className="empty-state">
              <div className="empty-icon">🍿</div>
              <p>{t("watchlist.empty")}</p>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
