"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setSession(data ?? null);
      setLoading(false);
    }).catch(() => {
      setSession(null);
      setLoading(false);
    });
  }, []);

  const user = session?.user ?? null;

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
