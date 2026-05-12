"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
