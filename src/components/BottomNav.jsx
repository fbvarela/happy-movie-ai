"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function BottomNav({ navItems, logo }) {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const bottomItems = navItems.filter((i) => i.bottom).slice(0, 5);

  return (
    <>
      {/* Mobile top bar */}
      <div className="nav-mobile-bar">
        <button className="hamburger-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div className="nav-logo">
          <span>{logo.icon}</span>
          <span>{logo.name}</span>
        </div>
        <div style={{ width: 30 }} />
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav" style={{ display: undefined }}>
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${pathname === item.href ? " active" : ""}`}
          >
            <span className="bottom-nav-item-icon">{item.icon}</span>
            <span>{item.shortLabel || item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Slide-in drawer */}
      {drawerOpen && <div className="nav-drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <div className={`nav-drawer${drawerOpen ? " open" : ""}`}>
        <div className="nav-drawer-header">
          <div className="nav-logo">
            <span>{logo.icon}</span>
            <span>{logo.name}</span>
          </div>
          <button className="nav-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close">✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {navItems.map((item) =>
            item.section ? (
              <div key={item.section} className="drawer-section-label">{item.section}</div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="drawer-item"
                onClick={() => setDrawerOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            className="sidebar-lang-btn"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
          >
            {lang === "en" ? "🇪🇸 Español" : "🇬🇧 English"}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
