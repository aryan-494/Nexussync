import type { Response } from "express";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./auth.types";

type CookieOptions = {
  httpOnly: boolean;     // Cookie can't be accessed by JavaScript (more secure)
  secure: boolean;       // Cookie only sent over HTTPS (not HTTP)
  sameSite: "lax" | "strict" | "none"; // Prevents certain attacks
  path: string;          // Which routes can access this cookie ("/" means all routes)
  maxAge: number;        // How long the cookie lasts (in milliseconds)
};

export function setAuthCookies(
  res: Response,          // Response object to send cookies back
  accessToken: string,    // Short-lived token (like a day pass)
  refreshToken: string    // Long-lived token (like a monthly pass)
) {
  // Check if we're in production (live server) or development (localhost)
  const isProd = process.env.NODE_ENV === "production";

    const baseOptions: Omit<CookieOptions, "maxAge"> = {
    httpOnly: true,     // Very important! Prevents hackers from stealing tokens
    secure: isProd,     // HTTPS only in production, HTTP okay in development
    sameSite: "lax",    // Good balance of security and usability
    path: "/",          // Available on all routes of your website
  };
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes × 60 seconds × 1000 milliseconds
  });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// when log out 
export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE);
  res.clearCookie(REFRESH_TOKEN_COOKIE);
}