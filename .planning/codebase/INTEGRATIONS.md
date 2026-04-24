# External Integrations

**Analysis Date:** 2025-02-13

## APIs & External Services

**Messaging:**
- **WhatsApp Business API:** Used via Meta Graph API v18.0 for:
  - Sending text messages (e.g., OTP codes, bot responses).
  - Receiving incoming messages and media (webhooks).
  - Downloading user-submitted documents.
  - SDK/Client: Direct `httpx` implementation in `gov_agent/whatsapp_sender.py`.
  - Auth: `WHATSAPP_TOKEN` (Bearer token).

**AI / LLM:**
- **Google Gemini API:** Primary intelligence for the agent.
  - SDK/Client: `google-generativeai`.
  - Auth: `GEMINI_API_KEY`.
- **Anthropic:** Referenced in `requirements.txt`, but not fully integrated in `config.py`.

**Government Portals:**
- **PM-Kisan Portal:** Automated scraping for beneficiary status checks (`https://pmkisan.gov.in/BeneficiaryStatus/BeneficiaryStatus_ja.aspx`).
  - Implementation: Playwright (Chromium headless) in `gov_agent/pm_kisan_agent.py`.
- **National Scholarship Portal (NSP):** Mock implementation in `gov_agent/portal_agent.py` suggests future integration.

## Data Storage

**Databases:**
- **Supabase (PostgreSQL):** Main relational database.
  - Connection: `SUPABASE_URL` and `SUPABASE_KEY` (API keys).
  - Client: `@supabase/supabase-js` (Frontend), `supabase` (Python).
  - Usage: User profiles, OTP storage (`otp_codes` table), session management.

**File Storage:**
- **Supabase Storage (inferred):** Potentially used for storing documents.
- **Local Filesystem:** Used for temporary storage of downloaded media in `gov_agent/portal_agent.py`.

**Caching / Vector DB:**
- **ChromaDB:** Local vector database for Retrieval-Augmented Generation (RAG).
  - Client: `chromadb` in `gov_agent/rag_engine.py`.

## Authentication & Identity

**Auth Provider:**
- **Custom OTP-over-WhatsApp:** OTP codes generated in `gov_agent/auth_router.py`.
  - Implementation: OTPs stored in Supabase, delivered via `whatsapp_sender.py`.
  - Token: Signed JWT (JSON Web Token) with 7-day expiration.

## Monitoring & Observability

**Error Tracking:**
- **None:** No explicit third-party error tracking found (like Sentry).

**Logs:**
- **Python `logging`:** Standard backend logging to console.

## CI/CD & Deployment

**Hosting:**
- **Railway:** Referenced in `frontend/pages/api/send-otp.ts` via `NEXT_PUBLIC_RAILWAY_URL`.

**CI Pipeline:**
- **Not detected:** No explicit CI config files found.

## Environment Configuration

**Required env vars:**
- `WHATSAPP_TOKEN`: Meta Graph API token.
- `WHATSAPP_PHONE_NUMBER_ID`: WhatsApp phone identifier.
- `WHATSAPP_VERIFY_TOKEN`: Webhook verification token.
- `SUPABASE_URL`: Supabase project endpoint.
- `SUPABASE_KEY`: Supabase API key.
- `GEMINI_API_KEY`: Google AI API key.
- `SECRET_KEY`: Used for JWT signing.

**Secrets location:**
- `.env` files (not committed).

## Webhooks & Callbacks

**Incoming:**
- **WhatsApp Webhook:** Handled in `gov_agent/whatsapp_webhook.py`. Receives incoming messages and status updates from Meta.

**Outgoing:**
- **None:** No explicit outgoing webhooks found.

---

*Integration audit: 2025-02-13*
