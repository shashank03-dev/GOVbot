# Coding Conventions

**Analysis Date:** 2025-02-14

## Naming Patterns

**Files:**
- **Backend (Python):** snake_case (`gov_agent/whatsapp_webhook.py`, `gov_agent/pm_kisan_router.py`).
- **Frontend (TypeScript):** lowercase/kebab-case for pages (`frontend/pages/index.tsx`, `frontend/pages/pmkisan.tsx`), matching Next.js routing patterns.
- **Frontend (API):** kebab-case (`frontend/pages/api/send-otp.ts`, `frontend/pages/api/verify-otp.ts`).

**Functions:**
- **Backend (Python):** snake_case (`async def handle_incoming(msg: WhatsAppIncoming) -> str`).
- **Frontend (TypeScript):** camelCase (`const handleSendOtp = async (e?: React.FormEvent) => { ... }`).

**Variables:**
- **Backend (Python):** snake_case for instance/local variables (`update_data`, `insert_response`).
- **Frontend (TypeScript):** camelCase for local state and props (`loading`, `resendTimer`).
- **Constants:** UPPER_CASE (`WHATSAPP_TOKEN`, `GEMINI_API_KEY`).

**Types:**
- **Backend (Python):** PascalCase for Pydantic models (`class UserSession(BaseModel)`).
- **Frontend (TypeScript):** PascalCase for component names (`export default function Login()`). Inline union types for small states (`useState<1 | 2>(1)`).

## Code Style

**Formatting:**
- **Frontend:** Not explicitly defined by Prettier config, but follows standard Prettier-like styling (2-space indent, semicolons).
- **Backend:** Standard PEP8 style, although no linter config is present.

**Linting:**
- **Frontend:** ESLint using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Configured in `frontend/eslint.config.mjs`.
- **Backend:** Not detected.

## Import Organization

**Order:**
1. Built-in modules (e.g., `os`, `logging`, `datetime`).
2. Third-party libraries (e.g., `fastapi`, `pydantic`, `supabase`).
3. Internal local modules (e.g., `from gov_agent import config`).

**Path Aliases:**
- **Frontend:** `@/*` alias for the root of the frontend project defined in `frontend/tsconfig.json`.

## Error Handling

**Patterns:**
- **Backend:** `try...except` blocks with logging and re-raising. Uses `logger.error` with `exc_info=True` for traceback capture in webhooks.
- **Frontend (API):** `try...catch` blocks returning 500 status codes on failure.
- **Frontend (UI):** `try...catch` in event handlers updating a local `error` state which is then conditionally rendered in the UI.

## Logging

**Framework:** Python's built-in `logging` module.

**Patterns:**
- Backend uses `RotatingFileHandler` directed to `/tmp/webhook.log` with a 1MB limit and 1 backup file (`gov_agent/whatsapp_webhook.py`).
- Logging levels: `INFO` for requests/headers, `WARNING` for auth failures, `ERROR` for processing exceptions.

## Comments

**When to Comment:**
- **Docstrings:** Used in Python for classes and major functions (`gov_agent/models.py`, `gov_agent/pm_kisan_agent.py`).
- **Inline Comments:** Used sparingly for complex logic (e.g., explaining scraping steps in `gov_agent/pm_kisan_agent.py`).

**JSDoc/TSDoc:**
- Not explicitly used in the frontend code analyzed.

## Function Design

**Size:** Most functions are focused, though the scraping logic in `gov_agent/pm_kisan_agent.py` is somewhat long (~100 lines) due to DOM interaction steps.

**Parameters:**
- Backend uses type hints for parameters (`msg: WhatsAppIncoming`).
- Frontend uses TypeScript for parameter types in event handlers (`e: React.FormEvent`).

**Return Values:**
- Backend uses type hints for return values (`-> dict`, `-> str`).
- Frontend API routes return JSON responses with standard HTTP status codes.

## Module Design

**Exports:**
- **Backend:** explicit exports via `__init__.py` or module-level imports.
- **Frontend:** `export default` for page components; named exports for types.

**Barrel Files:**
- `gov_agent/__init__.py` present but mostly empty or simple. No extensive barrel file usage detected.

---

*Convention analysis: 2025-02-14*
