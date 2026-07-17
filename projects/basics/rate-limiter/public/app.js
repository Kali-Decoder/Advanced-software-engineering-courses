const healthEl = document.getElementById("health");
const healthText = healthEl.querySelector(".health-text");
const apiKeyInput = document.getElementById("api-key");
const burstInput = document.getElementById("burst");
const algorithmSelect = document.getElementById("algorithm");
const fireBtn = document.getElementById("fire-btn");
const resetBtn = document.getElementById("reset-btn");
const statusBtn = document.getElementById("status-btn");
const logEl = document.getElementById("log");
const summaryEl = document.getElementById("summary");
const sumAllowed = document.getElementById("sum-allowed");
const sumDenied = document.getElementById("sum-denied");
const sumWorkers = document.getElementById("sum-workers");

function apiKey() {
  return apiKeyInput.value.trim() || "anonymous";
}

function protectedPath() {
  return algorithmSelect.value === "sliding_window"
    ? "/api/protected/sliding"
    : "/api/protected";
}

async function refreshHealth() {
  try {
    const res = await fetch("/health");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "unhealthy");
    healthEl.classList.add("ok");
    healthEl.classList.remove("bad");
    healthText.textContent = `worker ${data.worker_id} · redis ${data.redis} · ${data.rate_limit.capacity} tok @ ${data.rate_limit.refill_per_sec}/s`;
  } catch {
    healthEl.classList.remove("ok");
    healthEl.classList.add("bad");
    healthText.textContent = "unreachable";
  }
}

function clearLog(message) {
  logEl.innerHTML = "";
  if (message) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = message;
    logEl.appendChild(p);
  }
}

function appendLog({ status, worker, detail }) {
  if (logEl.querySelector(".muted")) logEl.innerHTML = "";
  const row = document.createElement("div");
  row.className = "log-entry";
  row.innerHTML = `
    <span class="status ${status === 200 ? "ok" : "deny"}">${status}</span>
    <span class="worker">w${worker ?? "?"}</span>
    <span>${detail}</span>
  `;
  logEl.prepend(row);
}

async function fireBurst() {
  const n = Math.min(100, Math.max(1, Number(burstInput.value) || 1));
  fireBtn.disabled = true;
  clearLog("Firing…");

  let allowed = 0;
  let denied = 0;
  const workers = new Set();

  // Parallel burst — proves atomicity under concurrency across both workers
  const jobs = Array.from({ length: n }, async (_, i) => {
    const res = await fetch(protectedPath(), {
      headers: { "X-API-Key": apiKey() },
    });
    const data = await res.json().catch(() => ({}));
    const worker = data.worker_id ?? data.rate_limit?.worker_id;
    if (worker != null) workers.add(String(worker));

    if (res.status === 200) {
      allowed += 1;
      appendLog({
        status: 200,
        worker,
        detail: `ok · remaining ${data.rate_limit?.remaining ?? "?"} · #${i + 1}`,
      });
    } else {
      denied += 1;
      appendLog({
        status: res.status,
        worker,
        detail: `deny · retry ${data.retry_after_ms ?? "?"}ms · #${i + 1}`,
      });
    }
  });

  await Promise.all(jobs);

  summaryEl.hidden = false;
  sumAllowed.textContent = String(allowed);
  sumDenied.textContent = String(denied);
  sumWorkers.textContent = [...workers].sort().join(", ") || "—";
  fireBtn.disabled = false;
  refreshHealth();
}

async function resetBucket() {
  const res = await fetch("/api/reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey(),
    },
    body: JSON.stringify({ api_key: apiKey() }),
  });
  const data = await res.json();
  clearLog(`Bucket reset for "${data.reset}" (via worker ${data.worker_id}).`);
  summaryEl.hidden = true;
}

async function peekStatus() {
  const res = await fetch(`/api/status?api_key=${encodeURIComponent(apiKey())}`, {
    headers: { "X-API-Key": apiKey() },
  });
  const data = await res.json();
  const bucket = data.bucket
    ? `${data.bucket.tokens.toFixed(2)} tokens`
    : "empty (full on next request)";
  clearLog(`Status for "${data.key}": ${bucket} · defaults ${data.defaults.capacity} @ ${data.defaults.refill_per_sec}/s`);
}

fireBtn.addEventListener("click", () => fireBurst().catch(console.error));
resetBtn.addEventListener("click", () => resetBucket().catch(console.error));
statusBtn.addEventListener("click", () => peekStatus().catch(console.error));

refreshHealth();
setInterval(refreshHealth, 5000);
