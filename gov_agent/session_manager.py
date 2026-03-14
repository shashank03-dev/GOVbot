import logging
from datetime import datetime

from gov_agent.db import supabase


from gov_agent import flow_router
from gov_agent.models import WhatsAppIncoming

logger = logging.getLogger(__name__)


async def get_session(phone: str) -> dict:
    try:
        response = supabase.table("sessions").select(
            "*").eq("phone", phone).execute()
        if not response.data:
            new_row = {
                "phone": phone,
                "state": "greeting",
                "collected_data": {}
            }
            insert_response = supabase.table(
                "sessions").insert(new_row).execute()  # type: ignore
            return insert_response.data[0]  # type: ignore
        return response.data[0]  # type: ignore
    except Exception as e:
        logger.error(f"Supabase error in get_session for phone {phone}: {e}")
        raise


async def save_session(phone: str, state: str, collected_data: dict) -> None:
    try:
        update_data = {
            "phone": phone,
            "state": state,
            "collected_data": collected_data,
            "updated_at": datetime.now().isoformat()
        }
        supabase.table("sessions").upsert(
            update_data, on_conflict="phone").execute()  # type: ignore
    except Exception as e:
        logger.error(f"Supabase error in save_session for phone {phone}: {e}")
        raise


async def handle_incoming(msg: WhatsAppIncoming) -> str:
    session = await get_session(msg.phone)

    # flow_router routing logic
    reply, new_state, new_data = await flow_router.route(session, msg)

    await save_session(msg.phone, new_state, new_data)

    return reply
