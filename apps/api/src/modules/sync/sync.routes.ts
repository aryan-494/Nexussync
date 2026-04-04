import { Router } from "express"
import { pullSyncController } from "./sync.controller"
import { authMiddleware } from "../../middleware/auth.middleware" // ✅ import

const router = Router();

router.get(
  "/pull",
  authMiddleware,
  pullSyncController 
)

export default router