import logging

from fastapi import APIRouter, HTTPException
from gov_agent.db import supabase

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{confirmation_number}/timeline")
async def get_timeline(confirmation_number: str):
    try:
        resp = (
            supabase.table("applications")
            .select("confirmation_number, service, status, submitted_at, timeline_steps, portal, phone")
            .eq("confirmation_number", confirmation_number)
            .execute()
        )
    except Exception as e:
        logger.error("DB error fetching timeline: %s", e)
        raise HTTPException(status_code=500, detail="DB error")

    if not resp.data:
        raise HTTPException(status_code=404, detail="Application not found")

    row = resp.data[0]
    steps = row.get("timeline_steps") or []
    return {
        "confirmation_number": row.get("confirmation_number"),
        "service": row.get("service"),
        "status": row.get("status"),
        "portal": row.get("portal", "nsp"),
        "submitted_at": row.get("submitted_at"),
        "timeline_steps": steps,
        "steps": steps,
    }
