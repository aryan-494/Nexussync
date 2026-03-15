import { Router } from "express"
import { pullSyncController } from "./sync.controller"

const router = Router()

router.get("/pull", pullSyncController)

export default router