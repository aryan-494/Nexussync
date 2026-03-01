import { useState } from "react";
import { register } from "../api/auth.api";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Register() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/me" replace />;
  }

  if (done) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await register(email, password);
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button>Register</button>

      {error && <p>{error}</p>}
    </form>
  );
}