import re
from gov_agent.models import WhatsAppIncoming
from gov_agent.db import supabase
from gov_agent import rag_engine
from gov_agent import graph

MENU = (
    "🙏 Namaste! GovBot - Govt Services\n\n"
    "1️⃣ Apply for Scholarship\n"
    "2️⃣ Check Application Status\n"
    "3️⃣ Check My Eligibility\n\n"
    "Reply with 1, 2 or 3"
)


async def route(session: dict, msg: WhatsAppIncoming) -> tuple[str, str, dict]:
    body = msg.body or ""
    data = session.get("collected_data", {})
    state = session.get("state", "greeting")

    if body.strip().lower() in ["restart", "cancel", "reset", "start over", "/start", "close"]:
        farewell = (
            "👋 Thank you for using GovBot!\n\n"
            "Your session has been closed.\n\n"
            "Type 'Hi' anytime to start again 🙏"
        )
        return (farewell, "greeting", {})

    if state == "greeting":
        if body == "1":
            return (
                "What is your full name as per Aadhaar?",
                "collect_name",
                data)
        elif body == "2":
            return ("Enter your confirmation number:", "check_status", data)
        elif body == "3":
            return (
                "Ask your eligibility question:",
                "eligibility_query",
                data)
        else:
            return (MENU, "greeting", data)

    elif state == "collect_name":
        data["name"] = body.strip()
        return ("Date of birth? (DD/MM/YYYY)", "collect_dob", data)

    elif state == "collect_dob":
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", body.strip()):
            return ("❌ Invalid format. Use DD/MM/YYYY", "collect_dob", data)
        data["dob"] = body.strip()
        return ("Annual family income in ₹?", "collect_income", data)

    elif state == "collect_income":
        if not body.strip().isdigit():
            return ("❌ Enter numbers only", "collect_income", data)
        data["income"] = int(body.strip())
        return (
            "Please send a clear photo of your Aadhaar card 📎",
            "awaiting_document",
            data)

    elif state == "awaiting_document":
        if msg.message_type == "image" and msg.media_id:
            data["media_id"] = msg.media_id
        
            # Send acknowledgement immediately
            from gov_agent import whatsapp_sender
            import asyncio
            await whatsapp_sender.send_message(
                msg.phone,
                "✅ Document received!\nSubmitting your application...\nThis may take 30-60 seconds."
            )
            
            # Run submission
            try:
                result = await graph.run_application(data)
                conf = result.get("submission_result", {}).get("confirmation_number")
                if conf:
                    return (
                        f"🎉 Application Submitted!\n\n"
                        f"Confirmation: {conf}\n\n"
                        f"Track status:\n"
                        f"govbot.vercel.app/track/{conf}\n\n"
                        f"View all your applications:\n"
                        f"govbot.vercel.app/dashboard",
                        "completed", data)

                error = result.get("error", "Unknown error")
                return (f"❌ Failed: {error}\nType restart", "completed", data)
            except Exception as e:
                return (f"❌ Error: {str(e)}\nType restart", "completed", data)
        
        return ("Please send Aadhaar as image 📎", "awaiting_document", data)

    elif state == "verify_and_submit":
        try:
            result = await graph.run_application(data)
            conf = result.get("submission_result", {}).get("confirmation_number")
            if conf:
                return (
                    f"🎉 Application Submitted!\n\n"
                    f"Confirmation: {conf}\n\n"
                    f"Track status:\n"
                    f"govbot.vercel.app/track/{conf}\n\n"
                    f"View all your applications:\n"
                    f"govbot.vercel.app/dashboard",
                    "completed", data)

            error = result.get("error", "Unknown error")
            return (f"❌ Failed: {error}\nType restart", "completed", data)
        except Exception as e:
            return (f"❌ System error: {str(e)}\nType restart", "completed", data)


    elif state == "check_status":
        response = supabase.table("applications").select(
            "*").eq("confirmation_number", body.strip()).execute()
        if response.data:
            row: dict = response.data[0]  # type: ignore
            return (
                f"📋 Application {body.strip()}\n"
                f"Status: {str(row.get('status', '')).upper()}\n"
                f"Service: {row.get('service', '')}",
                "greeting",
                data
            )
        else:
            return (
                "❌ No application found with that number.\n"
                "Type 'restart' to retry",
                "greeting",
                data
            )

    elif state == "eligibility_query":
        answer = await rag_engine.query_eligibility(body)
        return (answer, "greeting", data)

    elif state == "completed":
        if body.strip().lower() == "restart":
            return (MENU, "greeting", {})
        return (
            "Your application is complete ✅\n"
            "Type 'restart' for new application",
            "completed",
            data
        )

    return (MENU, "greeting", data)
