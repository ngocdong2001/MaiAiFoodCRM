import type { NextFunction, Request, Response } from "express";

type Bucket = { count: number; resetAt: number };

// In-memory sliding-window rate limiter (per-key). Sufficient for a
// single-instance deployment; swap for a shared store if scaling out.
const buckets = new Map<string, Bucket>();

/**
 * Limits requests per key within a rolling window.
 * @param windowMs  window length in milliseconds
 * @param max       max requests allowed per window
 * @param keyFn     derive a key from the request (defaults to IP)
 */
export const rateLimit = (
  windowMs: number,
  max: number,
  keyFn: (req: Request) => string = (req) => req.ip || "unknown",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyFn(req);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    return next();
  };
};

/** Periodic cleanup to prevent unbounded memory growth. */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();
