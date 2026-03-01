// src/routes/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  // 🧠 Wait until auth check completes
  if (loading) {
    return <div>Loading...</div>;
  }

  // 🔐 Not authenticated → redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated
  return <>{children}</>;
}