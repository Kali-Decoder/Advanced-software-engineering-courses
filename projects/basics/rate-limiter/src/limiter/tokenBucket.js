import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { redis } from "../redis.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = fs.readFileSync(path.join(__dirname, "tokenBucket.lua"), "utf8");

const KEY_PREFIX = "rl:tb:";

/**
 * Consume tokens from a shared Redis token bucket.
 *
 * All API workers call this against the same Redis key for a given client,
 * so the limit is global — not per-process.
 */


export async function consumeTokenBucket({
  key,
  capacity,
  refillPerSec,
  cost = 1,
  nowMs = Date.now(),
}) {
  if (!key) {
    throw new Error("key is required");
  }

  const redisKey = `${KEY_PREFIX}${key}`;
  
  const result = await redis.eval(
    SCRIPT,
    1,
    redisKey,
    String(capacity),
    String(refillPerSec),
    String(nowMs),
    String(cost)
  );

  // ioredis returns Lua array as JS array of strings/numbers
  const allowed = Number(result[0]) === 1;
  const remaining = Number(result[1]);
  const limit = Number(result[2]);
  const retryAfterMs = Number(result[3]);

  return {
    allowed,
    remaining,
    limit,
    retryAfterMs,
    retryAfterSec: Math.ceil(retryAfterMs / 1000),
  };
}

/**
 * Peek at bucket state without consuming (for the demo UI).
 */
export async function peekTokenBucket(key) {
  const redisKey = `${KEY_PREFIX}${key}`;
  const data = await redis.hmget(redisKey, "tokens", "updated_at");
  if (data[0] == null) {
    return null;
  }
  return {
    tokens: Number(data[0]),
    updatedAt: Number(data[1]),
  };
}

export async function resetTokenBucket(key) {
  await redis.del(`${KEY_PREFIX}${key}`);
}
