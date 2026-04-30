from typing import Dict, Any
import json
import os
from .state import RetentionState
from dotenv import load_dotenv

load_dotenv()

try:
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage
    # Initialize Groq LLM
    llm = ChatGroq(model_name="llama-3.1-8b-instant")
    LLM_AVAILABLE = True
except Exception as e:
    print(f"Warning: Groq LLM initialization failed: {e}")
    LLM_AVAILABLE = False

# ---------------------------------------------------------
# Node 1: Input (Trigger)
# ---------------------------------------------------------
def node_input(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 1: Input Triggered")
    # In a real scenario, this might fetch from a DB using state['customer_id']
    # For now, we just pass through or initialize defaults
    return {
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
        "clv": 500.0 # Example CLV
    }

# ---------------------------------------------------------
# Node 2: Intent Summary (LLM)
# ---------------------------------------------------------
def node_intent_summary(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 2: Intent Summary")
    
    if LLM_AVAILABLE:
        try:
            sys_msg = SystemMessage(content="You are an expert customer intent analyzer. Analyze the customer profile and provide a brief JSON containing 'summary', 'likely_frustration', and 'signal_strength'. Output ONLY JSON.")
            human_msg = HumanMessage(content=f"Customer ID: {state.get('customer_id')}\nPlan: {state.get('plan_tier')}\nSupport Tickets: {state.get('support_ticket_count')}\nPayment: {state.get('payment_status')}\nNetwork Drops: {state.get('network_drop_events')}")
            res = llm.invoke([sys_msg, human_msg])
            
            # Simple json parsing 
            content = res.content
            # extract json block if exists
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
                
            parsed = json.loads(content.strip())
            return {
                "summary": parsed.get("summary", "Summary not found"),
                "likely_frustration": parsed.get("likely_frustration", "Unknown"),
                "signal_strength": parsed.get("signal_strength", "Medium")
            }
        except Exception as e:
            print(f"LLM parsing failed: {e}, falling back to mock")
            
    # Mock fallback
    return {
        "summary": "Customer is frustrated by repeated payment failures and poor network quality in their area.",
        "likely_frustration": "Network reliability drops during peak hours.",
        "signal_strength": "High"
    }

# ---------------------------------------------------------
# Node 4: XGBoost Classifier (Mock)
# ---------------------------------------------------------
def node_classifier(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 4: XGBoost Classifier")
    # Mocking XGBoost
    # Let's say if complaints > 0, churn is higher
    complaints = state.get('support_ticket_count', 0)
    churn_score = 0.82 if complaints > 0 else 0.41
    driver = "QUALITY" if churn_score > 0.6 else "PRICE"
    
    return {
        "churn_score": churn_score,
        "driver": driver,
        "shap_features": ["network_drop_events", "support_ticket_count", "payment_status"]
    }

# ---------------------------------------------------------
# Node 3: Knowledge Retrieval (RAG)
# ---------------------------------------------------------
def node_rag(state: RetentionState) -> Dict[str, Any]:
    print(f"[NODE] 3: Knowledge Retrieval (Driver: {state.get('driver')})")
    # Mocking Pinecone retrieval based on driver
    driver = state.get('driver', 'UNKNOWN')
    if driver == "QUALITY":
        rag_context = "Playbook: For quality issues, offer network-self-heal diagnostics and priority support."
    elif driver == "PRICE":
        rag_context = "Playbook: For price sensitivity, offer 20% discount on next 3 billing cycles."
    else:
        rag_context = "Playbook: General retention strategies."
        
    return {"rag_context": rag_context}

# ---------------------------------------------------------
# Node 5: Condition (Routing happens in workflow edges, this is a pass-through)
# ---------------------------------------------------------
# We will just define a routing function for the graph later.

# ---------------------------------------------------------
# HIGH RISK LANE
# ---------------------------------------------------------
def node_digital_twin_sim(state: RetentionState) -> Dict[str, Any]:
    print(f"[NODE] 6a: Digital Twin Sim (Iter: {state.get('simulation_iterations', 0)})")
    iters = state.get('simulation_iterations', 0) + 1
    
    response = "reject: need better offer"
    if iters >= 2:
        response = "accept"
        
    if LLM_AVAILABLE:
        try:
            offer_context = "None"
            if state.get('offers_tried'):
                offer_context = state.get('offers_tried')[-1]
                
            sys_msg = SystemMessage(content="You are a digital twin of a frustrated telco customer. You are evaluating a retention offer. Respond with either 'accept' or 'reject: <reason>'. Keep it short.")
            human_msg = HumanMessage(content=f"You are on iteration {iters}. The telco is offering you: {offer_context}. Will you stay with the company?")
            res = llm.invoke([sys_msg, human_msg])
            response = res.content.strip().lower()
            if "accept" in response:
                response = "accept"
            else:
                response = f"reject: {response}"
        except Exception as e:
            print(f"LLM simulation failed: {e}, falling back to mock")
    
    responses = state.get('responses', [])
    responses.append(response)
    
    return {
        "simulation_iterations": iters,
        "responses": responses
    }

def node_retention_offer_tool(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 7a: Retention Offer API Tool")
    driver = state.get('driver', 'PRICE')
    
    # Mocking the webhook calls
    if driver == "PRICE":
        offer = f"20% Discount (Attempt {state.get('simulation_iterations')})"
    elif driver == "QUALITY":
        offer = f"Network Priority Pass (Attempt {state.get('simulation_iterations')})"
    else:
        offer = f"Standard Bundle (Attempt {state.get('simulation_iterations')})"
        
    offers = state.get('offers_tried', [])
    offers.append(offer)
    return {"offers_tried": offers}

def node_impact_eval_high(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 8a: Impact Eval (High)")
    # Mocking evaluation
    prob = min(0.4 + (state.get('simulation_iterations', 1) * 0.2), 0.95)
    return {
        "success_probability": prob,
        "eval_reasoning": "Offer becomes more compelling with iteration."
    }

def node_memory_high(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 9a: Memory Store (High)")
    # Memory simply aggregates what we already appended to lists
    return {}

# ---------------------------------------------------------
# LOW RISK LANE
# ---------------------------------------------------------
def node_nurture_sim(state: RetentionState) -> Dict[str, Any]:
    print(f"[NODE] 6b: Nurture Sim (Iter: {state.get('simulation_iterations', 0)})")
    iters = state.get('simulation_iterations', 0) + 1
    
    nps_scores = state.get('nps_scores', [])
    nps_scores.append(7.0 + iters) # Mock increasing NPS
    
    return {
        "simulation_iterations": iters,
        "nps_scores": nps_scores
    }

def node_engagement_api(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 7b: Engagement API Tool")
    strategies = ["Loyalty bonus", "Content recommendation", "Plan upgrade nudge"]
    idx = (state.get('simulation_iterations', 1) - 1) % len(strategies)
    strat = strategies[idx]
    
    strats = state.get('strategies_tried', [])
    strats.append(strat)
    return {"strategies_tried": strats}

def node_impact_eval_low(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 8b: Impact Eval (Low)")
    prob = 0.85
    return {
        "success_probability": prob,
        "eval_reasoning": "Engagement strategy is highly likely to boost NPS."
    }

def node_memory_low(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 9b: Memory Store (Low)")
    return {}

# ---------------------------------------------------------
# DOWNSTREAM
# ---------------------------------------------------------
def node_strategist(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 11: Strategist")
    
    offers_tried = state.get('offers_tried', [])
    strategies_tried = state.get('strategies_tried', [])
    
    last_action = "None"
    if offers_tried:
        last_action = offers_tried[-1]
    elif strategies_tried:
        last_action = strategies_tried[-1]
        
    action = last_action
    message = f"Hello, we value you. Here is a {action}."
    
    if LLM_AVAILABLE:
        try:
            sys_msg = SystemMessage(content="You are the lead retention strategist. Based on the selected action, draft a short, highly personalized message to the customer (max 2 sentences).")
            human_msg = HumanMessage(content=f"Action chosen: {action}\nCustomer Summary: {state.get('summary')}")
            res = llm.invoke([sys_msg, human_msg])
            message = res.content.strip()
        except Exception as e:
            print(f"LLM messaging failed: {e}")
            
    return {
        "final_action": action,
        "message": message,
        "confidence": state.get("success_probability", 0.8)
    }

def node_business_rules(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 12: Business Rules")
    # Hardcoded rules: e.g. discount cap
    action = state.get('final_action', '')
    conf = state.get('confidence', 1.0)
    driver = state.get('driver', 'UNKNOWN')
    iters = state.get('simulation_iterations', 0)
    
    passed = True
    if conf < 0.5 or driver == "UNKNOWN" or iters >= 3:
        passed = False
        
    return {"business_rules_passed": passed}

def node_human_handoff(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 14: Human Handoff (Escalation)")
    return {
        "escalated_to_human": True,
        "final_action": "ESCALATED TO AGENT",
        "message": "Please wait while we connect you to an agent."
    }

def node_evaluator(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 15: Evaluator / ROI Critic")
    # Mocking ROI check
    # Let's say if it's the second retry, it might fail technical or ROI
    return {"evaluation_passed": True, "technical_failure": False}

def node_retry_fallback(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 16: Retry / Fallback")
    return {"final_action": "Conservative Fallback Offer"}

def node_override_code(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 17: Override Code")
    return {"final_action": "SAFE FALLBACK"}

def node_output_formatter(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 13: Output Formatter")
    payload = {
        "customer_id": state.get("customer_id"),
        "action_taken": state.get("final_action"),
        "confidence": state.get("confidence"),
        "reasoning": state.get("eval_reasoning")
    }
    return {"output_payload": payload}

def node_audit_log(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 18: Audit Log")
    log = {
        "customer_id": state.get("customer_id"),
        "action": state.get("final_action"),
        "escalated": state.get("escalated_to_human")
    }
    logs = state.get("audit_log", [])
    logs.append(log)
    return {"audit_log": logs}

def node_final_output(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 19: Final Output")
    # Final delivery formatting
    return {}

def node_feedback_capture(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 20: Feedback Capture")
    return {}
