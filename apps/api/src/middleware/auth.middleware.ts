import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { loadConfig } from "../config";
import { HttpError } from "../errors";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const config = loadConfig(); // ✅ MOVE HERE


  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new HttpError( "Authorization header missing" , 401);
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    throw new HttpError( "Invalid authorization format" , 401);
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

    next();
  } catch {
    throw new HttpError( "Invalid or expired token",401);
  }
}


