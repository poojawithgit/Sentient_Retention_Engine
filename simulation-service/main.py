from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

app = FastAPI(title="Simulation Service", version="1.0.0")

class SimulationRequest(BaseModel):
    user_id: str
    usage_score: float
    complaints_count: int
    payment_delay_count: int
    churn_risk: float

class SimulationResponse(BaseModel):
    user_id: str
    original_churn: float
    simulations: dict

ACTION_EFFECTS = {
    "DISCOUNT": {"base_reduction": 0.25},
    "EMAIL": {"base_reduction": 0.10},
    "NONE": {"base_reduction": 0.0}
}

@app.get("/")
def read_root():
    return {"message": "Simulation Service Running"}

@app.post("/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    if not request.churn_risk:
        raise HTTPException(status_code=400, detail="churn_risk is required")

    simulations = {}
    for action, effects in ACTION_EFFECTS.items():
        risk_multiplier = 1 + (request.churn_risk * 0.5)
        reduction = effects["base_reduction"] * risk_multiplier
        simulated_churn = max(0, request.churn_risk - reduction)

        simulations[action] = {
            "simulated_churn": round(simulated_churn * 10000) / 10000,
            "reduction": round(reduction * 10000) / 10000,
            "reduction_percentage": round((reduction / request.churn_risk * 100) * 100) / 100 if request.churn_risk > 0 else 0
        }

    return SimulationResponse(
        user_id=request.user_id,
        original_churn=request.churn_risk,
        simulations=simulations
    )

@app.get("/health")
def health():
    return {"status": "ok"}