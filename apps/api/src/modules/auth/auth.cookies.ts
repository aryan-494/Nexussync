import type { Response } from "express";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./auth.types";

// Options used when setting cookies
type CookieOptions = {
  httpOnly: boolean;     // Cookie can't be accessed by JavaScript (more secure)
  secure: boolean;       // Cookie only sent over HTTPS (not HTTP)
  sameSite: "lax" | "strict" | "none"; // Prevents CSRF attacks
  path: string;          // Which routes can access this cookie ("/" means all routes)
  maxAge: number;        // How long the cookie lasts (in milliseconds)
};

/**
 * Set authentication cookies after login / refresh
 */
export function setAuthCookies(
  res: Response,          // Response object to send cookies back
  accessToken: string,    // Short-lived token (like a day pass)
  refreshToken: string    // Long-lived token (like a monthly pass)
) {
  // Check if we're in production (live server) or development (localhost)
  const isProd = process.env.NODE_ENV === "production";

  // Base options shared by both cookies
  const baseOptions: Omit<CookieOptions, "maxAge"> = {
    httpOnly: true,     // Very important! Prevents JS access (XSS protection)
    secure: isProd,     // HTTPS only in production
    sameSite: "lax",    // Good balance of security + usability
    path: "/",          // Cookie available on all routes
  };

  // Access token cookie (short-lived)
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie (long-lived)
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear authentication cookies on logout
 * IMPORTANT: cookies must be cleared with the SAME options
 * they were created with (path, sameSite, secure)
 */
export function clearAuthCookies(res: Response) {
  const isProd = process.env.NODE_ENV === "production";

  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  // Remove access token cookie
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseOptions);

  // Remove refresh token cookie
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseOptions);
}
