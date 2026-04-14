import { Router } from "express";
import { signupController } from "../../modules/users/user.controller.js";
import { loginController } from "../../modules/auth/auth.controller.js";
import { refreshController } from "../../modules/auth/auth.controller.js";
import { logoutController } from "../../modules/auth/auth.controller.js";
const router = Router();

// POST /api/v1/auth/signup
router.post("/signup", signupController);
// POST /api/v1/auth/login
router.post("/login", loginController);
//POST /api/v1/auth/refresh
router.post("/refresh", refreshController);
//POST /api/v1/auth/logout
router.post("/logout", logoutController);


export default router;
