import logging
import httpx
from gov_agent.config import WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID

logger = logging.getLogger(__name__)


async def send_message(to: str, body: str) -> bool:
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

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                return True
            logger.error("WhatsApp API error: %s - %s",
                         response.status_code, response.text)
            return False
    except Exception as e:
        logger.error("Failed to send WhatsApp message: %s", e, exc_info=True)
        return False
