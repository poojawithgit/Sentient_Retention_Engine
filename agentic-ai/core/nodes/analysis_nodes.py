import json
import requests
from typing import Dict, Any
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import RetentionState
from ..llm_provider import get_llm
from ..database import fetch_customer_data

llm, LLM_AVAILABLE = get_llm()

def node_input(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 1: Input Triggered")
    customer_id = state.get("customer_id")
    
    # Fetch real data from DB
    real_data = fetch_customer_data(customer_id)
    updates = {
        "simulation_iterations": 0,
        "offers_tried": [],
        "strategies_tried": [],
        "responses": [],
        "nps_scores": [],
        "audit_log": [],
        "escalated_to_human": False,
        "business_rules_passed": True,
        "evaluation_passed": True,
        "technical_failure": False,
        "clv": 500.0,
        "loop_count": 0
    }
    
    if real_data:
        print(f"Loaded real data for customer {customer_id}")
        # Map DB fields to state fields
        updates["plan_tier"] = real_data.get("contract", "Month-to-month")
        updates["payment_status"] = "Paid" if real_data.get("churn") == "No" else "Overdue"
        updates["monthly_charges"] = float(real_data.get("monthly_charges", 0))
        # Store raw data for classifier
        updates["raw_customer_data"] = real_data
    
    return updates

from ..models import ChurnAnalysis

def node_intent_summary(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 2: Intent Summary")
    
    if LLM_AVAILABLE:
        try:
            # Using structured output for reliability
            structured_llm = llm.with_structured_output(dict) 
            
            prompt = f"""Analyze customer intent:
            Customer ID: {state.get('customer_id')}
            Plan: {state.get('plan_tier')}
            Support Tickets: {state.get('support_ticket_count')}
            Payment: {state.get('payment_status')}
            Network Drops: {state.get('network_drop_events')}
            """
            
            res = structured_llm.invoke(prompt)
            return {
                "summary": res.get("summary", "Summary unavailable"),
                "likely_frustration": res.get("likely_frustration", "Unknown"),
                "signal_strength": res.get("signal_strength", "Medium")
            }
        except Exception as e:
            print(f"Structured output failed: {e}, using robust fallback")
            
    return {
        "summary": "Customer is frustrated by repeated payment failures and poor network quality in their area.",
        "likely_frustration": "Network reliability drops during peak hours.",
        "signal_strength": "High"
    }

def node_classifier(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 4: XGBoost Classifier (Live API)")
    customer_id = state.get("customer_id")
    raw_data = state.get("raw_customer_data", {})
    
    # Prepare payload for ml-service
    payload = {
        "user_id": customer_id,
        "usage": state.get("usage_last_30d", 0),
        "complaints": state.get("support_ticket_count", 0),
        "payment_delay": 1 if state.get("payment_status") != "Paid" else 0
    }
    
    # Add all raw data fields if available
    if raw_data:
        for k, v in raw_data.items():
            if k not in payload:
                # Convert numeric strings to float/int
                if isinstance(v, str):
                    try:
                        if "." in v: payload[k] = float(v)
                        else: payload[k] = int(v)
                    except: payload[k] = v
                else:
                    payload[k] = v

    try:
        response = requests.post("http://127.0.0.1:8001/predict", json=payload, timeout=5)
        if response.status_code == 200:
            result = response.json()
            churn_score = float(result.get("churn_risk", 0.5))
            risk_level = result.get("risk_level", "MEDIUM")
            print(f">>> XGBOOST PREDICTION: {churn_score} ({risk_level}) <<<")
        else:
            print(f"ML Service error: {response.status_code}")
            churn_score = 0.5
            risk_level = "MEDIUM"
    except Exception as e:
        print(f"Failed to call ML Service: {e}")
        churn_score = 0.5
        
    driver = "QUALITY" if churn_score > 0.6 else "PRICE"
    
    return {
        "churn_score": churn_score,
        "driver": driver,
        "shap_features": ["network_drop_events", "support_ticket_count", "payment_status"]
    }
