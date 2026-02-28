import React, { createContext, useEffect, useState } from "react";
import type { AuthState, AuthUser } from "./auth.types";
import { getMe, refresh, login as loginApi, logout as logoutApi } from "../api/auth.api";

export type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

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

  /* -----------------------------
     Session resolution (Step-3)
  ------------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      try {
        const user: AuthUser = await getMe();
        if (cancelled) return;

        setState({
          status: "authenticated",
          user,
          loading: false,
        });
      } catch {
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

  /* -----------------------------
     Auth actions (Step-4)
  ------------------------------ */

  async function login(email: string, password: string) {
    setState((s) => ({ ...s, loading: true }));

    // 1️⃣ Ask backend to start session
    await loginApi(email, password);

    // 2️⃣ Backend now owns cookies → re-ask identity
    const user: AuthUser = await getMe();

    setState({
      status: "authenticated",
      user,
      loading: false,
    });
  }

  async function logout() {
    setState((s) => ({ ...s, loading: true }));

    try {
      await logoutApi();
    } finally {
      // Always clear state (logout is idempotent)
      setState({
        status: "unauthenticated",
        user: null,
        loading: false,
      });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
