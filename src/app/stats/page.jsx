"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Film, Clock, Star, TrendingUp, Loader2, LogIn } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import TimelineChart from "@/components/TimelineChart";
import GenreChart from "@/components/GenreChart";
import MovieGrid from "@/components/MovieGrid";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function StatsPage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <ClientLayout>
        <div className="page">
          <div className="empty-state"><Loader2 size={24} className="spin" /></div>
        </div>
      </ClientLayout>
    );
  }

  if (!user) {
    return (
      <ClientLayout>
        <div className="page">
          <div className="empty-state">
            <LogIn size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
            <p>{t("auth.loginRequired")}</p>
            <button className="btn btn-primary mt8" onClick={() => router.push("/login")}>
              {t("auth.signIn")}
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="page">
        <h1 className="page-title">
          <BarChart3 size={24} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
          {t("stats.title")}
        </h1>
        <p className="page-sub">{t("stats.subtitle")}</p>

        {/* Stat blocks */}
        <div className="stat-blocks">
          <div className="stat-block">
            <div className="stat-block-icon stat-block-leaf"><Film size={20} /></div>
            <div className="stat-block-value">{stats?.totalWatched || 0}</div>
            <div className="stat-block-label">{t("stats.moviesWatched")}</div>
          </div>
          <div className="stat-block">
            <div className="stat-block-icon stat-block-sun"><Clock size={20} /></div>
            <div className="stat-block-value">{stats?.estimatedHours || 0}h</div>
            <div className="stat-block-label">{t("stats.hoursSpent")}</div>
          </div>
          <div className="stat-block">
            <div className="stat-block-icon stat-block-clay"><Star size={20} /></div>
            <div className="stat-block-value">
              {stats?.avgRating ? stats.avgRating.toFixed(1) : "—"}
            </div>
            <div className="stat-block-label">{t("stats.avgRating")}</div>
          </div>
          <div className="stat-block">
            <div className="stat-block-icon stat-block-bark"><TrendingUp size={20} /></div>
            <div className="stat-block-value">
              {stats?.months?.reduce((sum, m) => sum + m.count, 0) || 0}
            </div>
            <div className="stat-block-label">
              {lang === "es" ? "Este ano" : "This Year"}
            </div>
          </div>
        </div>

        {/* Charts */}
        {stats && (
          <div className="stat-charts">
            <TimelineChart months={stats.months} />
            <GenreChart distribution={stats.ratingDistribution} />
          </div>
        )}

        {/* Recently watched */}
        {stats?.recent?.length > 0 && (
          <div className="mt16">
            <h2 className="card-title">
              {lang === "es" ? "Visto recientemente" : "Recently Watched"}
            </h2>
            <MovieGrid
              movies={stats.recent.map((r) => ({
                id: r.tmdb_id,
                title: r.title,
                poster_path: r.poster_path,
                vote_average: r.rating || 0,
                release_date: null,
                genre_ids: [],
              }))}
              loading={false}
            />
          </div>
        )}

        {stats?.totalWatched === 0 && (
          <div className="empty-state mt16">
            <Film size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
            <p>{lang === "es" ? "Aun no has visto ninguna pelicula" : "You haven't watched any movies yet"}</p>
            <button className="btn btn-primary mt8" onClick={() => router.push("/discover")}>
              {lang === "es" ? "Descubrir peliculas" : "Discover Movies"}
            </button>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
