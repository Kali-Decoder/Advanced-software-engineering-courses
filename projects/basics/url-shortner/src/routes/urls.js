import { encodeBase62 } from "../id/base62.js";
import {
  insertUrl,
  findByShortCode,
  findByLongUrl,
  incrementClickCount,
} from "../db/pool.js";
import { cacheGet, cacheSet } from "../cache/redis.js";

function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function baseUrl() {
  return (
    process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/$/, "");
}

function shortenResponse(row) {
  return {
    short_code: row.short_code,
    short_url: `${baseUrl()}/${row.short_code}`,
    long_url: row.long_url,
    created_at: row.created_at,
    expires_at: row.expires_at,
  };
}

/**
 * POST /api/shorten
 * Body: { "url": "https://example.com/very/long", "expiresInDays"?: number }
 *
 * If this long URL already has a non-expired short code, reuse it (200).
 * Otherwise mint a new Snowflake ID and insert (201).
 */
export function createShortenHandler(snowflake) {
  return async function shorten(req, res) {
    const { url, expiresInDays } = req.body ?? {};

    if (!url || typeof url !== "string" || !isValidHttpUrl(url)) {
      return res.status(400).json({
        error: "Body must include a valid http(s) URL in field `url`",
      });
    }

    const ttl = Number(process.env.CACHE_TTL_SECONDS ?? 86400);

    const existing = await findByLongUrl(url);
    if (existing) {
      await cacheSet(existing.short_code, existing.long_url, ttl);
      return res.status(200).json({
        ...shortenResponse(existing),
        reused: true,
      });
    }

    const id = snowflake.nextId();
    const shortCode = encodeBase62(id);

    let expiresAt = null;
    if (expiresInDays != null) {
      const days = Number(expiresInDays);
      if (!Number.isFinite(days) || days <= 0) {
        return res.status(400).json({ error: "`expiresInDays` must be a positive number" });
      }
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    const row = await insertUrl({
      id: id.toString(),
      shortCode,
      longUrl: url,
      expiresAt,
    });

    await cacheSet(shortCode, url, ttl);

    return res.status(201).json({
      ...shortenResponse(row),
      reused: false,
    });
  };
}

/**
 * GET /:shortCode — redirect (cache-aside)
 * 1. Redis hit → 302
 * 2. Miss → Postgres → populate Redis → 302
 */
export async function redirect(req, res) {
  const { shortCode } = req.params;

  if (!/^[0-9a-zA-Z]+$/.test(shortCode)) {
    return res.status(400).json({ error: "Invalid short code" });
  }

  // Fast path
  const cached = await cacheGet(shortCode);
  if (cached) {
    incrementClickCount(shortCode).catch(() => {});
    return res.redirect(302, cached);
  }

  // Slow path — source of truth
  const row = await findByShortCode(shortCode);
  if (!row) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  const ttl = Number(process.env.CACHE_TTL_SECONDS ?? 86400);
  await cacheSet(shortCode, row.long_url, ttl);
  incrementClickCount(shortCode).catch(() => {});

  return res.redirect(302, row.long_url);
}

/**
 * GET /api/urls/:shortCode — inspect mapping (no redirect)
 */
export async function getUrl(req, res) {
  const { shortCode } = req.params;
  const row = await findByShortCode(shortCode);
  if (!row) {
    return res.status(404).json({ error: "Short URL not found" });
  }
  return res.json({
    short_code: row.short_code,
    long_url: row.long_url,
    created_at: row.created_at,
    expires_at: row.expires_at,
    click_count: Number(row.click_count),
  });
}
