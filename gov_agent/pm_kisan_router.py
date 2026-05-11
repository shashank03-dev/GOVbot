from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from gov_agent import pm_kisan_agent

router = APIRouter()


class PMKisanRequest(BaseModel):
    identifier: str


@router.post("/status")
async def pm_kisan_status(body: PMKisanRequest):
    val = body.identifier.strip().replace(" ", "")
    if not val.isdigit() or len(val) not in (11, 12):
        raise HTTPException(
            status_code=400,
            detail={"error": "Enter a 12-digit Aadhaar or 11-digit Registration Number"})

    try:
        result = await pm_kisan_agent.check_pm_kisan_status(val)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})
