import type { Request, Response, NextFunction } from "express";
import { loginUser } from "./auth.service";
import { setAuthCookies } from "./auth.cookies";
import { clearAuthCookies } from "./auth.cookies";
import { refreshAccessToken } from "./auth.service";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./auth.types";

/**
 * POST /api/v1/auth/login
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    // Basic presence validation (NOT business logic)
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);

     setAuthCookies(res, result.accessToken, result.refreshToken);
       res.json({
    user: result.user,
  });
  } catch (error) {
    next(error);
  }
}


export async function refreshController(
  req: Request,
  res: Response
) {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!refreshToken) {
    return res.status(401).json({
      error: "Refresh token missing",
    });
  }

  const newAccessToken = await refreshAccessToken(refreshToken);

  // Re-set access token cookie
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(ACCESS_TOKEN_COOKIE, newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.status(204).end();
}


// logout 
export async function logoutController(
  _req: Request,
  res: Response
) {
  clearAuthCookies(res);
  res.status(204).end();
}
