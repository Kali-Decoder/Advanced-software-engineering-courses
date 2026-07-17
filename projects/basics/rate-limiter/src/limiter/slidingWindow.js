import { randomUUID } from "node:crypto";
import { redis } from "../redis.js";

/**
 * Sliding-window counter (bonus comparison algorithm).
 *
 * Stores request timestamps in a Redis sorted set for the last `windowMs`.
 * More precise than fixed windows, but heavier than token bucket (stores
 * one entry per request instead of two floats).
 *
 * KEYS[1] = window key
 * ARGV[1] = now_ms
 * ARGV[2] = window_ms
 * ARGV[3] = limit
 * ARGV[4] = unique member (request id)
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

local min_score = now - window
redis.call("ZREMRANGEBYSCORE", key, 0, min_score)

local count = redis.call("ZCARD", key)
local allowed = 0
local remaining = limit - count

if count < limit then
  redis.call("ZADD", key, now, member)
  allowed = 1
  remaining = remaining - 1
end

redis.call("PEXPIRE", key, window)

local retry_after_ms = 0
if allowed == 0 then
  local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
  if oldest[2] then
    retry_after_ms = math.max(0, (tonumber(oldest[2]) + window) - now)
  end
end

return {allowed, remaining, limit, retry_after_ms}
`;

const KEY_PREFIX = "rl:sw:";

export async function consumeSlidingWindow({
  key,
  limit,
  windowMs,
  nowMs = Date.now(),
}) {
  const redisKey = `${KEY_PREFIX}${key}`;
  const result = await redis.eval(
    SLIDING_WINDOW_LUA,
    1,
    redisKey,
    String(nowMs),
    String(windowMs),
    String(limit),
    randomUUID()
  );

  const allowed = Number(result[0]) === 1;
  const remaining = Math.max(0, Number(result[1]));
  const cap = Number(result[2]);
  const retryAfterMs = Number(result[3]);

  return {
    allowed,
    remaining,
    limit: cap,
    retryAfterMs,
    retryAfterSec: Math.ceil(retryAfterMs / 1000),
  };
}
