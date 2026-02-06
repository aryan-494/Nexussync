import express from "express";
import { contextMiddleware } from "./context";

export function createApp() {
  const app = express();

  // Attach request context early
  app.use(contextMiddleware);

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      requestId: req.context?.requestId,
    });
  });

  return app;
}

