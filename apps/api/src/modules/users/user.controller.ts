

// A controller is the translator and it is not alowed to decide rules or toich db 

import type { Request, Response, NextFunction } from "express";
import { signupUser } from "./user.service";

export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    // Basic presence check (NOT business rules)
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await signupUser(email, password);

    // Never expose passwordHash
    return res.status(201).json({
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
}
 