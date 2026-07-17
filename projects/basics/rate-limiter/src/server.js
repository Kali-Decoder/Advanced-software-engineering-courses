import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { redis } from "./redis.js";
import {
  tokenBucketMiddleware,
  slidingWindowMiddleware,
} from "./middleware/rateLimit.js";
import {
  protectedHandler,
  statusHandler,
  resetHandler,
} from "./routes/demo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 3000);
const workerId = process.env.WORKER_ID ?? "1";

app.get("/health", async (_req, res) => {
  try {
    const pong = await redis.ping();
    res.json({
      status: "ok",
      worker_id: workerId,
      redis: pong === "PONG" ? "ok" : "degraded",
      rate_limit: {
        capacity: Number(process.env.RATE_LIMIT_CAPACITY ?? 10),
        refill_per_sec: Number(process.env.RATE_LIMIT_REFILL_PER_SEC ?? 0.5),
      },
    });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: err.message });
  }
});

// Primary path: token bucket (shared Redis counter via Lua)
app.get("/api/protected", tokenBucketMiddleware(), protectedHandler);

// Comparison path: sliding window
app.get(
  "/api/protected/sliding",
  slidingWindowMiddleware({ limit: 10, windowMs: 20_000 }),
  protectedHandler
);

app.get("/api/status", statusHandler);
app.post("/api/reset", resetHandler);

app.use(express.static(publicDir));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await redis.connect();
  app.listen(port, () => {
    console.log(`rate-limiter listening on :${port} (worker_id=${workerId})`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
