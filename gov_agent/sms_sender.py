import logging
import httpx

from gov_agent.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER

logger = logging.getLogger(__name__)


async def send_sms(phone: str, message: str) -> dict:
    """Send SMS via Twilio REST API. Returns {"status": "sent"|"failed", "sid": str}."""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_FROM_NUMBER:
        logger.warning("Twilio credentials not configured — SMS not sent to %s", phone)
        return {"status": "failed", "sid": "", "error": "Twilio not configured"}

    to_number = phone if phone.startswith("+") else f"+{phone}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
                data={
                    "From": TWILIO_FROM_NUMBER,
                    "To": to_number,
                    "Body": message[:160],
                },
            )
            resp.raise_for_status()
            body = resp.json()
            return {"status": "sent", "sid": body.get("sid", "")}
    except Exception as e:
        logger.error("Twilio SMS failed to %s: %s", phone, e)
        return {"status": "failed", "sid": "", "error": str(e)}
