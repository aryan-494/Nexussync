import React, { createContext, useEffect, useState } from "react";
import type { AuthState, AuthUser } from "./auth.types";
import { getMe, refresh } from "../api/auth";

export type AuthContextValue = AuthState;

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

const initialState: AuthState = {
  status: "unknown",
  user: null,
  loading: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      try {
        // 1️⃣ Try current session
        const user: AuthUser = await getMe();

        if (cancelled) return;

        setState({
          status: "authenticated",
          user,
          loading: false,
        });
      } catch {
        // 2️⃣ If access token failed, try refresh
        try {
          await refresh();

          const user: AuthUser = await getMe();

          if (cancelled) return;

          setState({
            status: "authenticated",
            user,
            loading: false,
          });
        } catch {
          // 3️⃣ Refresh failed → logged out
          if (cancelled) return;

          setState({
            status: "unauthenticated",
            user: null,
            loading: false,
          });
        }
      }
    }

    resolveSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
