"use client";

import SidebarNav from "@/components/SidebarNav";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  Clapperboard, Home, Compass, Heart, Bot,
  Library, Star, BarChart3, Settings, LogIn, Tv,
} from "lucide-react";

const LOGO = { icon: <Clapperboard size={24} />, name: "HappyMovie", sub: "AI Movie Companion" };

export default function ClientLayout({ children }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const NAV_ITEMS = [
    { href: "/", icon: <Home size={20} />, label: t("nav.home"), shortLabel: t("nav.home"), bottom: true },
    { href: "/discover", icon: <Compass size={20} />, label: t("nav.discover"), shortLabel: t("nav.discover"), bottom: true },
    { href: "/watchlist", icon: <Heart size={20} />, label: t("nav.watchlist"), shortLabel: t("nav.watchlist"), bottom: true },
    { href: "/recommend", icon: <Bot size={20} />, label: t("nav.recommend"), shortLabel: t("nav.ai"), bottom: true },
    { section: t("nav.library") },
    { href: "/rtve", icon: <Tv size={20} />, label: t("nav.rtve") },
    { href: "/collections", icon: <Library size={20} />, label: t("nav.collections") },
    { href: "/reviews", icon: <Star size={20} />, label: t("nav.reviews") },
    { href: "/stats", icon: <BarChart3 size={20} />, label: t("nav.stats") },
    { section: t("nav.settings") },
    ...(user
      ? [{ href: "/settings", icon: <Settings size={20} />, label: t("nav.settings") }]
      : [{ href: "/login", icon: <LogIn size={20} />, label: t("auth.signIn") }]
    ),
  ];

  return (
    <>
      <SidebarNav navItems={NAV_ITEMS} logo={LOGO} />
      <BottomNav navItems={NAV_ITEMS} logo={LOGO} />
      <main className="app">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Footer />
      </main>
    </>
  );
}
