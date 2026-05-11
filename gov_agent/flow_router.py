import re
import uuid
import google.generativeai as genai
from gov_agent.models import WhatsAppIncoming
from gov_agent.db import supabase
from gov_agent import rag_engine
from gov_agent import graph
from gov_agent.config import BASE_URL
from gov_agent.config import GEMINI_API_KEY

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

_LANG_NAMES = {
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
}


async def translate_reply(text: str, lang: str) -> str:
    if lang == "en" or lang not in _LANG_NAMES:
        return text
    if not GEMINI_API_KEY:
        return text
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            f"Translate this government service message to {_LANG_NAMES[lang]}, "
            f"keeping numbers, codes and URLs in original:\n{text}"
        )
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception:
        return text

MENU = (
    "🙏 Namaste! GovBot - Govt Services\n\n"
    "1️⃣ Apply for Scholarship\n"
    "2️⃣ Check Application Status\n"
    "3️⃣ Check My Eligibility\n"
    "4️⃣ PM Kisan Status\n\n"
    "Reply with 1, 2, 3 or 4"
)

PORTAL_MENU = (
    "📚 Which scholarship would you like to apply for?\n\n"
    "1️⃣ NSP (National Scholarship Portal)\n"
    "2️⃣ PMSS (Post Matric Scholarship)\n"
    "3️⃣ CSSS (Central Sector Scholarship)\n"
    "4️⃣ Minority Scholarship\n\n"
    "Reply with 1, 2, 3 or 4"
)


