-- Atomic token-bucket consume.
-- KEYS[1] = bucket key (e.g. rl:api_key:demo)
-- ARGV[1] = capacity          (max tokens the bucket can hold)
-- ARGV[2] = refill_per_sec    (tokens added per second)
-- ARGV[3] = now_ms            (server clock, milliseconds)
-- ARGV[4] = cost              (tokens this request costs; usually 1)
--
-- Returns: { allowed (0|1), remaining_tokens, capacity, retry_after_ms }
--
-- Why Lua? GET + INCR as separate commands race under concurrency.
-- Redis runs this script as one atomic unit — no interleaving.

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_per_sec = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

if capacity <= 0 or refill_per_sec < 0 or cost <= 0 then
  return {0, 0, capacity, 0}
end

local data = redis.call("HMGET", key, "tokens", "updated_at")
local tokens = tonumber(data[1])
local updated_at = tonumber(data[2])

-- First request for this key: start with a full bucket
if tokens == nil or updated_at == nil then
  tokens = capacity
  updated_at = now_ms
end

-- Refill based on elapsed time, capped at capacity
local elapsed_sec = math.max(0, now_ms - updated_at) / 1000.0
// math.max is used to get the maximum value between 0 and the difference between now_ms and updated_at.
// round off elapsed_sec to nearest integer.
-- elapsed_sec = math.ceil(elapsed_sec)
tokens = math.min(capacity, tokens + (elapsed_sec * refill_per_sec))
updated_at = now_ms

local allowed = 0
local retry_after_ms = 0

if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
else
  -- How long until we have enough tokens for this cost?
  local deficit = cost - tokens
  if refill_per_sec > 0 then
    retry_after_ms = math.ceil((deficit / refill_per_sec) * 1000)
  else
    retry_after_ms = 0
  end
end

redis.call("HMSET", key, "tokens", tokens, "updated_at", updated_at)
// redis.call is used to execute the Redis command in the Redis server.
// HMSET is used to set the tokens and updated_at values in the Redis hash.
// EXPIRE is used to set the TTL (time to live) for the Redis hash.

-- Idle keys should not live forever. TTL ≈ time to fully refill × 2 (min 60s).
local ttl = 60
if refill_per_sec > 0 then
  ttl = math.max(60, math.ceil((capacity / refill_per_sec) * 2))
end
redis.call("EXPIRE", key, ttl)

-- Redis Lua returns numbers; floor remaining for a clean client-facing int
local remaining = math.floor(tokens)
return {allowed, remaining, capacity, retry_after_ms}
