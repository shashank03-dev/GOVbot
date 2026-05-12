---
phase: universal-form-autofill
status: issues_found
files_reviewed: 7
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
---

# Code Review — Universal Form Auto-Fill

**Files reviewed:** `profile_router.py`, `form_scanner_router.py`, `flow_router.py` (new sections), `pages/profile.tsx`, `pages/form-fill.tsx`, `components/ProfilePrefillBanner.tsx`, `pages/dashboard.tsx`

---

## 🔴 Critical

### CR-01 — No authorization enforcement on profile endpoints (`profile_router.py:124-136`)

`get_profile` accepts `token_phone` from JWT but **never checks it against the requested `phone`**. Any authenticated user can read or overwrite any other user's profile by guessing a phone number.

```python
# Current — token_phone is decoded but never validated against `phone`
async def get_profile(phone: str, token_phone: Optional[str] = Depends(_optional_jwt)):
    ...  # token_phone is never used
```

**Fix:** Enforce ownership or add a server-side session check:

```python
async def get_profile(phone: str, token_phone: Optional[str] = Depends(_optional_jwt)):
    if token_phone and token_phone != phone:
        raise HTTPException(status_code=403, detail="Access denied")
```

Apply the same guard to `upsert_profile`, `populate_from_ocr`, and `profile_completeness`.

---

### CR-02 — Unvalidated URL passed directly to Playwright (`form_scanner_router.py:105, 225`)

URL validation only checks `startswith("http")` — this accepts `http://localhost`, `http://169.254.169.254` (AWS metadata), `http://internal-services`, etc. Playwright will follow the request, enabling **SSRF** against internal infrastructure.

```python
# Only guard is:
if not body.url.startswith("http"):
    raise HTTPException(status_code=400, detail="Invalid URL")
```

**Fix:** Add an allowlist or block private/reserved IP ranges before launching Playwright:

```python
import ipaddress, socket
from urllib.parse import urlparse

def _validate_public_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only http/https allowed")
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(parsed.hostname))
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            raise HTTPException(status_code=400, detail="Private URLs not allowed")
    except (socket.gaierror, ValueError):
        pass  # DNS failure — let Playwright handle timeout
```

---

## 🟡 Warning

### WR-01 — `_save_profile_field` does 2 DB round-trips per field save (`flow_router.py:52-61`)

Every field collected in WhatsApp flow (name, DOB, income) triggers a `SELECT` + `UPDATE/INSERT`. For a full scholarship flow this is 8–10 sequential Supabase calls adding ~300–600ms latency per message.

**Fix:** Use Supabase upsert with `on_conflict`:

```python
async def _save_profile_field(phone: str, field: str, value) -> None:
    try:
        supabase.table("citizen_profiles").upsert(
            {"phone": phone, field: value},
            on_conflict="phone"
        ).execute()
    except Exception as e:
        logger.warning(f"profile save error ({field}): {e}")
```

Same fix applies to `profile_router.py:151-155`.

---

### WR-02 — Screenshot base64 returned in API response body (`form_scanner_router.py:344-351`)

Full-page screenshots can be 2–5 MB base64-encoded. Returning them inline in the JSON response causes: large response payloads, client memory pressure, and potential timeout in WhatsApp webhook handlers that chain on the fill result.

**Fix:** Store screenshot to disk/storage, return a URL:

```python
import os, base64
SCREENSHOT_DIR = os.environ.get("SCREENSHOT_DIR", "/tmp/govbot_screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# In _playwright_fill — save to file, return path
fname = f"{uuid.uuid4().hex[:12]}.png"
fpath = os.path.join(SCREENSHOT_DIR, fname)
with open(fpath, "wb") as f:
    f.write(screenshot_bytes)
return fname  # return filename, not b64
```

Return `screenshot_url` (a served path) instead of `screenshot_b64` in the fill response.

---

### WR-03 — `_playwright_fill` fills `id_map` and `name_map` with duplicate entries; `filled` counter is never returned (`form_scanner_router.py:210-234`)

1. If a field has both `name` and `id`, it gets added to both maps and filled **twice** — the counter `filled` tracks this but the value returned to caller is `len(fill_values)` (not `filled`), so the count is always under-reported.
2. `filled` is computed locally but the function returns `screenshot_b64`, not the count. The caller uses `len(fill_values)` as a proxy, which counts **intended** fills not **actual** fills.

**Fix:** Return a named tuple or dict from `_playwright_fill`:

```python
return {"screenshot_b64": b64, "actually_filled": filled}
```

---

### WR-04 — `form_fill_processing` state in WhatsApp flow blocks the event loop (`flow_router.py:359-395`)

`analyze_form` and `fill_form` involve Playwright (30–60s operations) called synchronously within the `route()` coroutine which runs inside the WhatsApp webhook handler. This blocks the FastAPI event loop for the duration, starving other concurrent webhook requests.

**Fix:** Run the Playwright operations in a background task and respond immediately with a "processing" acknowledgment, then push the result via WhatsApp when done:

```python
import asyncio
# Return immediately
asyncio.create_task(_run_form_fill_and_notify(url, msg.phone, field_map))
return ("⏳ Analyzing form... I'll message you when done (30-60s).", "greeting", data)
```

---

## 🔵 Info

### IN-01 — Unused import: `JSONResponse` in `form_scanner_router.py:22`

`from fastapi.responses import JSONResponse` is imported but never used. Remove it.

---

### IN-02 — `FormFillSession` Pydantic model defined but never used (`form_scanner_router.py:76-84`)

The `FormFillSession` model is defined but not referenced in any route response model or endpoint. Either wire it as a response model for `/fill` or remove it.

---

### IN-03 — Profile page `handleBlur` re-renders on every input with `defaultValue` anti-pattern (`profile.tsx`)

Using `defaultValue` (uncontrolled) with `onBlur` means if the server returns updated data and the component re-renders, the input **won't reflect** the new value from state because React doesn't update uncontrolled inputs after mount. This causes stale data display after OCR fill.

**Fix:** Switch to controlled inputs with `value` + `onChange` + debounced save, or use a `key` prop tied to the profile data to force remount on fetch.

---

## Summary

| ID | Severity | File | Issue |
|---|---|---|---|
| CR-01 | 🔴 Critical | `profile_router.py` | No ownership check — any user can read/write any profile |
| CR-02 | 🔴 Critical | `form_scanner_router.py` | SSRF via unvalidated URL to Playwright |
| WR-01 | 🟡 Warning | `flow_router.py` | 2 DB round-trips per field save — use upsert |
| WR-02 | 🟡 Warning | `form_scanner_router.py` | Screenshot returned inline in response body (2-5 MB) |
| WR-03 | 🟡 Warning | `form_scanner_router.py` | Duplicate fill + under-reported `filled` counter |
| WR-04 | 🟡 Warning | `flow_router.py` | Playwright blocks FastAPI event loop in webhook handler |
| IN-01 | 🔵 Info | `form_scanner_router.py` | Unused `JSONResponse` import |
| IN-02 | 🔵 Info | `form_scanner_router.py` | `FormFillSession` model unused |
| IN-03 | 🔵 Info | `profile.tsx` | Uncontrolled `defaultValue` won't update after OCR fill |
