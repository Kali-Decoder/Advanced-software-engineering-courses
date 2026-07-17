# Rate Limiter as a Service (Node.js)

A teaching implementation of a **distributed rate limiter**. The surface API is simple — protect an endpoint, return `429` when over budget — but the design touches the core ideas: **shared counters**, **atomic check-then-act (Lua)**, **token bucket**, and **stateless APIs behind a load balancer**.

```
Client → Nginx (LB) → API (any instance)
                         ↓
              Rate-limit middleware
                         ↓
         Redis + Lua (token bucket)
              ← shared source of truth
```

## The problem this solves

With multiple stateless API servers, a per-process counter is useless: a client can get a full quota on every instance. Counters must live in **one shared store** that every worker checks **atomically**.

## Stack

| Piece | Role |
|-------|------|
| Node.js + Express | Stateless HTTP API + custom middleware |
| Redis | Shared counter store (source of truth for limits) |
| Lua script | Atomic refill → check → consume (no race) |
| Token bucket | Allows short bursts, smooth refill |
| Sliding window | Optional comparison algorithm |
| Nginx | Load balance across two API instances |

## Project layout

```
rate-limiter/
├── docker-compose.yml      # Redis, api1, api2, Nginx
├── Dockerfile
├── nginx/nginx.conf
├── package.json
├── .env.example
├── public/                 # Browser demo UI
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── src/
    ├── server.js
    ├── redis.js
    ├── middleware/rateLimit.js
    ├── routes/demo.js
    └── limiter/
        ├── tokenBucket.lua   # Atomic script
        ├── tokenBucket.js
        ├── tokenBucket.test.js
        └── slidingWindow.js  # Bonus comparison
```

## Quick start (Docker — recommended)

Brings up **two API workers**, Redis, and Nginx on port **8082**.

Open the UI: [http://localhost:8082](http://localhost:8082)

```bash
cd projects/basics/rate-limiter
docker compose up -d --build
```

### Try it

```bash
# Health (worker_id flips between 1 and 2)
curl -s http://localhost:8082/health

# Fire requests with the same API key — limit is shared across workers
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code} " \
    -H 'X-API-Key: demo-user' \
    http://localhost:8082/api/protected
done
echo

# Inspect bucket (no consume)
curl -s -H 'X-API-Key: demo-user' http://localhost:8082/api/status

# Reset and retry
curl -s -X POST -H 'X-API-Key: demo-user' http://localhost:8082/api/reset
```

Default config: **10 tokens**, refill **0.5/sec** (full bucket in ~20s). First ~10 requests succeed; the rest return `429` with `Retry-After`.

### UI demo

1. Open [http://localhost:8082](http://localhost:8082)
2. Keep API key `demo-user`
3. Click **Fire burst** (15 parallel requests)
4. Watch: ~10 `200`s, then `429`s — and **both worker IDs** appear in the log

That last point is the whole lesson: the limit held even though Nginx split traffic across `api1` and `api2`.

## How the token bucket works

1. Each client key maps to a Redis hash: `{ tokens, updated_at }`
2. On every request, a **Lua script** runs atomically:
   - Refill tokens based on elapsed time (`elapsed × refill_per_sec`), capped at capacity
   - If `tokens >= cost`, subtract and allow; else deny + compute `retry_after`
3. Idle keys expire (TTL ≈ 2× time-to-full-refill) so Redis stays clean

### Why not `GET` then `INCR`?

Two concurrent requests can both read “9 remaining”, both decide to allow, and you’d admit 11. Lua makes refill+check+consume a **single Redis operation**.

### Why token bucket (not fixed window)?

Fixed windows have a boundary bug: 100 requests at `11:59:59` + 100 at `12:00:01` doubles the real rate. Token bucket allows intentional short bursts after idle time, then smooths — friendlier for APIs.

## Response headers

| Header | Meaning |
|--------|---------|
| `X-RateLimit-Limit` | Bucket capacity |
| `X-RateLimit-Remaining` | Tokens left after this request |
| `Retry-After` | Seconds until a token is available (on `429`) |

## Local run (without Docker Compose for the API)

```bash
# Redis must be reachable
export REDIS_URL=redis://localhost:6380   # compose maps host 6380 → container 6379
export RATE_LIMIT_CAPACITY=10
export RATE_LIMIT_REFILL_PER_SEC=0.5
export WORKER_ID=1
npm install
npm start
```

```bash
REDIS_URL=redis://localhost:6380 npm run test:limiter
```

## What to notice / extend

- Change capacity / refill in `docker-compose.yml` and rebuild
- Compare **Token bucket** vs **Sliding window** in the UI dropdown
- Fail Redis and watch `/health` go unhealthy — discuss fail-open vs fail-closed
- Add Nginx `limit_req` later and contrast edge vs app middleware
