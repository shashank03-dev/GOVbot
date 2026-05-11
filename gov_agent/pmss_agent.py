from typing import TypedDict, List
from datetime import datetime
from langgraph.graph import StateGraph, END
import random
import string
from gov_agent.db import supabase


class PMSSState(TypedDict):
    name: str
    dob: str
    income: int
    caste: str
    institution: str
    course: str
    media_id: str
    phone: str
    eligible: bool
    missing_fields: List[str]
    submission_result: dict
    error: str


async def check_completeness(state: PMSSState) -> PMSSState:
    required = ["name", "dob", "income", "caste", "institution", "course", "media_id"]
    state["missing_fields"] = [k for k in required if not state.get(k)]
    return state


async def verify_eligibility(state: PMSSState) -> PMSSState:
    try:
        income_ok = int(state["income"]) < 250000
        caste_ok = state["caste"].upper() in ["SC", "ST", "OBC"]
        state["eligible"] = bool(income_ok and caste_ok)
        if not income_ok:
            state["error"] = "Income ₹{} exceeds ₹2.5L limit for PMSS".format(state["income"])
        elif not caste_ok:
            state["error"] = f"Caste {state['caste']} not eligible for PMSS (SC/ST/OBC only)"
    except Exception as e:
        state["eligible"] = False
        state["error"] = f"Verification error: {e}"
    return state


async def execute_application(state: PMSSState) -> PMSSState:
    try:
        conf = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        confirmation = f"PMSS2026{conf}"

        today = datetime.now()
        from datetime import timedelta
        fmt = lambda d: d.strftime("%Y-%m-%d")
        timeline_steps = [
            {"step": "Applied",      "icon": "📝", "date": fmt(today),                      "est_date": fmt(today),                      "done": True},
            {"step": "Under Review", "icon": "🔍", "date": None,                             "est_date": fmt(today + timedelta(days=7)),   "done": False},
            {"step": "Approved",     "icon": "✅", "date": None,                             "est_date": fmt(today + timedelta(days=14)),  "done": False},
            {"step": "Disbursed",    "icon": "💰", "date": None,                             "est_date": fmt(today + timedelta(days=21)),  "done": False},
        ]

        supabase.table("applications").insert({
            "phone": state.get("phone", "unknown"),
            "confirmation_number": confirmation,
            "service": "PMSS Scholarship",
            "status": "submitted",
            "portal": "pmss",
            "timeline_steps": timeline_steps,
        }).execute()

        state["submission_result"] = {
            "status": "success",
            "confirmation_number": confirmation
        }
    except Exception as e:
        state["error"] = str(e)
    return state


async def handle_error(state: PMSSState) -> PMSSState:
    if not state.get("error"):
        if state.get("missing_fields"):
            state["error"] = "Missing required fields: " + ", ".join(state["missing_fields"])
        elif not state.get("eligible", True):
            state["error"] = "Eligibility check failed"
    return state


def route_completeness(state: PMSSState) -> str:
    return "handle_error" if state.get("missing_fields") else "verify_eligibility"


def route_eligibility(state: PMSSState) -> str:
    return "execute_application" if state.get("eligible") else "handle_error"


workflow = StateGraph(PMSSState)
workflow.add_node("check_completeness", check_completeness)
workflow.add_node("verify_eligibility", verify_eligibility)
workflow.add_node("execute_application", execute_application)
workflow.add_node("handle_error", handle_error)
workflow.set_entry_point("check_completeness")
workflow.add_conditional_edges("check_completeness", route_completeness)
workflow.add_conditional_edges("verify_eligibility", route_eligibility)
workflow.add_edge("execute_application", END)
workflow.add_edge("handle_error", END)
pmss_graph = workflow.compile()


async def run_pmss_application(data: dict) -> dict:
    state = PMSSState(
        name=data.get("name", ""),
        dob=data.get("dob", ""),
        income=int(data.get("income", 0)) if data.get("income") else 0,
        caste=data.get("caste", ""),
        institution=data.get("institution", ""),
        course=data.get("course", ""),
        media_id=data.get("media_id", ""),
        phone=data.get("phone", ""),
        eligible=False,
        missing_fields=[],
        submission_result={},
        error=""
    )
    result = await pmss_graph.ainvoke(state)
    return dict(result)
