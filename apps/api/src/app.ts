import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import { contextMiddleware } from "./context";
import { requestLogger } from "./middleware/requestLogger";
import { apiRouter } from "./routes";
import { HttpError, NotFoundError } from "./errors";

export function createApp() {
  const app = express();
   app.use(express.json());

  /* -----------------------------
     CORS (MUST BE FIRST)
  ------------------------------ */
app.use(
  cors({
     origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  )  => {
      const allowed = [
        process.env.FRONTEND_URL,
      ];

      // allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

  // Explicit preflight support
app.options(/.*/, cors());


  /* -----------------------------
     Core middleware
  ------------------------------ */
 // app.use(express.json());
  app.use(cookieParser());

  app.use(contextMiddleware);
  app.use(requestLogger);

  /* -----------------------------
     Routes
  ------------------------------ */
  app.use("/api", apiRouter());

  /* -----------------------------
     404 handler
  ------------------------------ */
  app.use((req, _res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
  });

  /* -----------------------------
     Global error handler
  ------------------------------ */
  app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {

    const requestId = req.context?.requestId;

    // Known HttpError
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({
        error: {
          message: err.message,
          code: err.code,
        },
        requestId,
      });
    }

    // Unknown errors
    console.error(err);

    return res.status(500).json({
      error: {
        message: "Internal Server Error",
        code: "INTERNAL_ERROR",
      },
      requestId,
    });
  }
);

  return app;
}
