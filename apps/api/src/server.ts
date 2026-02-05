import type { Express } from "express";

export function startServer(app: Express) {
  const PORT = process.env.PORT ?? 3000;

  const server = app.listen(PORT, () => {
    console.log(`[api] running on http://localhost:${PORT}`);
  });

  return server;
}
