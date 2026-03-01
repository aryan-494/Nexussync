import { useAuth } from "../contexts/AuthContext";

export function Me() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h2>Me</h2>
      <p>You are logged in as: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}