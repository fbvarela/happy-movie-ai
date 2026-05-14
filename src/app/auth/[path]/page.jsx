"use client";

import { useParams } from "next/navigation";
import { AuthView } from "@neondatabase/auth/react";
import ClientLayout from "@/components/ClientLayout";

export default function AuthPage() {
  const { path } = useParams();

  return (
    <ClientLayout>
      <div className="auth-page">
        <AuthView path={path} />
      </div>
    </ClientLayout>
  );
}
