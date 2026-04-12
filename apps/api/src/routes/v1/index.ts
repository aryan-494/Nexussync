import { Router } from "express";
import { healthHandler } from "./health";
import authRouter from "./auth";
import protectedRouter from "./protected";
import workspaceRouter from "./workspace.routes";
import taskRoutes from "./tasks";
import syncRoutes from "../../modules/sync/sync.routes";
import { apiRateLimiter, syncRateLimiter } from "../../middleware/rateLimiter";

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