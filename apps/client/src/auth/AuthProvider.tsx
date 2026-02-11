import React, { createContext } from "react";
import type { AuthState } from "./auth.types";

/**
 * What the auth system exposes to the app
 * (functions will be added later)
 */
export type AuthContextValue = AuthState;

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

/**
 * Provider skeleton
 * Logic will be added in Step-3
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextValue = {
    status: "unknown",
    user: null,
    loading: true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
