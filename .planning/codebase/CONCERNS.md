# Codebase Concerns

**Analysis Date:** 2025-02-14

## Tech Debt

**WhatsApp Webhook Processing:**
- Issue: The webhook receiver uses a broad `except Exception` block and returns 200 OK even if processing fails, making debugging difficult.
- Files: `gov_agent/whatsapp_webhook.py`
- Impact: Silent failures in message processing; difficult to track down issues when the bot stops responding.
- Fix approach: Implement specific exception handling and consider a retry mechanism or DLQ for failed messages.

**WhatsApp Sender Client Lifecycle:**
- Issue: A new `httpx.AsyncClient` is created for every outgoing message instead of using a persistent session.
- Files: `gov_agent/whatsapp_sender.py`
- Impact: Increased latency and overhead for every message sent; potential socket exhaustion under high load.
- Fix approach: Use a singleton or lifecycle-managed `httpx.AsyncClient` (e.g., via FastAPI's lifespan).

**Fragile Scraping Logic:**
- Issue: PM-Kisan status depends on headless browser scraping of an official portal with hardcoded CSS selectors.
- Files: `gov_agent/pm_kisan_agent.py`
- Impact: High risk of breaking if the government website structure changes; high resource consumption.
- Fix approach: Check for official APIs or RSS feeds; implement robust error reporting and monitoring for scraping failures.

**State Machine Complexity:**
- Issue: `flow_router.py` contains a large, centralized `if/elif` block for state transitions.
- Files: `gov_agent/flow_router.py`
- Impact: Hard to maintain as more services/states are added.
- Fix approach: Refactor into a more formal state pattern or use a workflow library.

## Security Considerations

**Weak OTP Generation:**
- Risk: Using `random.randint` for OTP generation is not cryptographically secure.
- Files: `gov_agent/auth_router.py`
- Current mitigation: None.
- Recommendations: Use `secrets.randbelow` or `secrets.choice` for generating 6-digit codes.

**Lack of Rate Limiting:**
- Risk: No limits on requesting or verifying OTPs.
- Files: `gov_agent/auth_router.py`
- Current mitigation: None.
- Recommendations: Implement per-IP and per-phone rate limiting for `send-otp` and `verify-otp` endpoints.

**Hardcoded Production URLs:**
- Risk: Hardcoded production URLs in code make local testing difficult and can lead to environment leakage.
- Files: `gov_agent/flow_router.py`
- Current mitigation: None.
- Recommendations: Move base URLs to configuration environment variables.

## Performance Bottlenecks

**Resource Intensive Scraping:**
- Problem: Starting a new Playwright/Chromium instance for every PM-Kisan status check.
- Files: `gov_agent/pm_kisan_agent.py`
- Cause: Overhead of browser initialization and heavy memory footprint.
- Improvement path: Implement a browser pool or keep a single instance warm; optimize timeout settings.

**Blocking RAG Operations:**
- Problem: Synchronous ChromaDB calls inside async functions.
- Files: `gov_agent/rag_engine.py`
- Cause: ChromaDB's persistent client and collection operations are synchronous and will block the FastAPI event loop.
- Improvement path: Run ChromaDB operations in a thread pool using `run_in_executor`.

**Simulated Latency in Workflow:**
- Problem: Arbitrary `asyncio.sleep(10)` in the application execution node.
- Files: `gov_agent/graph.py`
- Cause: Intentional delay (likely for demo purposes).
- Improvement path: Remove or reduce sleep; ensure long-running nodes don't block other requests if not using background tasks.

## Fragile Areas

**WhatsApp Payload Parsing:**
- Files: `gov_agent/whatsapp_webhook.py`
- Why fragile: Deeply nested dictionary access (`payload["entry"][0]["changes"][0]["value"]["messages"]`) without safe checks.
- Safe modification: Use `.get()` or Pydantic models (like `WhatsAppIncoming`) to parse the full payload safely.
- Test coverage: None detected for edge-case payloads (e.g., status updates).

**Supabase Session Updates:**
- Files: `gov_agent/session_manager.py`
- Why fragile: `upsert` on `on_conflict="phone"` doesn't handle concurrent updates to the same session.
- Safe modification: Implement optimistic locking or use a queue for processing messages from the same user.

## Missing Critical Features

**OTP Table Cleanup:**
- Problem: `otp_codes` table grows indefinitely as every request inserts a new row.
- Blocks: Long-term database performance and storage.
- Fix approach: Implement a background task or cron job to delete expired or used OTPs.

**Input Sanitization:**
- Problem: User inputs from WhatsApp are used directly in queries and prompts without thorough sanitization.
- Files: `gov_agent/flow_router.py`, `gov_agent/rag_engine.py`
- Risks: Prompt injection or unexpected database behavior.

**Reliable Logging:**
- Problem: Logging to `/tmp/webhook.log`.
- Files: `gov_agent/whatsapp_webhook.py`
- Impact: Logs may be lost on system restart or directory cleanup; permissions issues in certain environments.
- Fix approach: Use standard streams (stdout/stderr) for logging, especially in containerized environments.

---

*Concerns audit: 2025-02-14*
