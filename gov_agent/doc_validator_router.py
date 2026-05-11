import json
import logging
from datetime import date, datetime, timedelta
from typing import Literal, Optional

import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel

from gov_agent.config import GEMINI_API_KEY
from gov_agent.db import supabase

logger = logging.getLogger(__name__)

router = APIRouter()

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

DocType = Literal["income_cert", "caste_cert", "marksheet", "aadhaar"]

VALIDITY_DAYS: dict[str, Optional[int]] = {
    "income_cert": 365,
    "caste_cert": 3 * 365,
    "marksheet": 5 * 365,
    "aadhaar": None,
}


def _expiry_date(issue: date, doc_type: str) -> Optional[date]:
    days = VALIDITY_DAYS.get(doc_type)
    if days is None:
        return None
    return issue + timedelta(days=days)


def _parse_date(raw: str) -> Optional[date]:
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d %b %Y", "%d %B %Y"):
        try:
            return datetime.strptime(raw.strip(), fmt).date()
        except ValueError:
            continue
    return None


class DocValidateRequest(BaseModel):
    doc_type: DocType
    image_b64: str
    session_id: Optional[str] = None
    phone: Optional[str] = None


@router.post("/validate")
async def validate_document(req: DocValidateRequest):
    if not GEMINI_API_KEY:
        return {"error": "Document validation unavailable: GEMINI_API_KEY not configured"}

    prompt = (
        f"This is a scanned {req.doc_type.replace('_', ' ')} document image.\n"
        "Extract:\n"
        "- issue_date: date the document was issued (format DD/MM/YYYY or YYYY-MM-DD)\n"
        "- doc_type_detected: what kind of document this appears to be\n"
        "- quality: 'good' | 'low' | 'unreadable'\n"
        "Return JSON only: "
        '{"issue_date":"","doc_type_detected":"","quality":"good"}'
    )

    issue_date_obj: Optional[date] = None
    flags: list[str] = []
    raw_text = ""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        image_part = {
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": req.image_b64,
            }
        }
        response = model.generate_content([prompt, image_part])
        raw_text = response.text.strip()
        json_start = raw_text.find("{")
        json_end = raw_text.rfind("}") + 1
        result = json.loads(raw_text[json_start:json_end])

        quality = result.get("quality", "good")
        if quality == "unreadable":
            flags.append("unreadable")
        elif quality == "low":
            flags.append("low_quality")

        raw_issue = result.get("issue_date", "")
        if raw_issue:
            issue_date_obj = _parse_date(raw_issue)

    except Exception as e:
        logger.error("Gemini doc validation failed: %s", e)
        flags.append("unreadable")

    today = date.today()
    expiry: Optional[date] = None
    valid = False

    if req.doc_type == "aadhaar":
        valid = True
        issue_date_obj = issue_date_obj
    elif issue_date_obj:
        if issue_date_obj > today:
            flags.append("future_date")
            valid = False
        else:
            expiry = _expiry_date(issue_date_obj, req.doc_type)
            if expiry and today > expiry:
                flags.append("expired")
                valid = False
            else:
                valid = True
    else:
        if "unreadable" not in flags:
            flags.append("unreadable")
        valid = False

    max_days = VALIDITY_DAYS.get(req.doc_type)
    if max_days and issue_date_obj and not flags:
        age_days = (today - issue_date_obj).days
        message = (
            f"Valid — issued {age_days} days ago, "
            f"expires {expiry.strftime('%d/%m/%Y') if expiry else 'N/A'}."
        )
    elif "expired" in flags:
        message = f"{req.doc_type.replace('_', ' ').title()} has expired and may be rejected by portal."
    elif "future_date" in flags:
        message = "Document issue date is in the future — please check."
    elif "unreadable" in flags:
        message = "Document could not be read — please upload a clearer image."
    elif "low_quality" in flags:
        message = "Document quality is low — portal may reject it."
    else:
        message = "Document is valid."

    try:
        supabase.table("document_checks").insert({
            "session_id": req.session_id,
            "phone": req.phone,
            "doc_type": req.doc_type,
            "issue_date": issue_date_obj.isoformat() if issue_date_obj else None,
            "expiry_date": expiry.isoformat() if expiry else None,
            "valid": valid,
            "flags": flags,
        }).execute()
    except Exception as db_err:
        logger.warning("Doc check DB insert failed: %s", db_err)

    return {
        "valid": valid,
        "doc_type": req.doc_type,
        "issue_date": issue_date_obj.strftime("%d/%m/%Y") if issue_date_obj else None,
        "expiry_date": expiry.strftime("%d/%m/%Y") if expiry else None,
        "flags": flags,
        "message": message,
    }
