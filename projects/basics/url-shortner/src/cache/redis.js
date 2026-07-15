import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is required");
}

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

const KEY_PREFIX = "url:";

function key(shortCode) {
  return `${KEY_PREFIX}${shortCode}`;
}

/**
 * Cache-aside helpers.
 * Redis is the speed layer — never the only source of truth.
 */
export async function cacheGet(shortCode) {
  return redis.get(key(shortCode));
}

export async function cacheSet(shortCode, longUrl, ttlSeconds) {
  const k = key(shortCode);
  if (ttlSeconds && ttlSeconds > 0) {
    await redis.set(k, longUrl, "EX", ttlSeconds);
  } else {
    await redis.set(k, longUrl);
  }
}


export async function cacheDel(shortCode) {
  await redis.del(key(shortCode));
}
