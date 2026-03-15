import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager
from gov_agent import auth_routery

try:
    from api.app import app  # type: ignore
except ImportError:
    app = FastAPI(
        title="GovBot",
        description="WhatsApp Gov Services",
        version="1.0.0"
    )

from gov_agent import whatsapp_webhook
app.include_router(
    whatsapp_webhook.router,
    prefix="/govbot/webhook",
    tags=["WhatsApp"]
)

from gov_agent import auth_router
app.include_router(
    auth_router.router,
    prefix="/auth",
    tags=["Auth"]
)


@asynccontextmanager
async def lifespan(app):
    # Check if RAG needs ingestion
    import chromadb
    client = chromadb.PersistentClient(
        "./chroma_db")
    try:
        col = client.get_collection(
            "scheme_rules")
        if col.count() == 0:
            raise ValueError("Empty")
    except Exception:
        from gov_agent import rag_engine
        count = await rag_engine.ingest_document(
            "gov_agent/docs/scholarship_rules.pdf"
        )
        print(f"RAG: ingested {count} chunks")
    yield

app.router.lifespan_context = lifespan


@app.get("/govbot/health")
async def health():
    return {
        "status": "ok",
        "service": "GovBot v1.0",
        "whatsapp": "connected"
    }

if __name__ == "__main__":
    uvicorn.run(
        "gov_agent.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
