// src/api/auth.api.ts

import { http } from "./http";

/**
 * Auth API Layer
 * Only responsible for endpoint mapping.
 * No transport logic.
 * No error parsing.
 * No credentials logic.
 */

/**
 * Register a new user
 */
export function register(email: string, password: string) {
  return http.post<void>("/auth/signup", {
    email,
    password,
  });
}

/**
 * Login user
 */
export function login(email: string, password: string) {
  return http.post<void>("/auth/login", {
    email,
    password,
  });
}

/**
 * Logout user
 */
export function logout() {
  return http.post<void>("/auth/logout");
}

/**
 * Refresh session (if using refresh token flow)
 */
export function refresh() {
  return http.post<void>("/auth/refresh");
}

/**
 * Get current authenticated user
 */
export function getMe() {
  return http.get<{
    id: string;
    email: string;
  }>("/protected/me");
}