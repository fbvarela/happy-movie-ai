"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SidebarNav({ navItems, logo }) {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-logo">
        <span>{logo.icon}</span>
        <div>
          <div>{logo.name}</div>
          {logo.sub && (
            <div style={{ fontSize: "0.7rem", fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>
              {logo.sub}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-items">
        {navItems.map((item) =>
          item.section ? (
            <div key={item.section} className="sidebar-section">{item.section}</div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`sideitem${pathname === item.href ? " active" : ""}`}
            >
              <span className="sideitem-icon">{item.icon}</span>
              <span className="sideitem-label">{item.label}</span>
            </Link>
          )
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-row">
          <button
            className="sidebar-lang-btn"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
          >
            {lang === "en" ? "🇪🇸 ES" : "🇬🇧 EN"}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
