

const API_BASE_URL = "http://localhost:3000/api/v1";

/**
 * Shared helper for all auth requests
 * - Always sends cookies
 * - Always parses JSON
 * - Throws clean errors
 */


//Makes authenticated JSON requests to API base URL with cookie-based auth.
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include", // 🔒 critical for cookie-based auth
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const error = await response.json();
      message = error.message ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json();
}

export function register(email: string, password: string) {
  return request<void>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
export function login(email: string, password: string) {
  return request<void>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<void>("/auth/logout", {
    method: "POST",
  });
}


export function refresh() {
  return request<void>("/auth/refresh", {
    method: "POST",
  });
}


export function getMe() {
  return request<{ id: string; email: string }>("/protected/me", {
    method: "GET",
  });
}
