import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
} from "../api/auth.api";

import type { AppError } from "../api/http";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {

    async function verifySession() {

      try {

        const data = await getMe();
        setUser(data);

      } catch (err) {

        const error = err as AppError;

        // Handle auth errors explicitly
        if (
          error.code === "AUTH_UNAUTHORIZED" ||
          error.code === "AUTH_SESSION_EXPIRED"
        ) {
          setUser(null);
        } else {
          console.error("Auth verification error:", error);
        }

      } finally {
        setLoading(false);
      }
    }

    verifySession();

  }, []);

  async function login(email: string, password: string) {

    try {

      await apiLogin(email, password);

      const userData = await getMe();
      setUser(userData);

    } catch (err) {

      const error = err as AppError;

      console.error("Login error:", error);

      throw error;
    }
  }

  async function logout() {

    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
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