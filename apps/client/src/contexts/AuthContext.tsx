// What AuthContext Must Guarantee

// 1️⃣ On app load → check if session exists
// 2️⃣ Maintain loading while checking
// 3️⃣ Store user if authenticated
// 4️⃣ Provide logout()
// 5️⃣ Expose isAuthenticated
// 6️⃣ Never assume login without server verification


// src/contexts/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getMe, logout as apiLogout } from "../api/auth.api";
import type { AppError } from "../api/http";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 On mount → verify session
  useEffect(() => {
    async function verifySession() {
      try {
        const data = await getMe();
        setUser(data);
      } catch (error) {
        const err = error as AppError;

        if (
          err.code === "AUTH_UNAUTHORIZED" ||
          err.code === "AUTH_SESSION_EXPIRED"
        ) {
          setUser(null);
        } else {
          console.error("Unexpected auth error:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // even if logout fails, clear state
    } finally {
      setUser(null);
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

