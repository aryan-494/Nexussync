import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "You are authenticated",
      auth: req.auth,
    });
  }
);

export default router;
