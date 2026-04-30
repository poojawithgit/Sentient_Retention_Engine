from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

app = FastAPI(title="Prediction Service", version="1.0.0")

# Load model (assuming it's trained)
try:
    model = joblib.load('models/churn_model.pkl')
    scaler = StandardScaler()  # Assuming scaler is fitted during training
except:
    model = None
    scaler = None

class PredictionRequest(BaseModel):
    user_id: str
    usage_score: float
    complaints_count: int
    payment_delay_count: int

class PredictionResponse(BaseModel):
    user_id: str
    churn_risk: float
    risk_level: str
    confidence: float = 0.85

@app.get("/")
def read_root():
    return {"message": "Prediction Service Running"}

@app.post("/predict", response_model=PredictionResponse)
def predict_churn(request: PredictionRequest):
    if model is None:
        # Mock prediction if model not loaded
        risk = min(1.0, 0.2 + request.usage_score * 0.1 + request.complaints_count * 0.15 + request.payment_delay_count * 0.08)
        risk_level = "HIGH" if risk > 0.7 else "MEDIUM" if risk > 0.4 else "LOW"
        return PredictionResponse(
            user_id=request.user_id,
            churn_risk=risk,
            risk_level=risk_level
        )

    # Prepare features
    features = np.array([[request.usage_score, request.complaints_count, request.payment_delay_count]])
    if scaler:
        features = scaler.transform(features)

    # Predict
    risk = float(model.predict_proba(features)[0][1])
    risk_level = "HIGH" if risk > 0.7 else "MEDIUM" if risk > 0.4 else "LOW"

    return PredictionResponse(
        user_id=request.user_id,
        churn_risk=risk,
        risk_level=risk_level
    )

@app.get("/health")
def health():
    return {"status": "ok"}