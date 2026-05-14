"use client";

import {
  Smile, Brain, Moon, Swords, Heart, Laugh,
  Ghost, Rocket, Film, Globe,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const MOODS = [
  { id: "feel-good", icon: <Smile size={18} />, en: "Feel-Good", es: "Alegre", prompt: "Recommend feel-good, uplifting movies that leave you smiling" },
  { id: "mind-bending", icon: <Brain size={18} />, en: "Mind-Bending", es: "Mente", prompt: "Recommend mind-bending, thought-provoking movies with twists and deep themes" },
  { id: "classic-noir", icon: <Moon size={18} />, en: "Film Noir", es: "Cine Noir", prompt: "Recommend classic film noir movies with dark themes, shadows, and mystery" },
  { id: "action", icon: <Swords size={18} />, en: "Action", es: "Accion", prompt: "Recommend exciting classic action and adventure movies" },
  { id: "romance", icon: <Heart size={18} />, en: "Romance", es: "Romance", prompt: "Recommend classic romantic movies and love stories" },
  { id: "comedy", icon: <Laugh size={18} />, en: "Comedy", es: "Comedia", prompt: "Recommend funny classic comedies that are genuinely hilarious" },
  { id: "horror", icon: <Ghost size={18} />, en: "Horror", es: "Terror", prompt: "Recommend scary classic horror movies" },
  { id: "sci-fi", icon: <Rocket size={18} />, en: "Sci-Fi", es: "Ciencia Ficcion", prompt: "Recommend classic science fiction movies" },
  { id: "documentary", icon: <Film size={18} />, en: "Documentary", es: "Documental", prompt: "Recommend fascinating documentaries available for free" },
  { id: "world-cinema", icon: <Globe size={18} />, en: "World Cinema", es: "Cine Mundial", prompt: "Recommend great international films from outside Hollywood" },
];

export default function MoodSelector({ onSelect, disabled }) {
  const { lang } = useLanguage();

  return (
    <div className="mood-selector">
      {MOODS.map((mood) => (
        <button
          key={mood.id}
          className="mood-chip"
          onClick={() => onSelect(mood.prompt)}
          disabled={disabled}
        >
          <span className="mood-chip-icon">{mood.icon}</span>
          <span>{lang === "es" ? mood.es : mood.en}</span>
        </button>
      ))}
    </div>
  );
}
