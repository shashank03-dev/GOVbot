# Codebase Structure

**Analysis Date:** 2026-04-24

## Directory Layout

```
GOVbot/
├── frontend/               # Next.js web application
│   ├── pages/              # React pages and API routes
│   │   └── api/            # Next.js API route handlers (proxies)
│   ├── public/             # Static assets
│   └── styles/             # Global CSS and Tailwind config
├── gov_agent/              # Python FastAPI backend & AI Agent logic
│   ├── docs/               # Source documents for RAG (PDFs)
│   ├── auth_router.py      # OTP and Authentication routes
│   ├── config.py           # Configuration and environment variables
│   ├── db.py               # Database client (Supabase)
│   ├── flow_router.py      # Main flow orchestration
│   ├── graph.py            # LangGraph workflow definitions
│   ├── main.py             # FastAPI entry point
│   ├── models.py           # Pydantic data models
│   ├── pm_kisan_agent.py   # Playwright-based scraper for PM-Kisan
│   ├── portal_agent.py     # General portal interaction agent
│   ├── rag_engine.py       # ChromaDB and LLM retrieval logic
│   ├── session_manager.py  # User session tracking
│   ├── whatsapp_sender.py  # Outgoing WhatsApp message utility
│   └── whatsapp_webhook.py # Incoming WhatsApp webhook handler
├── Dockerfile              # Containerization configuration
├── requirements.txt        # Python dependencies
└── README.md               # Project overview
```

## Directory Purposes

**frontend/:**
- Purpose: Modern web interface for citizens to interact with the bot.
- Contains: Next.js (TypeScript), React components, Tailwind styling.
- Key files: `frontend/pages/index.tsx` (Login), `frontend/pages/dashboard.tsx` (User Panel).

**gov_agent/:**
- Purpose: Core logic for the AI Agent, including RAG, workflows, and external portal automation.
- Contains: Python backend services, Agent graphs, Scrapers.
- Key files: `gov_agent/main.py` (App entry), `gov_agent/graph.py` (Workflow logic).

**gov_agent/docs/:**
- Purpose: Knowledge base for RAG.
- Contains: PDF documents containing government scheme rules.
- Key files: `gov_agent/docs/scholarship_rules.pdf`.

## Key File Locations

**Entry Points:**
- `gov_agent/main.py`: Main backend entry point (FastAPI).
- `frontend/pages/index.tsx`: Main frontend entry point (Next.js Home/Login).

**Configuration:**
- `gov_agent/config.py`: Centralized configuration using environment variables.
- `frontend/next.config.ts`: Next.js specific configuration.

**Core Logic:**
- `gov_agent/graph.py`: Defines the LangGraph workflow for application processing.
- `gov_agent/rag_engine.py`: Handles document ingestion and querying for RAG.
- `gov_agent/pm_kisan_agent.py`: Scrapes the PM-Kisan portal using Playwright.

**Testing:**
- (No dedicated test directory detected, tests may be co-located or missing).

## Naming Conventions

**Files:**
- **Python:** Snake-case (e.g., `pm_kisan_agent.py`).
- **TypeScript/React:** Kebab-case for files (e.g., `send-otp.ts`), PascalCase or kebab-case for components/pages.

**Directories:**
- **General:** Snake-case (e.g., `gov_agent`).

## Where to Add New Code

**New Agent Workflow:**
- Implementation: Add a new node or a new graph in `gov_agent/graph.py` or a new file in `gov_agent/`.
- Integration: Update `gov_agent/flow_router.py` to route users to the new workflow.

**New Portal Scraper:**
- Implementation: Create a new agent file in `gov_agent/` (e.g., `gov_agent/new_scheme_agent.py`) using Playwright.

**New Web Page:**
- Implementation: Add a new `.tsx` file in `frontend/pages/`.

**New RAG Document:**
- Source: Place the PDF in `gov_agent/docs/`.
- Trigger: The system automatically ingests it on startup via the lifespan context in `gov_agent/main.py`.

## Special Directories

**chroma_db/:**
- Purpose: Local persistent storage for ChromaDB vector embeddings.
- Generated: Yes (during RAG ingestion).
- Committed: No (typically ignored by `.gitignore`).

**.planning/:**
- Purpose: Project planning and codebase mapping documents.
- Generated: Yes.
- Committed: Yes.

---

*Structure analysis: 2026-04-24*
