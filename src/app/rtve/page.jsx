"use client";

import { useState, useCallback, useEffect } from "react";
import { Tv, Globe, ChevronDown, ChevronUp, Clapperboard } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import SearchBar from "@/components/SearchBar";
import RtveMovieGrid from "@/components/RtveMovieGrid";
import Pagination from "@/components/Pagination";
import { useLanguage } from "@/context/LanguageContext";
import { RTVE_PROGRAMS } from "@/constants/rtve";

export default function RtvePage() {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [movies, setMovies] = useState([]);
  const [rtveItems, setRtveItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPrograms, setShowPrograms] = useState(false);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (query) params.set("q", query);
      if (programFilter) params.set("program", programFilter);

      const res = await fetch(`/api/rtve?${params}`);
      const data = await res.json();

      setMovies(data.results || []);
      setRtveItems(data.rtveItems || []);
      setTotalPages(data.total_pages || 0);
    } catch {
      setMovies([]);
      setRtveItems([]);
    } finally {
      setLoading(false);
    }
  }, [query, programFilter, page]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    setProgramFilter("");
    setPage(1);
  }, []);

  const handleProgramSelect = useCallback((pid) => {
    setProgramFilter(pid === programFilter ? "" : pid);
    setQuery("");
    setPage(1);
  }, [programFilter]);

  return (
    <ClientLayout>
      <div className="page">
        <div className="rtve-header">
          <h1 className="page-title">
            <Tv size={24} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
            {lang === "es" ? "Cine Español" : "Spanish Cinema"}
          </h1>
          <p className="page-sub">
            {lang === "es"
              ? "Películas españolas gratis en RTVE Play — la televisión pública de España"
              : "Free Spanish movies on RTVE Play — Spain's public broadcaster"}
          </p>
          <div className="rtve-badge">
            <Globe size={14} />
            <span>
              {lang === "es"
                ? "Contenido legal y gratuito de RTVE.es"
                : "Legal & free content from RTVE.es"}
            </span>
          </div>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder={
            lang === "es"
              ? "Buscar películas españolas, directores..."
              : "Search Spanish movies, directors..."
          }
        />

        {/* Program filter chips */}
        <button
          className="btn btn-ghost btn-sm mt8 mb8"
          onClick={() => setShowPrograms(!showPrograms)}
        >
          {showPrograms ? (
            <ChevronUp size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          ) : (
            <ChevronDown size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          )}{" "}
          {lang === "es" ? "Programas" : "Programs"}
        </button>

        {showPrograms && (
          <div className="rtve-program-chips">
            {RTVE_PROGRAMS.map((p) => (
              <button
                key={p.id}
                className={`badge badge-lg ${programFilter === p.id ? "badge-active" : ""}`}
                onClick={() => handleProgramSelect(p.id)}
              >
                {lang === "es" ? p.nameEs : p.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt16">
          <RtveMovieGrid
            movies={movies}
            rtveItems={rtveItems}
            loading={loading}
          />

          {!loading && movies.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Clapperboard size={48} />
              </div>
              <p>
                {lang === "es"
                  ? "No se encontraron películas"
                  : "No movies found"}
              </p>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </ClientLayout>
  );
}
