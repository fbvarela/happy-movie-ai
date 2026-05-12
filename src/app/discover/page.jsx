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

export default function DiscoverPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ sortBy: "popularity.desc" });
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

        <SearchBar onSearch={handleSearch} />

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
