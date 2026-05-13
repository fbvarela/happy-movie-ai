"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NeonAuthUIProvider authClient={authClient}>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </NeonAuthUIProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
