from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from gov_agent import pm_kisan_agent

router = APIRouter()


class AadhaarRequest(BaseModel):
    aadhaar: str


@router.post("/status")
async def pm_kisan_status(body: AadhaarRequest):
    if not body.aadhaar.isdigit() or len(body.aadhaar) != 12:
        raise HTTPException(status_code=400, detail={"error": "Invalid Aadhaar"})

    try:
        result = await pm_kisan_agent.check_pm_kisan_status(body.aadhaar)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})
