"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronUp, ChevronDown, Clapperboard } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { useLanguage } from "@/context/LanguageContext";
import { ERAS } from "@/constants/filters";

function readInitialFromURL() {
  if (typeof window === "undefined") {
    return { query: "", filters: { sortBy: "popularity.desc" }, page: 1, showFilters: false };
  }
  const sp = new URLSearchParams(window.location.search);
  const filters = { sortBy: sp.get("sortBy") || "popularity.desc" };
  const rawGenres = sp.get("genres") || sp.get("genre");
  let showFilters = false;
  if (rawGenres) {
    const ids = rawGenres
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
    if (ids.length) {
      filters.genres = ids;
      showFilters = true;
    }
  }
  const voteGte = sp.get("voteGte");
  if (voteGte) filters.voteGte = voteGte;
  const language = sp.get("language");
  if (language) filters.language = language;
  const era = sp.get("era");
  if (era) filters.era = era;
  const pageParam = parseInt(sp.get("page") || "", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  return { query: sp.get("q") || "", filters, page, showFilters };
}

export default function DiscoverPage() {
  const { t } = useLanguage();
  const initial = useState(readInitialFromURL)[0];
  const [query, setQuery] = useState(initial.query);
  const [filters, setFilters] = useState(initial.filters);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(initial.showFilters);

  // Mirror state into the URL so browser-back from a movie detail restores it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (filters.genres?.length) sp.set("genres", filters.genres.join(","));
    if (filters.sortBy && filters.sortBy !== "popularity.desc") sp.set("sortBy", filters.sortBy);
    if (filters.voteGte) sp.set("voteGte", filters.voteGte);
    if (filters.language) sp.set("language", filters.language);
    if (filters.era) sp.set("era", filters.era);
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (next !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", next);
    }
  }, [query, filters, page]);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (query) {
        url = `/api/movies/search?q=${encodeURIComponent(query)}&page=${page}`;
      } else {
        const params = new URLSearchParams({ page });
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        if (filters.voteGte) params.set("voteGte", filters.voteGte);
        if (filters.language) params.set("language", filters.language);
        if (filters.genres?.length) params.set("genres", filters.genres.join(","));

        if (filters.era) {
          const era = ERAS.find((e) => e.id === filters.era);
          if (era?.yearGte) params.set("yearGte", era.yearGte);
          if (era?.yearLte) params.set("yearLte", era.yearLte);
        }

        url = `/api/movies/discover?${params}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 0);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, page]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((f) => {
    setFilters(f);
    setPage(1);
  }, []);

  return (
    <ClientLayout>
      <div className="page">
        <h1 className="page-title">{t("discover.title")}</h1>
        <p className="page-sub">{t("discover.subtitle")}</p>

        <SearchBar onSearch={handleSearch} initialValue={query} />

        {!query && (
          <>
            <button
              className="btn btn-ghost btn-sm mt8 mb8"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <ChevronUp size={14} style={{ display: "inline", verticalAlign: "middle" }} /> : <ChevronDown size={14} style={{ display: "inline", verticalAlign: "middle" }} />}{" "}
              {t("discover.filters") || (showFilters ? "Hide Filters" : "Show Filters")}
            </button>

            {showFilters && (
              <FilterPanel filters={filters} onChange={handleFilterChange} />
            )}
          </>
        )}

        <div className="mt16">
          <MovieGrid movies={movies} loading={loading} />

          {!loading && movies.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><Clapperboard size={48} /></div>
              <p>{t("common.noResults")}</p>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </ClientLayout>
  );
}
