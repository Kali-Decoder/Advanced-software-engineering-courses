/**
 * Lightweight sanity check for the Lua return shape.
 * Run against a live Redis: REDIS_URL=redis://localhost:6380 npm run test:limiter
 */
import { redis } from "../redis.js";
import { consumeTokenBucket, resetTokenBucket } from "./tokenBucket.js";

const KEY = "test:suite";

async function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  await redis.connect();
  await resetTokenBucket(KEY);

  const capacity = 5;
  const refillPerSec = 0; // no refill during the burst — pure capacity check

  let allowed = 0;
  let denied = 0;

  for (let i = 0; i < 8; i++) {
    const r = await consumeTokenBucket({
      key: KEY,
      capacity,
      refillPerSec,
      cost: 1,
    });
    if (r.allowed) allowed += 1;
    else denied += 1;
  }

  assert(allowed === 5, `expected 5 allowed, got ${allowed}`);
  assert(denied === 3, `expected 3 denied, got ${denied}`);

  await resetTokenBucket(KEY);

  // With refill, a denied request should report retry_after > 0
  for (let i = 0; i < 5; i++) {
    await consumeTokenBucket({ key: KEY, capacity: 5, refillPerSec: 1, cost: 1 });
  }
  const blocked = await consumeTokenBucket({
    key: KEY,
    capacity: 5,
    refillPerSec: 1,
    cost: 1,
  });
  assert(!blocked.allowed, "expected deny after emptying bucket");
  assert(blocked.retryAfterMs > 0, "expected retry_after_ms > 0");

  console.log("tokenBucket.test.js: ok");
  await redis.quit();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await redis.quit();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
