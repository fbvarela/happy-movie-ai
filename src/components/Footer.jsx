"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <p>
          {lang === "es"
            ? "HappyMovie no aloja contenido de video. Los videos provienen de fuentes legales de terceros."
            : "HappyMovie does not host video content. Videos are from legal third-party sources."}
        </p>
        <p>
          {lang === "es" ? "Datos de peliculas por" : "Movie data by"}{" "}
          <a href="https://www.omdbapi.com/" target="_blank" rel="noopener noreferrer">OMDb API</a>
          {" · "}
          <a href="https://archive.org" target="_blank" rel="noopener noreferrer">Internet Archive</a>
          {" · "}
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
        </p>
      </div>
    </footer>
  );
}
