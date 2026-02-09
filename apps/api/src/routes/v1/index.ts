import { Router } from "express";
import { healthHandler } from "./health";
import authRouter from "./auth";

export function v1Router() {
  const router = Router();

  router.get("/health", healthHandler);
  router.use("/auth" , authRouter);

  return router;
}
