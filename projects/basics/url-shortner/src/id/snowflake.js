/**
 * Snowflake-style 64-bit ID generator.
 *
 * Layout (Twitter Snowflake inspired):
 *   41 bits — timestamp (ms since custom epoch)
 *  10 bits — worker / machine ID (0–1023)
 *  12 bits — sequence within the same millisecond (0–4095)
 *
 * Why this exists: multiple API servers can mint unique IDs with no
 * central counter and no coordination — workerId guarantees no collision
 * across machines; sequence handles bursts on one machine.
 */

const CUSTOM_EPOCH = 1_700_000_000_000n; // 2023-11-14-ish — keeps IDs smaller for longer
const WORKER_BITS = 10n;
const SEQUENCE_BITS = 12n;

const MAX_WORKER_ID = (1n << WORKER_BITS) - 1n; // 1023
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n; // 4095

const WORKER_SHIFT = SEQUENCE_BITS;
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_BITS;

export class Snowflake {
  /**
   * @param {number|string} workerId Unique per process/instance (0–1023)
   */
  constructor(workerId) {
    const id = BigInt(workerId);
    if (id < 0n || id > MAX_WORKER_ID) {
      throw new Error(`workerId must be 0–${MAX_WORKER_ID}, got ${workerId}`);
    }
    this.workerId = id;
    this.sequence = 0n;
    this.lastTimestamp = -1n;
  }

  /**
   * @returns {bigint} Unique 64-bit-ish ID
   */
  nextId() {
    let timestamp = BigInt(Date.now());

    if (timestamp < this.lastTimestamp) {
      // Clock moved backwards — wait until we're past lastTimestamp
      timestamp = this.waitUntil(this.lastTimestamp);
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & MAX_SEQUENCE;
      if (this.sequence === 0n) {
        // Sequence exhausted in this ms — wait for next millisecond
        timestamp = this.waitUntil(this.lastTimestamp + 1n);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const relative = timestamp - CUSTOM_EPOCH;
    return (
      (relative << TIMESTAMP_SHIFT) |
      (this.workerId << WORKER_SHIFT) |
      this.sequence
    );
  }

  waitUntil(targetMs) {
    let now = BigInt(Date.now());
    while (now < targetMs) {
      now = BigInt(Date.now());
    }
    return now;
  }
}

export function createSnowflakeFromEnv() {
  const workerId = process.env.WORKER_ID ?? "1";
  return new Snowflake(workerId);
}
