import { peekTokenBucket, resetTokenBucket } from "../limiter/tokenBucket.js";

const workerId = () => process.env.WORKER_ID ?? "1";

/**
 * Protected demo endpoint — every hit costs 1 token.
 * Hitting this through Nginx across api1/api2 proves the limit is global.
 */
export function protectedHandler(req, res) {
  res.json({
    ok: true,
    message: "Request allowed.",
    worker_id: workerId(),
    rate_limit: {
      algorithm: req.rateLimit?.algorithm,
      key: req.rateLimit?.key,
      limit: req.rateLimit?.limit,
      remaining: req.rateLimit?.remaining,
    },
    at: new Date().toISOString(),
  });
}

/** Inspect current bucket without consuming a token. */
export async function statusHandler(req, res) {
  const key =
    req.header("x-api-key") ||
    req.query.api_key ||
    "anonymous";

  const state = await peekTokenBucket(String(key));
  res.json({
    key,
    worker_id: workerId(),
    bucket: state,
    defaults: {
      capacity: Number(process.env.RATE_LIMIT_CAPACITY ?? 10),
      refill_per_sec: Number(process.env.RATE_LIMIT_REFILL_PER_SEC ?? 0.5),
    },
  });
}

/** Clear the bucket so you can re-run demos cleanly. */
export async function resetHandler(req, res) {
  const key =
    req.header("x-api-key") ||
    req.body?.api_key ||
    req.query.api_key ||
    "anonymous";

  await resetTokenBucket(String(key));
  res.json({ ok: true, reset: key, worker_id: workerId() });
}
