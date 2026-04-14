import { Router } from "express"
import { pullSyncController } from "./sync.controller.js"
import { authMiddleware } from "../../middleware/auth.middleware.js" // ✅ import

const router = Router();

router.get(
  "/pull",
  authMiddleware,
  pullSyncController 
)

export default router