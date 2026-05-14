"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
        textAlign: "center",
        fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
        background: "var(--bg, #f5f0e8)",
        color: "var(--text, #2a1f14)",
      }}
    >
      <WifiOff size={64} style={{ color: "var(--text-muted, #7a6854)", marginBottom: 24 }} />
      <h1
        style={{
          fontFamily: "var(--font-serif, 'Fraunces', serif)",
          fontSize: "1.8rem",
          marginBottom: 8,
        }}
      >
        You're Offline
      </h1>
      <p style={{ color: "var(--text-muted, #7a6854)", maxWidth: 400, lineHeight: 1.6 }}>
        HappyMovie needs an internet connection to search movies and stream content.
        Check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 24,
          padding: "10px 24px",
          borderRadius: 24,
          border: "none",
          background: "var(--leaf, #4a7c59)",
          color: "#fff",
          fontSize: "0.95rem",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <RefreshCw size={16} /> Retry
      </button>
    </div>
  );
}
