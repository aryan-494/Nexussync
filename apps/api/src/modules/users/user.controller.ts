

// A controller is the translator and it is not alowed to decide rules or toich db 

import type { Request, Response, NextFunction } from "express";
import { signupUser } from "./user.service.js";
import { SignupDTO } from "../auth/auth.dto.js";   
import { validateDTO } from "../../utils/validate.js";

export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = validateDTO(SignupDTO, req.body);

    const user = await signupUser(body.email, body.password);

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