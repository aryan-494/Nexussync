import { Router } from "express";
import { healthHandler } from "./health";

export function v1Router() {
  const router = Router();

  router.get("/health", healthHandler);

  return router;
}
