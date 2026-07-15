-- Source of truth for short_code → long_url mappings.
-- Redis is a speed layer in front of this; if Redis dies, we still have this.

CREATE TABLE IF NOT EXISTS urls (
  id           BIGINT PRIMARY KEY,
  short_code   VARCHAR(16) NOT NULL UNIQUE,
  long_url     TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  click_count  BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls (short_code);
CREATE INDEX IF NOT EXISTS idx_urls_expires_at ON urls (expires_at)
  WHERE expires_at IS NOT NULL;
