# Technology Stack

**Analysis Date:** 2025-02-13

## Languages

**Primary:**
- TypeScript 5.x - Used for the entire `frontend/` application.
- Python 3.10+ - Used for the `gov_agent/` backend and automation scripts.

## Runtime

**Environment:**
- Node.js (v20+ inferred) - Frontend runtime.
- Python 3.10 - Backend runtime.

**Package Manager:**
- npm (v10+ inferred) - Frontend package manager.
- pip - Backend package manager.
- Lockfile: `package-lock.json` present in `frontend/`.

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework for the `frontend/`.
- React 19.2.3 - UI library for the frontend.
- FastAPI - Web framework for the `gov_agent/` backend.
- LangGraph - Orchestration framework for the agentic workflow in `gov_agent/`.

**Testing:**
- ESLint 9 - Linting for frontend.
- Not detected - No explicit testing framework like Jest or Pytest found in the root or main directories.

**Build/Dev:**
- Tailwind CSS v4 - Utility-first CSS framework for styling.
- PostCSS - CSS transformation tool.
- Playwright - Browser automation for scraping government portals.

## Key Dependencies

**Critical:**
- `langgraph` - Core logic for the agent state machine.
- `google-generativeai` - Integration with Google Gemini LLMs.
- `playwright` - Used for automated interaction with government portals (e.g., PM-Kisan).
- `@supabase/supabase-js` & `supabase` (Python) - Client for database and authentication.

**Infrastructure:**
- `chromadb` - Vector database for RAG (Retrieval-Augmented Generation).
- `httpx` - Async HTTP client for API requests in the backend.
- `pydantic` - Data validation and settings management.
- `python-jose` - JWT token generation and verification.

## Configuration

**Environment:**
- Handled via `.env` files (referenced in `gov_agent/config.py`).
- Backend uses `python-dotenv`.

**Build:**
- `frontend/next.config.ts`: Next.js configuration.
- `frontend/tsconfig.json`: TypeScript configuration.
- `frontend/postcss.config.mjs`: PostCSS/Tailwind configuration.

## Platform Requirements

**Development:**
- Node.js & npm.
- Python 3.10+.
- Playwright browsers (installed via `playwright install`).

**Production:**
- Docker: `Dockerfile` present in the root directory.
- Supabase: Cloud database requirement.

---

*Stack analysis: 2025-02-13*
