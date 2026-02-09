import { Router } from "express";
import { signupController } from "../../modules/users/user.controller";
import { loginController } from "../../modules/auth/auth.controller";

const router = Router();

// POST /api/v1/auth/signup
router.post("/signup", signupController);

// POST /api/v1/auth/login
router.post("/login", loginController);

export default router;
