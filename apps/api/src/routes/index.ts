import { Router } from "express";
import { v1Router } from "./v1";

export function apiRouter() {
  const router = Router();

  router.use("/v1", v1Router());

  return router;
}
