from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class TwinContext(BaseModel):
    userId: str

@router.get("/")
async def twin_status():
    return {"status": "Digital Twin Engine Active"}

@router.post("/simulate/action")
async def simulate_action(userId: str, action: str):
    # Simulated effect on user state (e.g., probability of churn after a 20% discount)
    return {
        "userId": userId,
        "action": action,
        "predicted_impact": {
            "churn_reduction": "15%",
            "ltv_increase": "5%",
            "confidence": 0.82
        }
    }

@router.get("/{userId}/state")
async def get_twin_state(userId: str):
    return {
        "userId": userId,
        "current_state": "High-Churn-Risk",
        "last_updated": "2026-04-14T17:00:00Z",
        "key_features": ["Low_Activity", "High_Support_Tickets", "Expired_Card"]
    }
