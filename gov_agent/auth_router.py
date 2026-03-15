"""
Authentication router for GovBot.

Provides OTP-based phone authentication over WhatsApp:
  POST /auth/send-otp   — generate & deliver a 6-digit OTP via WhatsApp
  POST /auth/verify-otp — validate the OTP and return a signed JWT
"""

import random
import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt

from gov_agent.config import SECRET_KEY
from gov_agent.db import supabase
from gov_agent import whatsapp_sender

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Request schemas ──────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    phone: str | None = None


class VerifyOTPRequest(BaseModel):
    phone: str | None = None
    code: str | None = None


# ── POST /send-otp ───────────────────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(body: SendOTPRequest):
    """Generate a 6-digit OTP, persist it, and send via WhatsApp."""
    if not body.phone:
        raise HTTPException(status_code=400, detail="phone is required")

    code = str(random.randint(100_000, 999_999))
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=10)

    # Upsert OTP record in Supabase
    supabase.table("otp_codes").insert({
        "phone": body.phone,
        "code": code,
        "expires_at": expires_at.isoformat(),
        "used": False,
    }).execute()

    # Deliver OTP over WhatsApp
    message = f"Your GovBot OTP is: {code}\nValid for 10 minutes."
    await whatsapp_sender.send_message(body.phone, message)

    logger.info("OTP sent to %s", body.phone)
    return {"message": "OTP sent"}


# ── POST /verify-otp ─────────────────────────────────────────────────────────

@router.post("/verify-otp")
async def verify_otp(body: VerifyOTPRequest):
    """Validate an OTP and return a signed JWT on success."""
    if not body.phone or not body.code:
        raise HTTPException(status_code=400, detail="phone and code are required")

    now_iso = datetime.now(timezone.utc).isoformat()

    # Fetch a valid, unused, non-expired OTP row
    result = (
        supabase.table("otp_codes")
        .select("id")
        .eq("phone", body.phone)
        .eq("code", body.code)
        .eq("used", False)
        .gt("expires_at", now_iso)
        .limit(1)
        .execute()
    )

    if not result.data:
        return {"valid": False, "error": "Invalid or expired OTP"}

    # Mark the OTP as consumed
    row_id = result.data[0]["id"]
    supabase.table("otp_codes").update({"used": True}).eq("id", row_id).execute()

    # Issue a 7-day JWT
    exp = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {"phone": body.phone, "exp": exp}
    token = jwt.encode(payload, str(SECRET_KEY), algorithm="HS256")

    logger.info("JWT issued for %s", body.phone)
    return {"valid": True, "token": token, "phone": body.phone}
