from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import joblib
import os
from typing import Optional, List
import pandas as pd
from utils import preprocess_single_request, get_feature_names

app = FastAPI(title="Churn Prediction ML Service", version="1.0.0")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "churn_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "models", "scaler.pkl")

model = None
feature_names = None

# Fallback scaler (kept for compatibility)
scaler = None


class ChurnPredictionRequest(BaseModel):
    user_id: str
    # Original limited fields for backward compatibility/simplicity
    usage: Optional[float] = None
    complaints: Optional[int] = None
    payment_delay: Optional[int] = None
    
    # Detailed telco fields (all optional to allow partial data)
    gender: Optional[int] = None
    SeniorCitizen: Optional[int] = None
    Partner: Optional[int] = None
    Dependents: Optional[int] = None
    tenure: Optional[int] = None
    PhoneService: Optional[int] = None
    MultipleLines: Optional[int] = None
    OnlineSecurity: Optional[int] = None
    OnlineBackup: Optional[int] = None
    DeviceProtection: Optional[int] = None
    TechSupport: Optional[int] = None
    StreamingTV: Optional[int] = None
    StreamingMovies: Optional[int] = None
    Contract: Optional[int] = None
    PaperlessBilling: Optional[int] = None
    MonthlyCharges: Optional[float] = None
    TotalCharges: Optional[float] = None
    InternetService_Fiber_optic: Optional[int] = None
    InternetService_No: Optional[int] = None
    PaymentMethod_Credit_card_automatic: Optional[int] = None
    PaymentMethod_Electronic_check: Optional[int] = None
    PaymentMethod_Mailed_check: Optional[int] = None


class ChurnPredictionResponse(BaseModel):
    user_id: str
    churn_risk: float
    risk_level: str
    confidence: Optional[float] = None


def load_model():
    global model, feature_names
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print("Model loaded successfully")
        else:
            print("Model file not found, using mock prediction")
            model = None

        feature_names = get_feature_names()
        if feature_names:
            print(f"Loaded {len(feature_names)} feature names")
    except Exception as e:
        print(f"Error loading model artifacts: {e}")
        model = None


def mock_predict(usage: float, complaints: int, payment_delay: int) -> float:
    """
    Mock prediction based on business logic:
    - Low usage (< 20) increases churn risk
    - High complaints increases churn risk significantly
    - Payment delays increase churn risk
    """
    base_risk = 0.2

    # Usage factor (lower usage = higher risk)
    if usage < 10:
        usage_factor = 0.4
    elif usage < 20:
        usage_factor = 0.2
    elif usage < 50:
        usage_factor = 0.0
    else:
        usage_factor = -0.1

    # Complaints factor (significant impact)
    complaints_factor = complaints * 0.15

    # Payment delay factor
    payment_factor = payment_delay * 0.08

    # Calculate risk
    risk = base_risk + usage_factor + complaints_factor + payment_factor
    risk = max(0.0, min(1.0, risk))  # Clamp to 0-1

    return round(risk, 4)


def get_risk_level(risk: float) -> str:
    if risk < 0.4:
        return "LOW"
    elif risk < 0.7:
        return "MEDIUM"
    else:
        return "HIGH"


@app.on_event("startup")
async def startup_event():
    load_model()


@app.get("/")
async def root():
    return {
        "message": "Sentient Retention Engine - ML Service is running",
        "endpoints": ["/health", "/predict", "/train"],
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}


@app.post("/predict", response_model=ChurnPredictionResponse)
async def predict_churn(request: ChurnPredictionRequest):
    try:
        if model is not None and feature_names:
            # Prepare data for preprocessing
            data_dict = request.model_dump()
            
            # Map Pydantic underscore names to pandas dummy names if needed
            # (Fiber_optic -> Fiber optic, etc.)
            clean_data = {}
            for k, v in data_dict.items():
                if v is not None:
                    clean_k = k.replace('_', ' ') if 'InternetService' in k or 'PaymentMethod' in k else k
                    clean_data[clean_k] = v

            # Preprocess
            input_df = preprocess_single_request(clean_data, feature_names)
            
            # Predict
            prediction = model.predict_proba(input_df)[0][1]
            churn_risk = round(float(prediction), 4)
        else:
            # Use mock prediction
            usage = request.usage if request.usage is not None else 25.0
            complaints = request.complaints if request.complaints is not None else 0
            payment_delay = request.payment_delay if request.payment_delay is not None else 0
            
            churn_risk = mock_predict(usage, complaints, payment_delay)

        risk_level = get_risk_level(churn_risk)

        return ChurnPredictionResponse(
            user_id=request.user_id,
            churn_risk=churn_risk,
            risk_level=risk_level,
            confidence=0.88,
        )

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/train")
async def train_model():
    """
    Train a new model using the ingestion pipeline and the CSV data
    """
    try:
        from train import train_pipeline
        train_pipeline()
        load_model()
        return {"status": "success", "message": "Model trained successfully from telco dataset"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
