"use client";

import { useParams } from "next/navigation";
import { AuthView } from "@neondatabase/auth/react";
import ClientLayout from "@/components/ClientLayout";

export default function AuthPage() {
  const { path } = useParams();

  return (
    <ClientLayout>
      <div className="page" style={{ maxWidth: 480, margin: "0 auto" }}>
        <AuthView path={path} />
      </div>
    </ClientLayout>
  );
}
