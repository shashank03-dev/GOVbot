import io
import base64
import jwt
from datetime import datetime, timezone, timedelta
from gov_agent.config import SECRET_KEY, FRONTEND_URL


def generate_login_qr(phone: str) -> str:
    token = jwt.encode(
        {"phone": phone, "exp": datetime.now(timezone.utc) + timedelta(hours=2)},
        SECRET_KEY,
        algorithm="HS256",
    )
    url = f"{FRONTEND_URL}/login?token={token}&phone={phone}"

    try:
        import qrcode
        qr = qrcode.make(url)
        buf = io.BytesIO()
        qr.save(buf, format="PNG")
        buf.seek(0)
        return base64.b64encode(buf.read()).decode()
    except ImportError:
        return ""


def get_login_url(phone: str) -> str:
    token = jwt.encode(
        {"phone": phone, "exp": datetime.now(timezone.utc) + timedelta(hours=2)},
        SECRET_KEY,
        algorithm="HS256",
    )
    return f"{FRONTEND_URL}/login?token={token}&phone={phone}"
