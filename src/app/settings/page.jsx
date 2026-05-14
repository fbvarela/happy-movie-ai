"use client";

import { useRouter } from "next/navigation";
import { Settings, User, LogOut, Palette, Globe, LogIn } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <ClientLayout>
        <div className="page">
          <div className="empty-state">
            <LogIn size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
            <p>{t("auth.loginRequired")}</p>
            <button className="btn btn-primary mt8" onClick={() => router.push("/login")}>
              {t("auth.signIn")}
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="page">
        <h1 className="page-title">
          <Settings size={24} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
          {t("settings.title")}
        </h1>
        <p className="page-sub">{t("settings.subtitle")}</p>

        <div className="settings-sections">
          {/* Account */}
          <div className="settings-card">
            <div className="settings-card-header">
              <User size={18} />
              <h3>{lang === "es" ? "Cuenta" : "Account"}</h3>
            </div>
            <div className="settings-row">
              <span className="settings-label">{lang === "es" ? "Email" : "Email"}</span>
              <span className="settings-value">{user.email}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">{lang === "es" ? "Nombre" : "Name"}</span>
              <span className="settings-value">{user.name || "—"}</span>
            </div>
            <button
              className="btn btn-ghost btn-sm mt8"
              style={{ color: "var(--clay)" }}
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
            >
              <LogOut size={16} /> {t("auth.signOut")}
            </button>
          </div>

          {/* Appearance */}
          <div className="settings-card">
            <div className="settings-card-header">
              <Palette size={18} />
              <h3>{lang === "es" ? "Apariencia" : "Appearance"}</h3>
            </div>
            <div className="settings-row">
              <span className="settings-label">{lang === "es" ? "Tema" : "Theme"}</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Language */}
          <div className="settings-card">
            <div className="settings-card-header">
              <Globe size={18} />
              <h3>{lang === "es" ? "Idioma" : "Language"}</h3>
            </div>
            <div className="settings-row">
              <button
                className={`btn btn-sm ${lang === "en" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setLang("en")}
              >
                English
              </button>
              <button
                className={`btn btn-sm ${lang === "es" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setLang("es")}
              >
                Espanol
              </button>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="settings-legal mt16">
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            {lang === "es"
              ? "HappyMovie es una aplicacion de descubrimiento de peliculas. No alojamos ningun contenido de video. Todos los videos se reproducen desde fuentes legales de terceros (Internet Archive, YouTube). Los datos de peliculas son proporcionados por OMDb API."
              : "HappyMovie is a movie discovery application. We do not host any video content. All videos are streamed from legal third-party sources (Internet Archive, YouTube). Movie data provided by OMDb API."}
          </p>
        </div>
      </div>
    </ClientLayout>
  );
}
