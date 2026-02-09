import { Router } from "express";
import { healthHandler } from "./health";
import authRouter from "./auth";
import protectedRouter from "./protected";

export function v1Router() {
  const router = Router();

  router.get("/health", healthHandler);
  router.use("/auth" , authRouter);
  router.use("/protected", protectedRouter);

  return router;
}
