import type { Request, Response, NextFunction } from "express";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  const requestId = req.context?.requestId;

  console.log(
    `[request:start] ${req.method} ${req.path} requestId=${requestId}`
  );

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `[request:end] ${req.method} ${req.path} status=${res.statusCode} duration=${duration}ms requestId=${requestId}`
    );
  });

  next();
}
