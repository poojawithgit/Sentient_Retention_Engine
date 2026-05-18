import json
import requests
import time
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import RetentionState
from ..llm_provider import get_llm
from ..database import fetch_customer_data
from .utils import emit_telemetry

llm, LLM_AVAILABLE = get_llm()

def node_risk_analysis(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 1: RiskAnalysisAgent]
    Purpose: Detect churn probability and identify primary behavioral drivers behind customer risk.
    """
    customer_id = state.get("customer_id")
    emit_telemetry(state, "RiskAnalysisAgent", "ANALYSIS_STARTED", f"Analyzing risk for customer {customer_id}")
    
    # 1. Fetch real data from DB
    real_data = fetch_customer_data(customer_id)
    if not real_data:
        emit_telemetry(state, "RiskAnalysisAgent", "DATA_ERROR", "Failed to fetch customer data", {"customer_id": customer_id})
        return {"technical_failure": True}

    # 2. Map Baseline Data
    plan_tier = real_data.get("contract", "Month-to-month")
    usage_drop = state.get("usage_last_30d", 0) # Simplified usage drop metric
    
    # 3. Call XGBoost ML Service for Churn Score
    payload = {
        "user_id": customer_id,
        "usage": state.get("usage_last_30d", 0),
        "complaints": state.get("support_ticket_count", 0),
        "payment_delay": 1 if state.get("payment_status") != "Paid" else 0
    }
    
    try:
        response = requests.post("http://127.0.0.1:8001/predict", json=payload, timeout=5)
        churn_score = float(response.json().get("churn_risk", 0.5)) if response.status_code == 200 else 0.5
    except Exception as e:
        emit_telemetry(state, "RiskAnalysisAgent", "ML_ERROR", f"ML service call failed: {str(e)}")
        churn_score = 0.5

    # 4. Apply User's Risk Level Logic
    if churn_score > 0.85:
        risk_level = "CRITICAL"
    elif churn_score > 0.65:
        risk_level = "HIGH"
    elif churn_score > 0.40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # 5. Apply User's Driver Detection Logic
    primary_drivers = []
    
    # Logic from User: 
    # if usage_drop > 40% -> USAGE_DECLINE
    # if failed_payments >= 2 -> BILLING_ISSUE
    # if unresolved_tickets > 3 -> SUPPORT_FRICTION
    
    usage_drop_pct = state.get("usage_drop_percentage", 0) # Assume this is passed in state
    failed_payments = state.get("failed_payments_count", 0)
    unresolved_tickets = state.get("support_ticket_count", 0)

    if usage_drop_pct > 40:
        primary_drivers.append("USAGE_DECLINE")
    
    if failed_payments >= 2:
        primary_drivers.append("BILLING_ISSUE")
        
    if unresolved_tickets > 3:
        primary_drivers.append("SUPPORT_FRICTION")
    
    if not primary_drivers:
        primary_drivers.append("GENERAL_CHURN_RISK")

    result = {
        "risk_level": risk_level,
        "risk_score": churn_score,
        "primary_drivers": primary_drivers,
        "plan_tier": plan_tier,
        "raw_customer_data": real_data,
        "agent_telemetry": state.get("agent_telemetry", [])
    }
    
    emit_telemetry(state, "RiskAnalysisAgent", "ANALYSIS_COMPLETED", 
                   f"Risk Level: {risk_level} | Score: {churn_score:.2f}", 
                   {"drivers": primary_drivers})
    
    return result
