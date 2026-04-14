import { Router } from "express";
import { healthHandler } from "./health.js";
import authRouter from "./auth.js";
import protectedRouter from "./protected.js";
import workspaceRouter from "./workspace.routes.js";
import taskRoutes from "./tasks.js";
import syncRoutes from "../../modules/sync/sync.routes.js";
import { apiRateLimiter, syncRateLimiter } from "../../middleware/rateLimiter.js";

export function v1Router() {
  const router = Router();

  // ✅ Apply global rate limiter FIRST
  router.use(apiRateLimiter);

  // Health (public)
  router.get("/health", healthHandler);

  // Auth routes
  router.use("/auth", authRouter);

  // Protected
  router.use("/protected", protectedRouter);

  // Workspace routes
  router.use("/workspaces", workspaceRouter);

  // Tasks
  router.use("/tasks", taskRoutes);

  // ✅ Sync (stricter limiter)
  router.use("/sync", syncRateLimiter, syncRoutes);

  return router;
}