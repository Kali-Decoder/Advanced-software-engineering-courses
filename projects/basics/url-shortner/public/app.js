const healthEl = document.getElementById("health");
const healthText = healthEl.querySelector(".health-text");

const shortenForm = document.getElementById("shorten-form");
const shortenBtn = document.getElementById("shorten-btn");
const shortenError = document.getElementById("shorten-error");
const result = document.getElementById("result");
const shortLink = document.getElementById("short-link");
const copyBtn = document.getElementById("copy-btn");
const metaCode = document.getElementById("meta-code");
const metaCreated = document.getElementById("meta-created");
const metaExpires = document.getElementById("meta-expires");
const resultBadge = document.getElementById("result-badge");

const lookupForm = document.getElementById("lookup-form");
const lookupError = document.getElementById("lookup-error");
const lookupResult = document.getElementById("lookup-result");

function showError(el, message) {
  el.hidden = !message;
  el.textContent = message || "";
}

function formatDate(value) {
  if (!value) return "never";
  return new Date(value).toLocaleString();
}

async function refreshHealth() {
  try {
    const res = await fetch("/health");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "unhealthy");
    healthEl.classList.add("ok");
    healthEl.classList.remove("bad");
    healthText.textContent = `ok · worker ${data.worker_id} · redis ${data.redis}`;
  } catch (err) {
    healthEl.classList.add("bad");
    healthEl.classList.remove("ok");
    healthText.textContent = `down · ${err.message}`;
  }
}

shortenForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError(shortenError, "");
  result.hidden = true;
  shortenBtn.disabled = true;

  const form = new FormData(shortenForm);
  const body = { url: String(form.get("url") || "").trim() };
  const expires = String(form.get("expiresInDays") || "").trim();
  if (expires) body.expiresInDays = Number(expires);

  try {
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to shorten URL");

    shortLink.href = data.short_url;
    shortLink.textContent = data.short_url;
    metaCode.textContent = data.short_code;
    metaCreated.textContent = formatDate(data.created_at);
    metaExpires.textContent = formatDate(data.expires_at);

    resultBadge.hidden = false;
    if (data.reused) {
      resultBadge.textContent = "Reused existing code";
      resultBadge.className = "badge reused";
    } else {
      resultBadge.textContent = "Newly created";
      resultBadge.className = "badge created";
    }

    result.hidden = false;
    document.getElementById("lookup-code").value = data.short_code;
  } catch (err) {
    showError(shortenError, err.message);
  } finally {
    shortenBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  const text = shortLink.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1200);
  } catch {
    copyBtn.textContent = "Failed";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1200);
  }
});

lookupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError(lookupError, "");
  lookupResult.hidden = true;

  const code = String(new FormData(lookupForm).get("code") || "").trim();
  try {
    const res = await fetch(`/api/urls/${encodeURIComponent(code)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lookup failed");
    lookupResult.hidden = false;
    lookupResult.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    showError(lookupError, err.message);
  }
});

refreshHealth();
setInterval(refreshHealth, 5000);
