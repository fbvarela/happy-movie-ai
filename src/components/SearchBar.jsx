"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SearchBar({ onSearch, initialValue = "" }) {
  const [value, setValue] = useState(initialValue);
  const { t } = useLanguage();
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 350);
    return () => clearTimeout(timerRef.current);
  }, [value, onSearch]);

  return (
    <div className="search-bar">
      <span className="search-bar-icon"><Search size={18} /></span>
      <input
        type="text"
        className="input search-bar-input"
        placeholder={t("discover.searchPlaceholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          className="search-bar-clear"
          onClick={() => setValue("")}
          aria-label="Clear"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