async def route(session: dict, msg: WhatsAppIncoming) -> tuple[str, str, dict]:
    body = msg.body or ""
    data = session.get("collected_data", {})
    state = session.get("state", "greeting")

    _EXIT_KEYWORDS = {"exit", "close", "restart", "cancel", "reset", "start over", "/start"}
    if body.strip().lower() in _EXIT_KEYWORDS:
        farewell = (
            "👋 Thank you for using GovBot!\n\n"
            "Your session has been closed.\n\n"
            "Type 'Hi' anytime to start again 🙏"
        )
        return (farewell, "__delete__", {})

    if state == "greeting":
        if body == "1":
            return (PORTAL_MENU, "portal_select", data)
        elif body == "2":
            return ("Enter your confirmation number:", "check_status", data)
        elif body == "3":
            return (
                "Annual family income in ₹? (enter a number, e.g. 180000)",
                "eligibility_screen_income",
                data)
        elif body == "4":
            return ("Enter your 12-digit Aadhaar or 11-digit PM Kisan Registration Number:",
                    "pm_kisan_aadhaar", data)
        else:
            return (MENU, "greeting", data)

    elif state == "portal_select":
        if body == "1":
            data["portal"] = "nsp"
            return (
                "🔗 *Connect DigiLocker?*\n\n"
                "Link your DigiLocker to auto-fetch:\n"
                "• Aadhaar Card\n"
                "• Income Certificate\n"
                "• Caste Certificate\n\n"
                "Reply *YES* to connect or *NO* to enter manually",
                "digilocker_offer",
                data
            )
        elif body == "2":
            data["portal"] = "pmss"
            return (
                "🔗 *Connect DigiLocker?*\n\n"
                "Link your DigiLocker to auto-fetch your documents.\n\n"
                "Reply *YES* to connect or *NO* to enter manually",
                "digilocker_offer",
                data
            )
        elif body == "3":
            data["portal"] = "csss"
            return (
                "🔗 *Connect DigiLocker?*\n\n"
                "Link your DigiLocker to auto-fetch your documents.\n\n"
                "Reply *YES* to connect or *NO* to enter manually",
                "digilocker_offer",
                data
            )
        elif body == "4":
            data["portal"] = "minority"
            return (
                "🔗 *Connect DigiLocker?*\n\n"
                "Link your DigiLocker to auto-fetch your documents.\n\n"
                "Reply *YES* to connect or *NO* to enter manually",
                "digilocker_offer",
                data
            )
        else:
            return (PORTAL_MENU, "portal_select", data)

    elif state == "digilocker_offer":
        if body.lower() in ["yes", "y", "haan", "ಹೌದು"]:
            # Create mock consent and send link
            from gov_agent.digilocker_router import create_mock_consent, CreateConsentRequest
            try:
                consent = await create_mock_consent(CreateConsentRequest(phone=msg.phone))
                data["consent_id"] = consent.consent_id
                return (
                    f"⏳ *Connecting DigiLocker...*\n\n"
                    f"🔗 Click to authorize:\n{consent.redirect_url}\n\n"
                    f"⏱️ Link expires in 30 minutes\n\n"
                    f"Reply *CHECK* when done or *SKIP* to enter manually",
                    "digilocker_awaiting_auth",
                    data
                )
            except Exception:
                # Fallback to manual entry
                return ("What is your full name as per Aadhaar?", "collect_name", data)
        else:
            # Skip DigiLocker, go to manual entry
            portal = data.get("portal", "nsp")
            next_states = {
                "nsp": "collect_name",
                "pmss": "pmss_collect_name",
                "csss": "csss_collect_name",
                "minority": "minority_collect_name",
            }
            return ("What is your full name as per Aadhaar?", next_states.get(portal, "collect_name"), data)

    elif state == "digilocker_awaiting_auth":
        if body.lower() in ["check", "status"]:
            # Check if DigiLocker is connected
            from gov_agent.digilocker_agent import is_digilocker_connected, format_digilocker_summary, prefill_application_data
            
            if is_digilocker_connected(msg.phone):
                # Get pre-filled data
                prefill = prefill_application_data(msg.phone)
                data.update(prefill)
                
                summary = format_digilocker_summary(msg.phone)
                
                portal = data.get("portal", "nsp")
                next_states = {
                    "nsp": "collect_name",
                    "pmss": "pmss_collect_name",
                    "csss": "csss_collect_name",
                    "minority": "minority_collect_name",
                }
                
                return (
                    f"{summary}\n\n"
                    f"✅ Continuing with pre-filled data...",
                    next_states.get(portal, "collect_name"),
                    data
                )
            else:
                return (
                    "⏳ Still waiting for DigiLocker authorization...\n\n"
                    "Please click the link above and authorize access.\n\n"
                    "Reply CHECK to try again or SKIP to enter manually",
                    "digilocker_awaiting_auth",
                    data
                )
        elif body.lower() in ["skip", "no", "n", "ಬೇಡ"]:
            # Skip to manual entry
            portal = data.get("portal", "nsp")
            next_states = {
                "nsp": "collect_name",
                "pmss": "pmss_collect_name",
                "csss": "csss_collect_name",
                "minority": "minority_collect_name",
            }
            return ("What is your full name as per Aadhaar?", next_states.get(portal, "collect_name"), data)
        else:
            return (
                "⏳ Waiting for DigiLocker authorization...\n\n"
                "Reply CHECK to check status or SKIP to enter manually",
                "digilocker_awaiting_auth",
                data
            )

    elif state == "collect_name":
        data["name"] = body.strip()
        session_id = str(uuid.uuid4())
        data["session_id"] = session_id
        try:
            from gov_agent.live_router import create_live_session
            await create_live_session(session_id, msg.phone)
        except Exception:
            pass
        await _advance(session_id, 1, {"name": data["name"]})
        live_link = f"{BASE_URL}/nsp?session={session_id}"
        from gov_agent import whatsapp_sender
        await whatsapp_sender.send_message(
            msg.phone,
            f"🔴 Watch live: {live_link}"
        )
        return ("Date of birth? (DD/MM/YYYY)", "collect_dob", data)

    elif state == "collect_dob":
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", body.strip()):
            return ("❌ Invalid format. Use DD/MM/YYYY", "collect_dob", data)
        data["dob"] = body.strip()
        await _advance(data.get("session_id"), 2, {"name": data.get("name"), "dob": data["dob"]})
        return ("Annual family income in ₹?", "collect_income", data)

    elif state == "collect_income":
        if not body.strip().isdigit():
            return ("❌ Enter numbers only", "collect_income", data)
        data["income"] = int(body.strip())
        await _advance(data.get("session_id"), 3, {"name": data.get("name"), "dob": data.get("dob"), "income": data["income"]})
        return (
            "Please send a clear photo of your Aadhaar card 📎",
            "awaiting_document",
            data)

    elif state == "collect_aadhaar":
        aadhaar = body.strip().replace(" ", "")
        if not aadhaar.isdigit() or len(aadhaar) != 12:
            return ("❌ Invalid Aadhaar. Enter 12 digits only.", "collect_aadhaar", data)
        data["aadhaar_number"] = aadhaar
        return ("Please send a clear photo of your Aadhaar card 📎", "awaiting_document", data)

    elif state == "awaiting_document":
        if msg.message_type == "image" and msg.media_id:
            data["media_id"] = msg.media_id
            # Run OCR on received Aadhaar image
            try:
                from gov_agent.ocr_router import extract_ocr
                from gov_agent.ocr_router import OcrRequest
                ocr_result = await extract_ocr(OcrRequest(
                    media_id=msg.media_id,
                    session_id=data.get("session_id"),
                    phone=msg.phone,
                ))
                if ocr_result.get("name") and not ocr_result.get("error"):
                    data["ocr"] = ocr_result
                    data["_pending_ocr_confirm"] = True
                    ocr_name = ocr_result["name"]
                    ocr_dob = ocr_result.get("dob", "N/A")
                    return (
                        f"✅ Processing your Aadhaar...\nExtracted:\nName: {ocr_name}\nDOB: {ocr_dob}\n\nIs this correct? Reply YES or NO",
                        "ocr_confirm",
                        data,
                    )
            except Exception:
                pass
            # Send acknowledgement immediately
            from gov_agent import whatsapp_sender
            import asyncio
            await whatsapp_sender.send_message(
                msg.phone,
                "✅ Document received!\nSubmitting your application...\nThis may take 30-60 seconds."
            )
            
            # Run submission
            try:
                # Check for portal-specific submission
                portal = data.get("portal", "nsp")
                if portal == "pmss":
                    from gov_agent import pmss_agent
                    result = await pmss_agent.run_pmss_application(data)
                elif portal == "csss":
                    from gov_agent import csss_agent
                    result = await csss_agent.run_csss_application(data)
                elif portal == "minority":
                    from gov_agent import minority_agent
                    result = await minority_agent.run_minority_application(data)
                else:
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

    elif state == "ocr_confirm":
        if body.strip().upper() == "YES":
            ocr = data.get("ocr", {})
            if ocr.get("name"):
                data["name"] = ocr["name"]
            if ocr.get("dob"):
                data["dob"] = ocr["dob"]
            data.pop("_pending_ocr_confirm", None)
            
            # Move to bank verification
            return (
                "💳 *Bank Account Verification*\n\n"
                "For scholarship disbursement, we need to verify your bank account.\n\n"
                "Please enter your 11-digit IFSC code (e.g., SBIN0001234)",
                "collect_bank_ifsc",
                data
            )
        else:
            data.pop("ocr", None)
            data.pop("_pending_ocr_confirm", None)
            return ("Please re-upload your Aadhaar card 📎", "awaiting_document", data)

    elif state == "collect_bank_ifsc":
        # Validate IFSC code (11 characters)
        ifsc = body.strip().upper()
        if len(ifsc) != 11:
            return (
                "❌ Invalid IFSC code. Must be 11 characters (e.g., SBIN0001234)\n\n"
                "Please enter your IFSC code:",
                "collect_bank_ifsc",
                data
            )
        data["bank_ifsc"] = ifsc
        return (
            "🔢 Now enter your bank account number:",
            "collect_bank_account",
            data
        )

    elif state == "collect_bank_account":
        account = body.strip().replace(" ", "")
        if not account.isdigit() or len(account) < 9:
            return (
                "❌ Invalid account number. Must be 9-18 digits.\n\n"
                "Please enter your account number:",
                "collect_bank_account",
                data
            )
        data["bank_account"] = account
        
        # Start bank verification
        return (
            "⏳ *Verifying Bank Account...*\n\n"
            "🔍 Validating IFSC code...\n"
            "💰 Initiating penny drop (₹0.01)...\n"
            "✅ Checking account status...\n\n"
            "This takes about 30 seconds. Please wait...",
            "verify_bank",
            data
        )

    elif state == "verify_bank":
        # Perform bank verification
        from gov_agent.npci_agent import send_verification_request, notify_verification_status
        
        try:
            result = await send_verification_request(
                msg.phone,
                data.get("bank_account", ""),
                data.get("bank_ifsc", "")
            )
            
            if result.get("success"):
                await notify_verification_status(
                    msg.phone, 
                    "success",
                    result.get("beneficiary_name")
                )
                
                # Move to application submission
                return (
                    f"✅ *Bank Verified: {result.get('beneficiary_name')}*\n\n"
                    f"Submitting your scholarship application...",
                    "verify_and_submit",
                    data
                )
            else:
                await notify_verification_status(msg.phone, "failed")
                return (
                    f"⚠️ *Verification Failed*\n\n"
                    f"{result.get('message', 'Please check your details and try again')}\n\n"
                    f"Reply RETRY to try again or CONTINUE to skip verification",
                    "bank_verify_failed",
                    data
                )
        except Exception as e:
            logger.error(f"Bank verification error: {e}")
            return (
                "⚠️ Could not verify bank account.\n\n"
                "Reply RETRY to try again or CONTINUE to proceed",
                "bank_verify_failed",
                data
            )

    elif state == "bank_verify_failed":
        if body.upper() == "RETRY":
            return (
                "💳 Please enter your 11-digit IFSC code:",
                "collect_bank_ifsc",
                data
            )
        else:
            # Continue without bank verification
            return (
                "⚠️ Proceeding without bank verification.\n"
                "You can add bank details later from the dashboard.",
                "verify_and_submit",
                data
            )

    elif state == "verify_and_submit":
        from gov_agent import whatsapp_sender
        await whatsapp_sender.send_message(
            msg.phone,
            "✅ Submitting your scholarship application...\nThis may take 30-60 seconds."
        )
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
            "*").eq("confirmation_number", body.strip()).limit(1).execute()
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

    elif state == "eligibility_screen_income":
        if not body.strip().isdigit():
            return ("❌ Enter numbers only, e.g. 180000", "eligibility_screen_income", data)
        data["elig_income"] = int(body.strip())
        return (
            "Category? Reply:\nSC / ST / OBC / General",
            "eligibility_screen_caste",
            data,
        )

    elif state == "eligibility_screen_caste":
        val = body.strip().upper()
        if val not in ("SC", "ST", "OBC", "GENERAL"):
            return ("❌ Reply SC, ST, OBC or General", "eligibility_screen_caste", data)
        data["elig_caste"] = val.capitalize() if val == "GENERAL" else val
        return (
            "Course level?\n1️⃣ Pre Matric\n2️⃣ Post Matric\n3️⃣ Degree",
            "eligibility_screen_course",
            data,
        )

    elif state == "eligibility_screen_course":
        mapping = {"1": "pre_matric", "2": "post_matric", "3": "degree"}
        if body.strip() not in mapping:
            return ("❌ Reply 1, 2 or 3", "eligibility_screen_course", data)
        data["elig_course"] = mapping[body.strip()]
        return ("Marks % in last exam? (e.g. 75.5)", "eligibility_screen_marks", data)

    elif state == "eligibility_screen_marks":
        try:
            marks = float(body.strip())
        except ValueError:
            return ("❌ Enter a number, e.g. 75.5", "eligibility_screen_marks", data)
        data["elig_marks"] = marks
        try:
            from gov_agent.models import EligibilityRequest
            from gov_agent import eligibility_router as _er
            req = EligibilityRequest(
                income=data["elig_income"],
                caste=data["elig_caste"],
                course_level=data["elig_course"],
                marks_pct=marks,
            )
            result = await _er.screen_eligibility(req)
            data["elig_result"] = {"eligible": result.eligible, "schemes": result.schemes}
            if result.eligible:
                scheme_list = "\n".join(f"  ✅ {s}" for s in result.schemes)
                reply = (
                    f"🎉 You are ELIGIBLE for:\n{scheme_list}\n\n"
                    f"Reply 1 to apply now, or type restart."
                )
            else:
                reason_list = "\n".join(f"  ❌ {r}" for r in result.reasons[:4])
                reply = f"😔 Not eligible at this time:\n{reason_list}\n\nType restart for main menu."
        except Exception as e:
            reply = f"❌ Could not check eligibility: {e}\nType restart."
        return (reply, "eligibility_result", data)

    elif state == "eligibility_result":
        if body.strip() == "1" and data.get("elig_result", {}).get("eligible"):
            return (
                "What is your full name as per Aadhaar?",
                "collect_name",
                data,
            )
        return (MENU, "greeting", data)

    elif state == "eligibility_query":
        answer = await rag_engine.query_eligibility(body)
        return (answer, "greeting", data)

    elif state == "pm_kisan_aadhaar":
        identifier = body.strip().replace(" ", "")
        if not identifier.isdigit() or len(identifier) not in (11, 12):
            return (
                "❌ Please enter a valid:\n"
                "• 12-digit Aadhaar number, or\n"
                "• 11-digit PM Kisan Registration Number",
                "pm_kisan_aadhaar", data)
        try:
            from gov_agent import pm_kisan_agent
            result = await pm_kisan_agent\
                .check_pm_kisan_status(identifier)
            return (
                result.get("message", "Could not fetch info.") + "\n\n"
                "Type 'restart' for main menu.",
                "greeting", data)
        except Exception as e:
            return (
                f"❌ Could not fetch status: {str(e)}\n"
                "Type 'restart' to try again.",
                "greeting", data)

    elif state == "completed":
        if body.strip().lower() == "restart":
            return (MENU, "greeting", {})
        return (
            "Your application is complete ✅\n"
            "Type 'restart' for new application",
            "completed",
            data
        )

    # PMSS flow states
    elif state == "pmss_collect_name":
        data["name"] = body.strip()
        data["portal"] = "pmss"
        return ("Date of birth? (DD/MM/YYYY)", "pmss_collect_dob", data)

    elif state == "pmss_collect_dob":
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", body.strip()):
            return ("❌ Invalid format. Use DD/MM/YYYY", "pmss_collect_dob", data)
        data["dob"] = body.strip()
        return ("Annual family income in ₹?", "pmss_collect_income", data)

    elif state == "pmss_collect_income":
        if not body.strip().isdigit():
            return ("❌ Enter numbers only", "pmss_collect_income", data)
        data["income"] = int(body.strip())
        return ("Caste category? (SC/ST/OBC)", "pmss_collect_caste", data)

    elif state == "pmss_collect_caste":
        data["caste"] = body.strip().upper()
        return ("Name of your institution/college?", "pmss_collect_institution", data)

    elif state == "pmss_collect_institution":
        data["institution"] = body.strip()
        return ("Course name?", "pmss_collect_course", data)

    elif state == "pmss_collect_course":
        data["course"] = body.strip()
        return ("Enter your 12-digit Aadhaar number:", "pmss_collect_aadhaar", data)

    elif state == "pmss_collect_aadhaar":
        aadhaar = body.strip().replace(" ", "")
        if not aadhaar.isdigit() or len(aadhaar) != 12:
            return ("❌ Invalid Aadhaar. Enter 12 digits only.", "pmss_collect_aadhaar", data)
        data["aadhaar_number"] = aadhaar
        return ("Please send a clear photo of your Aadhaar card 📎", "pmss_awaiting_document", data)

    elif state == "pmss_awaiting_document":
        if msg.message_type == "image" and msg.media_id:
            data["media_id"] = msg.media_id
            return await _submit_application(msg.phone, data, "pmss")
        return ("Please send Aadhaar as image 📎", "pmss_awaiting_document", data)

    # CSSS flow states
    elif state == "csss_collect_name":
        data["name"] = body.strip()
        data["portal"] = "csss"
        return ("Date of birth? (DD/MM/YYYY)", "csss_collect_dob", data)

    elif state == "csss_collect_dob":
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", body.strip()):
            return ("❌ Invalid format. Use DD/MM/YYYY", "csss_collect_dob", data)
        data["dob"] = body.strip()
        return ("Annual family income in ₹?", "csss_collect_income", data)

    elif state == "csss_collect_income":
        if not body.strip().isdigit():
            return ("❌ Enter numbers only", "csss_collect_income", data)
        data["income"] = int(body.strip())
        return ("Marks percentage in last exam? (e.g., 85.5)", "csss_collect_marks", data)

    elif state == "csss_collect_marks":
        try:
            data["marks_pct"] = float(body.strip())
        except ValueError:
            return ("❌ Enter valid percentage (e.g., 85.5)", "csss_collect_marks", data)
        return ("Name of your institution/college?", "csss_collect_institution", data)

    elif state == "csss_collect_institution":
        data["institution"] = body.strip()
        return ("Course name?", "csss_collect_course", data)

    elif state == "csss_collect_course":
        data["course"] = body.strip()
        return ("Enter your 12-digit Aadhaar number:", "csss_collect_aadhaar", data)

    elif state == "csss_collect_aadhaar":
        aadhaar = body.strip().replace(" ", "")
        if not aadhaar.isdigit() or len(aadhaar) != 12:
            return ("❌ Invalid Aadhaar. Enter 12 digits only.", "csss_collect_aadhaar", data)
        data["aadhaar_number"] = aadhaar
        return ("Please send a clear photo of your Aadhaar card 📎", "csss_awaiting_document", data)

    elif state == "csss_awaiting_document":
        if msg.message_type == "image" and msg.media_id:
            data["media_id"] = msg.media_id
            return await _submit_application(msg.phone, data, "csss")
        return ("Please send Aadhaar as image 📎", "csss_awaiting_document", data)

    # Minority flow states
    elif state == "minority_collect_name":
        data["name"] = body.strip()
        data["portal"] = "minority"
        return ("Date of birth? (DD/MM/YYYY)", "minority_collect_dob", data)

    elif state == "minority_collect_dob":
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", body.strip()):
            return ("❌ Invalid format. Use DD/MM/YYYY", "minority_collect_dob", data)
        data["dob"] = body.strip()
        return ("Annual family income in ₹?", "minority_collect_income", data)

    elif state == "minority_collect_income":
        if not body.strip().isdigit():
            return ("❌ Enter numbers only", "minority_collect_income", data)
        data["income"] = int(body.strip())
        return ("Your religion? (Muslim/Sikh/Christian/Buddhist/Parsi/Jain)", "minority_collect_religion", data)

    elif state == "minority_collect_religion":
        data["religion"] = body.strip().capitalize()
        return ("Name of your institution/college?", "minority_collect_institution", data)

    elif state == "minority_collect_institution":
        data["institution"] = body.strip()
        return ("Course name?", "minority_collect_course", data)

    elif state == "minority_collect_course":
        data["course"] = body.strip()
        return ("Marks percentage in last exam?", "minority_collect_marks", data)

    elif state == "minority_collect_marks":
        try:
            data["marks_pct"] = float(body.strip())
        except ValueError:
            return ("❌ Enter valid percentage", "minority_collect_marks", data)
        return ("Enter your 12-digit Aadhaar number:", "minority_collect_aadhaar", data)

    elif state == "minority_collect_aadhaar":
        aadhaar = body.strip().replace(" ", "")
        if not aadhaar.isdigit() or len(aadhaar) != 12:
            return ("❌ Invalid Aadhaar. Enter 12 digits only.", "minority_collect_aadhaar", data)
        data["aadhaar_number"] = aadhaar
        return ("Please send a clear photo of your Aadhaar card 📎", "minority_awaiting_document", data)

    elif state == "minority_awaiting_document":
        if msg.message_type == "image" and msg.media_id:
            data["media_id"] = msg.media_id
            return await _submit_application(msg.phone, data, "minority")
        return ("Please send Aadhaar as image 📎", "minority_awaiting_document", data)

    return (MENU, "greeting", data)


async def _submit_application(phone: str, data: dict, portal: str) -> tuple:
    """Helper to submit application and return response."""
    from gov_agent import whatsapp_sender
    from gov_agent import pmss_agent, csss_agent, minority_agent
    import asyncio

    data["phone"] = phone
    data["portal"] = portal

    await whatsapp_sender.send_message(
        phone,
        "✅ Document received!\nSubmitting your application...\nThis may take 30-60 seconds."
    )

    try:
        if portal == "pmss":
            result = await pmss_agent.run_pmss_application(data)
        elif portal == "csss":
            result = await csss_agent.run_csss_application(data)
        elif portal == "minority":
            result = await minority_agent.run_minority_application(data)
        else:
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


async def _advance(session_id, step: int, form_state: dict, status: str = "in_progress"):
    """Fire-and-forget live session update."""
    if not session_id:
        return
    try:
        from gov_agent.live_router import advance_live_session
        await advance_live_session(session_id, step, form_state, status)
    except Exception:
        pass
