import type { Express } from "express";
import type { AppConfig } from "./config";

export function startServer(app: Express , config: AppConfig) {


  const server = app.listen(config.port, () => {
    console.log(`[api] running on http://localhost:${config.port}`);
  });

  return server;
}
