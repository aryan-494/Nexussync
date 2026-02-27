import type { Request, Response, NextFunction } from "express";
import { loginUser, refreshAccessToken } from "./auth.service";
import { setAuthCookies, clearAuthCookies } from "./auth.cookies";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./auth.types";
import { validateDTO } from "../../utils/validate";
import { LoginDTO } from "./auth.dto";
import { HttpError } from "../../errors";

/**
 * POST /api/v1/auth/login
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = validateDTO(LoginDTO, req.body);

    const result = await loginUser(body.email, body.password);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.json({
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      return res.status(401).json({
        error: "Refresh token missing",
      });
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    // Re-set cookies (reuse helper to avoid duplication)
    setAuthCookies(res, newAccessToken, refreshToken);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logoutController(
  _req: Request,
  res: Response
) {
  clearAuthCookies(res);
  res.status(204).end();
}

