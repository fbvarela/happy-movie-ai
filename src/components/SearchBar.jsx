"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SearchBar({ onSearch, initialValue = "", placeholder }) {
  const [value, setValue] = useState(initialValue);
  const { t } = useLanguage();
  const timerRef = useRef(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Don't fire onSearch on mount — the parent already knows the initial
    // value (and re-running it would clobber URL-seeded page/filter state).
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
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
        placeholder={placeholder || t("discover.searchPlaceholder")}
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
