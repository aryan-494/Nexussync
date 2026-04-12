import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";

// general API limiter
const apiLimiter = new RateLimiterMemory({
  points: 100, // requests
  duration: 60, // per 60 sec
});

// stricter limiter for sync endpoints
const syncLimiter = new RateLimiterMemory({
  points: 50,
  duration: 60,
});

// helper middleware
function createLimiter(limiter: RateLimiterMemory) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip ?? "unknown"; // fallback for some reason

      await limiter.consume(key);

      next();
    } catch {
      res.status(429).json({
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests, slow down",
        },
      });
    }
  };
}

export const apiRateLimiter = createLimiter(apiLimiter);
export const syncRateLimiter = createLimiter(syncLimiter);