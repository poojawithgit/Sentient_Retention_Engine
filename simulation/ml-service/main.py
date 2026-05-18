from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import numpy as np
import joblib
import os
import time
from typing import Optional, List

from .config import settings
from .logger import logger
from .utils import (
    preprocess_single_request, 
    get_feature_names, 
    get_risk_level, 
    mock_predict
)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    debug=settings.DEBUG
)

# Global variables for model state
model = None
feature_names = None

class ChurnPredictionRequest(BaseModel):
    user_id: str
    usage: Optional[float] = None
    complaints: Optional[int] = None
    payment_delay: Optional[int] = None
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
    latency_ms: float

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = (time.time() - start_time) * 1000
    logger.info(f"Handled {request.method} {request.url.path}", extra={"duration_ms": duration})
    return response

def load_model_artifacts():
    global model, feature_names
    try:
        if os.path.exists(settings.model_path):
            model = joblib.load(settings.model_path)
            logger.info("ML model loaded successfully")
        else:
            logger.warning("ML model file not found, using mock logic")
            model = None

        feature_names = get_feature_names()
        if feature_names:
            logger.info(f"Loaded {len(feature_names)} feature names")
    except Exception as e:
        logger.error(f"Error loading model artifacts: {e}", exc_info=True)
        model = None

@app.on_event("startup")
async def startup_event():
    load_model_artifacts()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "model_loaded": model is not None,
        "feature_count": len(feature_names) if feature_names else 0
    }

@app.post("/predict", response_model=ChurnPredictionResponse)
async def predict_churn(request: ChurnPredictionRequest):
    start_time = time.time()
    try:
        if model is not None and feature_names:
            data_dict = request.model_dump()
            clean_data = {}
            for k, v in data_dict.items():
                if v is not None:
                    clean_k = k.replace('_', ' ') if ('InternetService' in k or 'PaymentMethod' in k) else k
                    clean_data[clean_k] = v

            input_df = preprocess_single_request(clean_data, feature_names)
            prediction = model.predict_proba(input_df)[0][1]
            churn_risk = round(float(prediction), 4)
        else:
            usage = request.usage if request.usage is not None else 25.0
            complaints = request.complaints if request.complaints is not None else 0
            payment_delay = request.payment_delay if request.payment_delay is not None else 0
            churn_risk = mock_predict(usage, complaints, payment_delay)

        risk_level = get_risk_level(churn_risk)
        duration_ms = (time.time() - start_time) * 1000

        return ChurnPredictionResponse(
            user_id=request.user_id,
            churn_risk=churn_risk,
            risk_level=risk_level,
            confidence=0.88,
            latency_ms=duration_ms
        )
    except Exception as e:
        logger.error(f"Prediction failed for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal prediction error")

@app.post("/train")
async def train_model():
    try:
        from .train import train_pipeline
        train_pipeline()
        load_model_artifacts()
        return {"status": "success", "message": "Model retrained successfully"}
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml-service.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
