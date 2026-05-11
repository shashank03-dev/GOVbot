import asyncio
import logging
from logging.handlers import RotatingFileHandler
import httpx
from gov_agent.config import WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
_fh = RotatingFileHandler('/tmp/webhook.log', maxBytes=1024*1024, backupCount=1)
_fh.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(_fh)

_WA_MAX_RETRIES = 3
_WA_BACKOFF_BASE = 1  # seconds; attempt n waits backoff_base * 2^(n-1)


async def _send_whatsapp(to: str, body: str) -> dict:
    url = (
        f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}"
        f"/messages"
    )
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"body": body}
    }

    last_error: str = "unknown error"
    async with httpx.AsyncClient(timeout=10.0) as client:
        for attempt in range(1, _WA_MAX_RETRIES + 1):
            try:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    return {"ok": True}
                last_error = f"HTTP {response.status_code}: {response.text}"
                logger.warning(
                    "WhatsApp API error (attempt %d/%d): %s - to: %s",
                    attempt, _WA_MAX_RETRIES, last_error, to,
                )
            except Exception as exc:
                last_error = str(exc)
                logger.warning(
                    "WhatsApp send exception (attempt %d/%d): %s - to: %s",
                    attempt, _WA_MAX_RETRIES, last_error, to,
                )
            if attempt < _WA_MAX_RETRIES:
                await asyncio.sleep(_WA_BACKOFF_BASE * (2 ** (attempt - 1)))

    logger.error("WhatsApp send failed after %d attempts to %s: %s", _WA_MAX_RETRIES, to, last_error)
    return {"error": last_error}


async def send_message(to: str, body: str) -> bool:
    result = await _send_whatsapp(to, body)
    if result.get("ok"):
        return True
    logger.warning("WhatsApp failed for %s, falling back to SMS: %s", to, result.get("error"))
    from gov_agent import sms_sender
    sms_result = await sms_sender.send_sms(to, body)
    return sms_result.get("status") == "sent"
