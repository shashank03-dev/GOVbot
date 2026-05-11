import google.generativeai as genai
from gov_agent.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

PM_KISAN_STATUS_URL = "https://pmkisan.gov.in/BeneficiaryStatus_New.aspx"
PM_KISAN_REG_LOOKUP_URL = "https://pmkisan.gov.in/KnowYour_Registration.aspx"

_SYSTEM_PROMPT = (
    "You are a helpful Indian government services assistant. "
    "The user wants to check their PM-KISAN beneficiary status. "
    "The PM-KISAN portal now requires a Registration Number (not Aadhaar) "
    "plus CAPTCHA and OTP to check status online. "
    "Provide a concise, helpful reply that includes:\n"
    "1. The latest PM-KISAN installment info (22nd installment released 13 March 2026, ₹2000 per installment, ₹6000/year)\n"
    "2. How to check status: visit the portal link provided\n"
    "3. If they don't know their registration number, they can look it up using Aadhaar at the registration lookup link\n"
    "Keep the reply short and WhatsApp-friendly (no markdown, use emojis sparingly)."
)


async def check_pm_kisan_status(identifier: str) -> dict:
    """
    Provide PM-KISAN status info using Gemini.
    The official portal now requires Registration No + CAPTCHA + OTP,
    so direct scraping is no longer possible.
    """
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            f"User provided identifier: {identifier}\n"
            f"Portal link: {PM_KISAN_STATUS_URL}\n"
            f"Registration lookup link: {PM_KISAN_REG_LOOKUP_URL}\n\n"
            f"Generate a helpful WhatsApp reply for this farmer."
        )
        resp = model.generate_content(
            [{"role": "user", "parts": [prompt]}],
            generation_config={"temperature": 0.3, "max_output_tokens": 512},
            system_instruction=_SYSTEM_PROMPT,
        )
        reply_text = resp.text.strip()
        return {
            "status": "info",
            "message": reply_text,
            "portal_url": PM_KISAN_STATUS_URL,
            "reg_lookup_url": PM_KISAN_REG_LOOKUP_URL,
        }

    except Exception as e:
        # Fallback static response if Gemini fails
        return {
            "status": "info",
            "message": (
                "ℹ️ PM-KISAN Status Check\n\n"
                "The PM-KISAN portal now requires your Registration Number "
                "(not Aadhaar) to check status.\n\n"
                f"🔗 Check status: {PM_KISAN_STATUS_URL}\n\n"
                f"Don't know your Registration No?\n"
                f"🔗 Look it up: {PM_KISAN_REG_LOOKUP_URL}\n\n"
                "Latest: 22nd installment released on 13 March 2026.\n"
                "Each installment: ₹2,000 | Annual: ₹6,000"
            ),
            "portal_url": PM_KISAN_STATUS_URL,
            "reg_lookup_url": PM_KISAN_REG_LOOKUP_URL,
        }
