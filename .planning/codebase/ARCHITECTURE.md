# Architecture

**Analysis Date:** 2026-04-24

## Pattern Overview

**Overall:** AI Agent-Driven Web Application

**Key Characteristics:**
- **Asynchronous Workflows:** Uses LangGraph to manage complex, multi-step application and verification flows.
- **RAG-Augmented Responses:** Integrates Retrieval-Augmented Generation (RAG) to provide accurate information based on official government scheme documents.
- **Automated Web Interactions:** Employs Playwright for headless browser automation to scrape or interact with official government portals (e.g., PM-Kisan).

## Layers

**Frontend Layer:**
- Purpose: Provides a user interface for citizens to login, check status, and apply for schemes.
- Location: `frontend/`
- Contains: Next.js pages, React components, Tailwind CSS styling, and Next.js API routes acting as proxies.
- Depends on: Backend API (FastAPI).
- Used by: End users (Citizens).

**API Layer (Backend):**
- Purpose: Acts as the primary interface for the frontend and external webhooks (WhatsApp).
- Location: `gov_agent/main.py`, `gov_agent/*_router.py`
- Contains: FastAPI routes, Pydantic models, and router logic.
- Depends on: LangGraph workflows, RAG engine, Supabase.
- Used by: Frontend, WhatsApp Webhooks.

**Agent/Workflow Layer:**
- Purpose: Manages stateful logic for processing applications and verifying eligibility.
- Location: `gov_agent/graph.py`, `gov_agent/pm_kisan_agent.py`, `gov_agent/portal_agent.py`
- Contains: LangGraph StateGraph definitions, Playwright scraping logic.
- Depends on: LLM (Gemini), Supabase.
- Used by: API Layer.

**Data & Knowledge Layer:**
- Purpose: Handles persistent storage and semantic search.
- Location: `gov_agent/db.py`, `gov_agent/rag_engine.py`
- Contains: Supabase client, ChromaDB integration, document ingestion logic.
- Depends on: Supabase, ChromaDB, Google Gemini Embeddings.
- Used by: Agent Layer, API Layer.

## Data Flow

**Citizen Application Flow:**

1. User submits data via Frontend (`frontend/pages/index.tsx`) or WhatsApp (`gov_agent/whatsapp_webhook.py`).
2. Request hits the FastAPI backend and triggers a LangGraph workflow (`gov_agent/graph.py`).
3. The workflow proceeds through nodes: `check_completeness` -> `verify_eligibility` -> `execute_application`.
4. `execute_application` saves the result to Supabase and returns a confirmation number.

**RAG Query Flow:**

1. User asks a question about a scheme.
2. `gov_agent/rag_engine.py` converts the query into an embedding.
3. ChromaDB retrieves relevant document chunks from `gov_agent/docs/scholarship_rules.pdf`.
4. LLM (Gemini) generates a response based on the retrieved context.

**State Management:**
- **Workflow State:** Managed by LangGraph's `ApplicationState` (TypedDict) during the execution of a graph.
- **Persistent State:** Stored in Supabase for user records and applications.
- **Session State:** Managed by `gov_agent/session_manager.py`.

## Key Abstractions

**StateGraph (LangGraph):**
- Purpose: Orchestrates multi-node logic with conditional branching.
- Examples: `gov_agent/graph.py`
- Pattern: Finite State Machine / Directed Acyclic Graph.

**Playwright Agent:**
- Purpose: Automates interaction with external government portals.
- Examples: `gov_agent/pm_kisan_agent.py`
- Pattern: Browser Automation / Web Scraping.

## Entry Points

**FastAPI App:**
- Location: `gov_agent/main.py`
- Triggers: HTTP requests from frontend or external services.
- Responsibilities: Routing, Lifespan management (RAG ingestion), health checks.

**Next.js App:**
- Location: `frontend/pages/index.tsx`
- Triggers: User visiting the web URL.
- Responsibilities: Rendering UI, handling client-side state, proxying API calls.

## Error Handling

**Strategy:** Node-based error handling within LangGraph and standard FastAPI exception handling.

**Patterns:**
- **Error Node:** `handle_error` node in LangGraph to capture and format workflow failures.
- **Graceful Degradation:** Fallbacks in scraping logic when selectors fail or portals are down.

## Cross-Cutting Concerns

**Logging:** Standard Python logging used via FastAPI/Uvicorn.
**Validation:** Pydantic models in `gov_agent/models.py`.
**Authentication:** OTP-based authentication via WhatsApp and Supabase, implemented in `gov_agent/auth_router.py` and `frontend/pages/api/verify-otp.ts`.

---

*Architecture analysis: 2026-04-24*
