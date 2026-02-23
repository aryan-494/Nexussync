import { Router } from "express";
import { healthHandler } from "./health";
import authRouter from "./auth";
import protectedRouter from "./protected";
import workspaceRouter from "./workspace.routes";
  import taskRoutes from "./tasks";

export function v1Router() {
  const router = Router();

  // Health (public)
  router.get("/health", healthHandler);

  // Auth routes (public)
  router.use("/auth", authRouter);

  // Protected (auth only, no workspace)
  router.use("/protected", protectedRouter);

  // Workspace-scoped routes (auth + workspace context inside)
  router.use("/workspaces", workspaceRouter);



router.use("/tasks", taskRoutes);

  return router;
}

