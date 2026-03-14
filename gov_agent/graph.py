from typing import TypedDict, List
from datetime import datetime
from langgraph.graph import StateGraph, END
from gov_agent import portal_agent
import asyncio

class ApplicationState(TypedDict):
    name: str
    dob: str
    income: int
    media_id: str
    doc_path: str
    eligible: bool
    missing_fields: List[str]
    submission_result: dict
    error: str


async def check_completeness(state: ApplicationState) -> ApplicationState:
    required = ["name", "dob", "income", "media_id"]
    state["missing_fields"] = [k for k in required if not state.get(k)]
    return state


async def verify_eligibility(state: ApplicationState) -> ApplicationState:
    try:
        d, m, y = state["dob"].split("/")
        dob_date = datetime(int(y), int(m), int(d))
        today = datetime.now()
        age = (today - dob_date).days // 365
        income_ok = int(state["income"]) < 250000
        age_ok = 17 <= age <= 25
        state["eligible"] = bool(income_ok and age_ok)
        if not income_ok:
            state["error"] = "Income ₹{} exceeds ₹2.5L limit".format(
                state["income"])
        elif not age_ok:
            state["error"] = f"Age {age} outside 17-25 range"
    except Exception as e:
        state["eligible"] = False
        state["error"] = f"Verification error: {e}"
    return state


async def execute_application(state: ApplicationState) -> ApplicationState:
    try:
        import random
        import string
        import asyncio
        from gov_agent.db import supabase
        
        await asyncio.sleep(10)
        
        conf = ''.join(random.choices(
            string.ascii_uppercase + string.digits, k=12))
        confirmation = f"NSP2026{conf}"
        
        # Save to Supabase applications table
        supabase.table("applications").insert({
            "phone": state.get("media_id", "unknown"),
            "confirmation_number": confirmation,
            "service": "NSP Scholarship",
            "status": "submitted"
        }).execute()
        
        state["submission_result"] = {
            "status": "success",
            "confirmation_number": confirmation
        }
    except Exception as e:
        state["error"] = str(e)
    return state


async def handle_error(state: ApplicationState) -> ApplicationState:
    if not state.get("error"):
        if state.get("missing_fields"):
            state["error"] = "Missing required fields: " + \
                ", ".join(state["missing_fields"])
        elif not state.get("eligible", True):
            state["error"] = "Eligibility check failed"
    return state


def route_completeness(state: ApplicationState) -> str:
    return "handle_error" if state.get(
        "missing_fields") else "verify_eligibility"


def route_eligibility(state: ApplicationState) -> str:
    return "execute_application" if state.get("eligible") else "handle_error"


workflow = StateGraph(ApplicationState)
workflow.add_node("check_completeness", check_completeness)
workflow.add_node("verify_eligibility", verify_eligibility)
workflow.add_node("execute_application", execute_application)
workflow.add_node("handle_error", handle_error)
workflow.set_entry_point("check_completeness")
workflow.add_conditional_edges("check_completeness", route_completeness)
workflow.add_conditional_edges("verify_eligibility", route_eligibility)
workflow.add_edge("execute_application", END)
workflow.add_edge("handle_error", END)
graph = workflow.compile()


async def run_application(data: dict) -> dict:
    state = ApplicationState(
        name=data.get("name", ""),
        dob=data.get("dob", ""),
        income=int(data.get("income", 0)) if data.get("income") else 0,
        media_id=data.get("media_id", ""),
        doc_path="",
        eligible=False,
        missing_fields=[],
        submission_result={},
        error=""
    )
    result = await graph.ainvoke(state)  # type: ignore
    return dict(result)
