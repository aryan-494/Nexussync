import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import WorkspaceListPage from "./pages/WorkspaceListPage";

import {Login} from "./pages/login";
import {Register} from "./pages/Register";
import {Me} from "./pages/Me";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>

            {/* Default route */}
            <Route path="/" element={<Navigate to="/workspaces" replace />} />
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected route */}
            <Route
              path="/me"
              element={
                <ProtectedRoute>
                  <Me />
                </ProtectedRoute>
              }
            />
            <Route
            path="/workspaces"
            element={
                <ProtectedRoute>
                   <WorkspaceListPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;