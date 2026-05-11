import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from gov_agent.db import supabase

logger = logging.getLogger(__name__)

router = APIRouter()


class LiveUpdateRequest(BaseModel):
    step: int
    form_state: dict
    status: Optional[str] = "in_progress"


@router.get("/{session_id}")
async def get_live_session(session_id: str):
    try:
        resp = supabase.table("live_sessions").select("*").eq("session_id", session_id).execute()
    except Exception as e:
        logger.error("live_sessions fetch failed: %s", e)
        raise HTTPException(status_code=500, detail="DB error")

    if not resp.data:
        raise HTTPException(status_code=404, detail="Session not found")

    return resp.data[0]


@router.post("/{session_id}/update")
async def update_live_session(session_id: str, body: LiveUpdateRequest):
    try:
        supabase.table("live_sessions").update({
            "step": body.step,
            "form_state": body.form_state,
            "status": body.status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("session_id", session_id).execute()
    except Exception as e:
        logger.error("live_sessions update failed: %s", e)
        raise HTTPException(status_code=500, detail="DB update error")

    return {"ok": True}


async def create_live_session(session_id: str, phone: str, portal: str = "nsp") -> bool:
    """Helper called from flow_router when an application flow starts."""
    try:
        supabase.table("live_sessions").insert({
            "session_id": session_id,
            "phone": phone,
            "portal": portal,
            "step": 1,
            "total_steps": 5,
            "form_state": {},
            "status": "in_progress",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
        return True
    except Exception as e:
        logger.warning("Failed to create live_session: %s", e)
        return False


async def advance_live_session(session_id: str, step: int, form_state: dict, status: str = "in_progress"):
    """Helper to push step/state updates from flow_router."""
    try:
        supabase.table("live_sessions").update({
            "step": step,
            "form_state": form_state,
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("session_id", session_id).execute()
    except Exception as e:
        logger.warning("advance_live_session failed: %s", e)
