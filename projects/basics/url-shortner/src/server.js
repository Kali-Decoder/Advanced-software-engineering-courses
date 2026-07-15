import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSnowflakeFromEnv } from "./id/snowflake.js";
import { redis } from "./cache/redis.js";
import { pool } from "./db/pool.js";
import { createShortenHandler, redirect, getUrl } from "./routes/urls.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const app = express();
app.use(express.json());

const snowflake = createSnowflakeFromEnv();
const port = Number(process.env.PORT ?? 3000);
const workerId = process.env.WORKER_ID ?? "1";

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    const pong = await redis.ping();
    res.json({
      status: "ok",
      worker_id: workerId,
      redis: pong === "PONG" ? "ok" : "degraded",
    });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: err.message });
  }
});

app.post("/api/shorten", createShortenHandler(snowflake));
app.get("/api/urls/:shortCode", getUrl);

// UI assets — registered before /:shortCode so "/" and static files win
app.use(express.static(publicDir));

app.get("/:shortCode", redirect);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await redis.connect();
  app.listen(port, () => {
    console.log(`url-shortner listening on :${port} (worker_id=${workerId})`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
