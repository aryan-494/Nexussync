import type { Request, Response, NextFunction } from "express";
import { loginUser } from "./auth.service";
import { setAuthCookies } from "./auth.cookies";

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
