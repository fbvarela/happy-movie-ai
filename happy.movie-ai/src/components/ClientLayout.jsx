"use client";

import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/context/LanguageContext";

const LOGO = { icon: "🎬", name: "HappyMovie", sub: "AI Movie Companion" };

export default function ClientLayout({ children }) {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: "/", icon: "🏠", label: t("nav.home"), shortLabel: t("nav.home"), bottom: true },
    { href: "/discover", icon: "🔍", label: t("nav.discover"), shortLabel: t("nav.discover"), bottom: true },
    { href: "/watchlist", icon: "📋", label: t("nav.watchlist"), shortLabel: t("nav.watchlist"), bottom: true },
    { href: "/recommend", icon: "🤖", label: t("nav.recommend"), shortLabel: t("nav.ai"), bottom: true },
    { section: t("nav.library") },
    { href: "/collections", icon: "📚", label: t("nav.collections") },
    { href: "/reviews", icon: "⭐", label: t("nav.reviews") },
    { href: "/stats", icon: "📊", label: t("nav.stats") },
    { section: t("nav.settings") },
    { href: "/settings", icon: "⚙️", label: t("nav.settings") },
  ];

  return (
    <>
      <SidebarNav navItems={NAV_ITEMS} logo={LOGO} />
      <BottomNav navItems={NAV_ITEMS} logo={LOGO} />
      <main className="app">
        {children}
      </main>
    </>
  );
}
