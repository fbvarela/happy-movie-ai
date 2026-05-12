"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Pagination({ page, totalPages, onPageChange }) {
  const { lang } = useLanguage();
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn btn-ghost btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} /> {lang === "es" ? "Anterior" : "Previous"}
      </button>
      <span className="pagination-info">
        {page} / {Math.min(totalPages, 500)}
      </span>
      <button
        className="btn btn-ghost btn-sm"
        disabled={page >= totalPages || page >= 500}
        onClick={() => onPageChange(page + 1)}
      >
        {lang === "es" ? "Siguiente" : "Next"} <ChevronRight size={16} />
      </button>
    </div>
  );
}
