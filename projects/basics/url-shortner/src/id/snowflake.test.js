import { Snowflake } from "./snowflake.js";
import { encodeBase62, decodeBase62 } from "./base62.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const a = new Snowflake(1);
const b = new Snowflake(2);

const ids = new Set();
for (let i = 0; i < 5000; i++) {
  ids.add(a.nextId().toString());
  ids.add(b.nextId().toString());
}
assert(ids.size === 10000, `Expected 10000 unique IDs, got ${ids.size}`);

const id = a.nextId();
const code = encodeBase62(id);
assert(decodeBase62(code) === id, "Base62 round-trip failed");
assert(/^[0-9a-zA-Z]+$/.test(code), "Base62 produced non-URL-safe chars");

console.log("OK — Snowflake uniqueness + Base62 round-trip");
console.log(`  sample id=${id} → short_code=${code}`);
