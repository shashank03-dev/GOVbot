from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class UserSession(BaseModel):
    """
    Represents the current session state and collected data for a given user.
    """
    phone: str
    state: str
    collected_data: dict
    updated_at: datetime


class ApplicationRecord(BaseModel):
    """
    Represents a submitted service application record tied to a user.
    """
    phone: str
    confirmation_number: str
    service: str
    status: str
    submitted_at: datetime


class WhatsAppIncoming(BaseModel):
    """
    Represents an incoming message from the WhatsApp API.
    """
    phone: str
    message_type: Literal["text", "image"]
    body: Optional[str] = None
    media_id: Optional[str] = None
