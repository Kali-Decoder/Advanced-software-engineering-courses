import { consumeTokenBucket } from "../limiter/tokenBucket.js";
import { consumeSlidingWindow } from "../limiter/slidingWindow.js";

const defaults = {
  capacity: Number(process.env.RATE_LIMIT_CAPACITY ?? 10),
  refillPerSec: Number(process.env.RATE_LIMIT_REFILL_PER_SEC ?? 0.5),
};

function clientKey(req) {
  // Prefer explicit API key so the UI can demo "one user across many servers"
  const apiKey =
    req.header("x-api-key") ||
    req.query.api_key ||
    req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    "anonymous";
  return String(apiKey);
}

function setRateLimitHeaders(res, result) {
  res.setHeader("X-RateLimit-Limit", String(result.limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
  if (!result.allowed && result.retryAfterSec > 0) {
    res.setHeader("Retry-After", String(result.retryAfterSec));
  }
}

/**
 * Token-bucket middleware — the main algorithm for this project.
 * Runs before the route handler so rejected requests never reach business logic.
 */
export function tokenBucketMiddleware(options = {}) {
  const capacity = options.capacity ?? defaults.capacity;
  const refillPerSec = options.refillPerSec ?? defaults.refillPerSec;
  const cost = options.cost ?? 1;

  return async function rateLimit(req, res, next) {
    try {
      const key = clientKey(req);
      const result = await consumeTokenBucket({
        key,
        capacity,
        refillPerSec,
        cost,
      });

      // Expose for the route / UI
      req.rateLimit = { key, algorithm: "token_bucket", ...result };
      setRateLimitHeaders(res, result);

      if (!result.allowed) {
        return res.status(429).json({
          error: "rate_limit_exceeded",
          message: "Too many requests — try again later.",
          algorithm: "token_bucket",
          key,
          limit: result.limit,
          remaining: result.remaining,
          retry_after_ms: result.retryAfterMs,
          worker_id: process.env.WORKER_ID ?? "1",
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Sliding-window middleware — optional comparison path.
 */
export function slidingWindowMiddleware(options = {}) {
  const limit = options.limit ?? defaults.capacity;
  const windowMs = options.windowMs ?? 20_000;

  return async function rateLimit(req, res, next) {
    try {
      const key = clientKey(req);
      const result = await consumeSlidingWindow({ key, limit, windowMs });

      req.rateLimit = { key, algorithm: "sliding_window", ...result };
      setRateLimitHeaders(res, result);

      if (!result.allowed) {
        return res.status(429).json({
          error: "rate_limit_exceeded",
          message: "Too many requests — try again later.",
          algorithm: "sliding_window",
          key,
          limit: result.limit,
          remaining: result.remaining,
          retry_after_ms: result.retryAfterMs,
          worker_id: process.env.WORKER_ID ?? "1",
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
