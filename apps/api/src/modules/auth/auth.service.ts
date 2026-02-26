import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { loadConfig } from "../../config";
import { findUserByEmail } from "../users/user.repository";
import { HttpError } from "../../errors";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    status: "ACTIVE" | "DISABLED";
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const config = loadConfig();

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new HttpError(
      "Invalid credentials",
      401,
      "AUTH_INVALID_CREDENTIALS"
    );
  }

  if (user.status !== "ACTIVE") {
    throw new HttpError(
      "User account is disabled",
      403,
      "AUTH_UNAUTHORIZED"
    );
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new HttpError(
      "Invalid credentials",
      401,
      "AUTH_INVALID_CREDENTIALS"
    );
  }

  const userId = user._id.toString();

  const accessToken = jwt.sign(
    {
      sub: userId,
      email: user.email,
    },
    config.auth.jwtSecret,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      sub: userId,
    },
    config.auth.jwtSecret,
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: userId,
      email: user.email,
      status: user.status,
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const config = loadConfig();

  let payload: jwt.JwtPayload;

  try {
    payload = jwt.verify(
      refreshToken,
      config.auth.jwtSecret
    ) as jwt.JwtPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new HttpError(
        "Session expired",
        401,
        "AUTH_SESSION_EXPIRED"
      );
    }

    throw new HttpError(
      "Invalid refresh token",
      401,
      "AUTH_INVALID_TOKEN"
    );
  }

  if (!payload.sub) {
    throw new HttpError(
      "Invalid refresh token payload",
      401,
      "AUTH_INVALID_TOKEN"
    );
  }

  const newAccessToken = jwt.sign(
    {
      sub: payload.sub,
    },
    config.auth.jwtSecret,
    { expiresIn: "15m" }
  );

  return newAccessToken;
}