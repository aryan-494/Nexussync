import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { loadConfig } from "../config";
import { HttpError } from "../errors";
import { ACCESS_TOKEN_COOKIE } from "../modules/auth/auth.types";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const config = loadConfig();

  // 1️⃣ Read access token from HttpOnly cookie
  let token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  // 2️⃣ Temporary fallback for Authorization header (DEV ONLY)
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace(/^Bearer\s+/i, "").trim();
  }

  if (!token) {
    throw new HttpError(
      "Authentication required",
      401,
      "AUTH_UNAUTHORIZED"
    );
  }

  try {
    const payload = jwt.verify(
      token,
      config.auth.jwtSecret
    ) as jwt.JwtPayload;

    req.auth = {
      userId: payload.sub as string,
      email: payload.email as string,
    };

    // ✅ Phase-4 requirement
    req.context.user = {
      id: payload.sub as string,
      email: payload.email as string,
    };

    next();

  } catch (err: any) {

    if (err?.name === "TokenExpiredError") {
      throw new HttpError(
        "Session expired",
        401,
        "AUTH_SESSION_EXPIRED"
      );
    }

    throw new HttpError(
      "Invalid authentication token",
      401,
      "AUTH_INVALID_TOKEN"
    );
  }
}