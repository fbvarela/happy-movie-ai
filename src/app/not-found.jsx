"use client";

import { useRouter } from "next/navigation";
import { Clapperboard, Home } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";

export default function NotFound() {
  const router = useRouter();

  return (
    <ClientLayout>
      <div className="page">
        <div className="empty-state" style={{ minHeight: "50vh" }}>
          <Clapperboard size={64} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: 8 }}>
            404
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            This page doesn't exist. Maybe the movie was never made?
          </p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            <Home size={16} /> Go Home
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}
