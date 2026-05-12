"use client";

import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/context/LanguageContext";
import {
  Clapperboard, Home, Compass, ClipboardList, Bot,
  Library, Star, BarChart3, Settings,
} from "lucide-react";

const LOGO = { icon: <Clapperboard size={24} />, name: "HappyMovie", sub: "AI Movie Companion" };

export default function ClientLayout({ children }) {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: "/", icon: <Home size={20} />, label: t("nav.home"), shortLabel: t("nav.home"), bottom: true },
    { href: "/discover", icon: <Compass size={20} />, label: t("nav.discover"), shortLabel: t("nav.discover"), bottom: true },
    { href: "/watchlist", icon: <ClipboardList size={20} />, label: t("nav.watchlist"), shortLabel: t("nav.watchlist"), bottom: true },
    { href: "/recommend", icon: <Bot size={20} />, label: t("nav.recommend"), shortLabel: t("nav.ai"), bottom: true },
    { section: t("nav.library") },
    { href: "/collections", icon: <Library size={20} />, label: t("nav.collections") },
    { href: "/reviews", icon: <Star size={20} />, label: t("nav.reviews") },
    { href: "/stats", icon: <BarChart3 size={20} />, label: t("nav.stats") },
    { section: t("nav.settings") },
    { href: "/settings", icon: <Settings size={20} />, label: t("nav.settings") },
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
