/**
 * Base62 encode/decode — turns a numeric ID into a short, URL-safe string.
 * Alphabet: 0-9, a-z, A-Z (62 symbols).
 *
 * Example: 125 → "21", large Snowflake IDs → strings like "aZ3kP9"
 */

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = 62n;

export function encodeBase62(num) {
  let n = typeof num === "bigint" ? num : BigInt(num);
  if (n < 0n) throw new Error("Cannot encode negative numbers");
  if (n === 0n) return ALPHABET[0];

  let out = "";
  while (n > 0n) {
    out = ALPHABET[Number(n % BASE)] + out;
    n = n / BASE;
  }
  return out;
}

export function decodeBase62(str) {
  if (!str || typeof str !== "string") {
    throw new Error("Invalid Base62 string");
  }
  let n = 0n;
  for (const ch of str) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid Base62 character: ${ch}`);
    n = n * BASE + BigInt(idx);
  }
  return n;
}
