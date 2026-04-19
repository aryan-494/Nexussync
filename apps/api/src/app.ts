import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import { contextMiddleware } from "./context.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js"
import { HttpError, NotFoundError } from "./errors.js";
import { logger } from "./logger.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(express.json());

  /* -----------------------------
     CORS (MUST BE FIRST)
  ------------------------------ */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);

    const allowedOrigin = process.env.FRONTEND_URL;

    // ✅ allow exact match
    if (origin === allowedOrigin) {
      return callback(null, true);
    }

    // ✅ allow vercel preview deployments
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

  // ✅ APPLY CORS (IMPORTANT)
  app.use(cors(corsOptions));

  // ✅ Preflight support (use same config)
  app.options(/.*/, cors(corsOptions));

  /* -----------------------------
     Core middleware
  ------------------------------ */

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

      if (err instanceof HttpError) {
  return res.status(err.statusCode).json({
    error: {
      message: err.message,
      code: err.code,
      status: err.statusCode, // 🔥 ADD THIS
    },
    requestId,
  });
}
      // Unknown errors
      console.error(err);

logger.error("Unhandled error", err);

return res.status(500).json({
  error: {
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err instanceof Error
        ? err.message
        : "Unknown error",
    code: "INTERNAL_ERROR",
    status: 500, // 🔥 ADD THIS
  },
  requestId,
});
    }
  );

  return app;
}