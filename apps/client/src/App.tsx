import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import Login from "./pages/login";
import Register from "./pages/Register";
import Me from "./pages/Me";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Routes>

            <Route path="/" element={<Navigate to="/me" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/me"
              element={
                <ProtectedRoute>
                  <Me />
                </ProtectedRoute>
              }
            />

          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;