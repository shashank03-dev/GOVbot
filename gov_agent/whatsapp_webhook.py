import logging
from logging.handlers import RotatingFileHandler
from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse

from gov_agent.config import WHATSAPP_VERIFY_TOKEN
from gov_agent import session_manager, whatsapp_sender
from gov_agent.models import WhatsAppIncoming

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
file_handler = RotatingFileHandler('/tmp/webhook.log', maxBytes=1024*1024, backupCount=1)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

router = APIRouter()


@router.get("")
async def verify_webhook(
    request: Request,
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    logger.info(f"Received GET request: {request.url}")
    logger.info(f"Headers: {request.headers}")
    if hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        logger.info(f"Tokens match, returning {hub_challenge}")
        return int(hub_challenge) if hub_challenge and hub_challenge.isdigit() else PlainTextResponse(hub_challenge)
    logger.warning("Tokens did not match!")
    raise HTTPException(status_code=403)


@router.post("")
async def receive_message(request: Request):
    try:
        payload = await request.json()
        messages = payload["entry"][0]["changes"][0]["value"]["messages"]
        message = messages[0]

        phone = message["from"]
        msg_type = message["type"]

        body = None
        if msg_type == "text":
            body = message["text"]["body"]

        media_id = None
        if msg_type == "image":
            media_id = message["image"]["id"]

        msg = WhatsAppIncoming(
            phone=phone,
            message_type=msg_type,
            body=body,
            media_id=media_id
        )

        reply = await session_manager.handle_incoming(msg)
        await whatsapp_sender.send_message(phone, reply)

    except Exception as e:
        logger.error(f"Webhook processing error: {e}", exc_info=True)

    return JSONResponse({"status": "ok"}, status_code=200)
