import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function insertUrl({ id, shortCode, longUrl, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO urls (id, short_code, long_url, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, short_code, long_url, created_at, expires_at, click_count`,
    [id, shortCode, longUrl, expiresAt ?? null]
  );
  return result.rows[0];
}

export async function findByShortCode(shortCode) {
  const result = await pool.query(
    `SELECT id, short_code, long_url, created_at, expires_at, click_count
     FROM urls
     WHERE short_code = $1
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [shortCode]
  );
  return result.rows[0] ?? null;
}

export async function findByLongUrl(longUrl) {
  const result = await pool.query(
    `SELECT id, short_code, long_url, created_at, expires_at, click_count
     FROM urls
     WHERE long_url = $1
       AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC
     LIMIT 1`,
    [longUrl]
  );
  return result.rows[0] ?? null;
}

export async function incrementClickCount(shortCode) {
  await pool.query(
    `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`,
    [shortCode]
  );
}
