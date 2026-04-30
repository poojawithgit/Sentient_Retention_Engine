from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import httpx

app = FastAPI(title="Agent Service", version="1.0.0")

class AgentRequest(BaseModel):
    user_id: str
    usage_score: float
    complaints_count: int
    payment_delay_count: int

class AgentResponse(BaseModel):
    user_id: str
    churn_risk: float
    risk_level: str
    simulations: dict
    best_action: str
    expected_churn: float
    reason: str
    timestamp: str

ACTION_EFFECTS = {
    "DISCOUNT": {"base_reduction": 0.25},
    "EMAIL": {"base_reduction": 0.10},
    "NONE": {"base_reduction": 0.0}
}

def mock_predict(usage, complaints, payment_delay):
    risk = 0.2
    if usage < 10:
        risk += 0.4
    elif usage < 20:
        risk += 0.2
    if usage >= 50:
        risk -= 0.1
    risk += complaints * 0.15
    risk += payment_delay * 0.08
    return max(0, min(1, risk))

@app.get("/")
def read_root():
    return {"message": "Agent Service Running"}

@app.post("/agent", response_model=AgentResponse)
async def run_agent(request: AgentRequest):
    # Step 1: OBSERVE - Get churn prediction
    churn_risk = mock_predict(request.usage_score, request.complaints_count, request.payment_delay_count)
    risk_level = "HIGH" if churn_risk > 0.7 else "MEDIUM" if churn_risk > 0.4 else "LOW"

    # Try to get from prediction service
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post("http://prediction-service:8002/predict", json={
                "user_id": request.user_id,
                "usage_score": request.usage_score,
                "complaints_count": request.complaints_count,
                "payment_delay_count": request.payment_delay_count
            })
            if resp.status_code == 200:
                data = resp.json()
                churn_risk = data["churn_risk"]
                risk_level = data["risk_level"]
    except:
        pass  # Use mock

    # Step 2: THINK - Interpret risk
    if churn_risk < 0.4:
        strategy = "maintain"
        priority = "low"
    elif churn_risk < 0.7:
        strategy = "engage"
        priority = "medium"
    else:
        strategy = "intervene"
        priority = "high"

    # Step 3: SIMULATE - Digital Twin
    simulations = {}
    for action, effects in ACTION_EFFECTS.items():
        risk_multiplier = 1 + (churn_risk * 0.5)
        reduction = effects["base_reduction"] * risk_multiplier
        simulated_churn = max(0, churn_risk - reduction)

        simulations[action] = {
            "simulated_churn": round(simulated_churn * 10000) / 10000,
            "reduction": round(reduction * 10000) / 10000,
            "reduction_percentage": round((reduction / churn_risk * 100) * 100) / 100 if churn_risk > 0 else 0
        }

    # Step 4: DECIDE - Select best action
    best_action = "NONE"
    lowest_churn = churn_risk
    for action, result in simulations.items():
        if result["simulated_churn"] < lowest_churn:
            lowest_churn = result["simulated_churn"]
            best_action = action

    # Step 5: EXPLAIN - Generate reasoning
    reasons = []
    if risk_level == "HIGH":
        reasons.append(f"User has HIGH churn risk ({churn_risk * 100:.1f}%), requiring immediate intervention")
    elif risk_level == "MEDIUM":
        reasons.append(f"User has MEDIUM churn risk ({churn_risk * 100:.1f}%), proactive engagement recommended")
    else:
        reasons.append(f"User has LOW churn risk ({churn_risk * 100:.1f}%), standard monitoring sufficient")

    if request.complaints_count > 3:
        reasons.append(f"User has filed {request.complaints_count} complaints, indicating dissatisfaction")
    if request.payment_delay_count > 2:
        reasons.append(f"User has {request.payment_delay_count} payment delays, suggesting financial stress")
    if request.usage_score < 20:
        reasons.append(f"Low usage ({request.usage_score} sessions) indicates declining engagement")

    if best_action == "DISCOUNT":
        reasons.append("DISCOUNT action recommended: significantly reduces churn risk for high-risk users")
        reasons.append(f"Expected improvement: {simulations['DISCOUNT']['reduction_percentage']:.1f}% churn reduction")
    elif best_action == "EMAIL":
        reasons.append("EMAIL action recommended: provides gentle nudge for medium-risk users")
        reasons.append(f"Expected improvement: {simulations['EMAIL']['reduction_percentage']:.1f}% churn reduction")
    else:
        reasons.append("NO ACTION recommended: risk is low, monitoring sufficient")

    reason = " | ".join(reasons)

    from datetime import datetime
    timestamp = datetime.utcnow().isoformat()

    return AgentResponse(
        user_id=request.user_id,
        churn_risk=churn_risk,
        risk_level=risk_level,
        simulations=simulations,
        best_action=best_action,
        expected_churn=lowest_churn,
        reason=reason,
        timestamp=timestamp
    )

@app.get("/health")
def health():
    return {"status": "ok"}