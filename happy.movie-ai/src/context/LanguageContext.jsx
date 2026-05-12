"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

const translations = { en, es };
const LanguageContext = createContext(null);

function resolve(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function interpolate(str, vars) {
  if (!vars || typeof str !== "string") return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("hf-locale");
    if (stored === "en" || stored === "es") setLangState(stored);
  }, []);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem("hf-locale", l); } catch {}
  }, []);

  const t = useCallback((key, vars) => {
    const val = resolve(translations[lang], key) ?? resolve(translations.en, key) ?? key;
    return interpolate(val, vars);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
