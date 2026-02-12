import { useAuth } from "../auth/useAuth";

export function Me() {
  const { user, logout, loading } = useAuth();

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Me</h2>
      <p>You are logged in as: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

