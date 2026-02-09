import { Router } from "express";

import { signupController } from "../../modules/users/user.controller";

const router = Router();

// POST /api/v1/auth/signup
router.post("/signup" , signupController);

export default router;