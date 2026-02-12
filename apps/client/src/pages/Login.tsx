import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { Navigate } from "react-router-dom";

export function Login() {
  const { login, status, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (status === "authenticated") {
    return <Navigate to="/me" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

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

      <button disabled={loading}>Login</button>

      {error && <p>{error}</p>}
    </form>
  );
}
