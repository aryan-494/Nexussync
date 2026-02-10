import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { loadConfig } from "../../config";
import { findUserByEmail } from "../users/user.repository";
import { HttpError } from "../../errors";

export interface LoginResult {
  accessToken: string;
  refreshToken:string;
  user: {
    id: string;
    email: string;
    status: string;
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const config = loadConfig();
  

  // 1️⃣ Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 2️⃣ Find user
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new HttpError("Invalid credentials", 401);
  }

  // 3️⃣ Check user status
  if (user.status !== "active") {
    throw new HttpError("User account is disabled", 403);
  }

  // 4️⃣ Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new HttpError("Invalid credentials", 401);
  }

  // 5️⃣ Generate JWT
const accessToken = jwt.sign(
  { sub: user.id, email: user.email },
  config.auth.jwtSecret,
  { expiresIn: "15m" }
);

const refreshToken = jwt.sign(
  { sub: user.id },
  config.auth.jwtSecret,
  { expiresIn: "7d" }
);

  // 6️⃣ Return result
  return {
  accessToken,
  refreshToken,
  user: {
    id: user.id,
    email: user.email,
    status: user.status,
  },
};

}

export async function refreshAccessToken(refreshToken : string ){
  const config = loadConfig();

  let payload : jwt.JwtPayload;

  try{
    payload = jwt.verify(
      refreshToken,
      config.auth.jwtSecret
    ) as jwt.JwtPayload;
  } catch{
    throw new HttpError("Invalid refresh token " ,401 );
  }

  if(!payload.sub){
      throw new HttpError("Invalid refresh token payload", 401);
  }

  // Issue new access token 
  const newAccessToken = jwt.sign(
    //sub = the unique identifier of the entity the token represents
    {
      sub:payload.sub,
    },
    config.auth.jwtSecret,
    {
      expiresIn:"15m",
    }
  );
  return newAccessToken;
}
