import base64
import json
import logging
import httpx
import google.generativeai as genai

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from gov_agent.config import GEMINI_API_KEY, WHATSAPP_TOKEN
from gov_agent.db import supabase

logger = logging.getLogger(__name__)

router = APIRouter()

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class OcrRequest(BaseModel):
    media_id: Optional[str] = None
    image_b64: Optional[str] = None
    session_id: Optional[str] = None
    phone: Optional[str] = None


async def _download_media(media_id: str) -> str:
    """Download WhatsApp media and return base64-encoded bytes."""
    url = f"https://graph.facebook.com/v18.0/{media_id}"
    headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}"}
    async with httpx.AsyncClient(timeout=30.0) as client:
        meta_resp = await client.get(url, headers=headers)
        meta_resp.raise_for_status()
        download_url = meta_resp.json()["url"]
        img_resp = await client.get(download_url, headers=headers)
        img_resp.raise_for_status()
        return base64.b64encode(img_resp.content).decode("utf-8")


@router.post("/extract")
async def extract_ocr(req: OcrRequest):
    if not req.media_id and not req.image_b64:
        return {"error": "Provide media_id or image_b64"}

    if not GEMINI_API_KEY:
        return {"error": "OCR service unavailable: GEMINI_API_KEY not configured"}

    image_b64 = req.image_b64
    if req.media_id:
        try:
            image_b64 = await _download_media(req.media_id)
        except Exception as e:
            logger.error("Media download failed: %s", e)
            return {"error": f"Media download failed: {e}"}

    prompt = (
        "Extract from this Aadhaar card image:\n"
        "- Full name as printed\n"
        "- Date of birth (DD/MM/YYYY)\n"
        "- 12-digit Aadhaar number (XXXX XXXX XXXX format)\n"
        "- Complete address\n"
        "- Gender\n"
        'Return JSON only: {"name":"","dob":"","aadhaar_number":"","address":"","gender":"","confidence":0.0}'
    )

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        image_part = {
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": image_b64,
            }
        }
        response = model.generate_content([prompt, image_part])
        raw_text = response.text.strip()

        json_start = raw_text.find("{")
        json_end = raw_text.rfind("}") + 1
        extracted = json.loads(raw_text[json_start:json_end])
    except Exception as e:
        logger.error("Gemini OCR failed: %s", e)
        extracted = {
            "name": "", "dob": "", "aadhaar_number": "",
            "address": "", "gender": "", "confidence": 0.0
        }
        raw_text = str(e)

    field_map = {k: v for k, v in extracted.items() if k != "confidence"}
    confidence = float(extracted.get("confidence", 0.0))

    # Mask Aadhaar before persisting — store only last 4 digits (PII mitigation)
    aadhaar_raw = field_map.get("aadhaar_number", "")
    aadhaar_digits = aadhaar_raw.replace(" ", "")
    field_map_safe = {**field_map}
    if aadhaar_digits:
        field_map_safe["aadhaar_number"] = f"XXXX-XXXX-{aadhaar_digits[-4:]}" if len(aadhaar_digits) >= 4 else "XXXX"

    try:
        supabase.table("ocr_extractions").insert({
            "session_id": req.session_id,
            "phone": req.phone,
            "raw_text": raw_text if isinstance(raw_text, str) else json.dumps(raw_text),
            "field_map": field_map_safe,
            "confidence": confidence,
        }).execute()
    except Exception as db_err:
        logger.warning("OCR DB insert failed: %s", db_err)

    return {
        "name": extracted.get("name", ""),
        "dob": extracted.get("dob", ""),
        "aadhaar_number": extracted.get("aadhaar_number", ""),
        "address": extracted.get("address", ""),
        "gender": extracted.get("gender", ""),
        "field_map": field_map,
        "confidence": confidence,
    }
