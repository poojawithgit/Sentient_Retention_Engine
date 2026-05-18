import time
from typing import Dict, Any, List
from ..state import RetentionState
from .utils import emit_telemetry

from ..governance_engine import governance_protected

@governance_protected("execute_approved_retention_workflows")
def node_action_execution(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 6: ActionExecutionAgent]
    Purpose: Executes the validated strategy (Email, SMS, API triggers).
    Now integrated with GovernanceEngine for final safety check.
    """
    strategy = state.get("selected_strategy", {})
    customer_id = state.get("customer_id")
    approval_status = state.get("approval_chain_status", "NONE")
    risk_score = state.get("action_risk_score", 0.0)
    
    # 1. Final Safety Gate
    # Only allow execution if validation passed OR if a human has explicitly approved a high-risk action
    is_approved = approval_status == "APPROVED"
    validation_passed = state.get("validation_passed", False)

    if not validation_passed and not is_approved:
        reason = "Governance validation failed and no human approval found."
        if approval_status == "PENDING":
            reason = "Awaiting human approval for high-risk action."
        
        emit_telemetry(state, "ActionExecutionAgent", "EXECUTION_BLOCKED", reason)
        return {"execution_status": "BLOCKED", "reason": reason}

    emit_telemetry(state, "ActionExecutionAgent", "EXECUTION_STARTED", 
                   f"Executing {strategy.get('name')} for {customer_id} | Risk Score: {risk_score:.2f}")
    
    # 2. Simulated Execution (Email/SMS/Discount)
    # In a real system, this would call external service adapters
    action_type = strategy.get("name", "GENERAL_RETENTION")
    
    emit_telemetry(state, "ActionExecutionAgent", "ACTION_TRIGGERED", f"{action_type} triggered successfully.")
    
    if "Discount" in action_type:
        emit_telemetry(state, "ActionExecutionAgent", "COUPON_GENERATED", "Dynamic 15% discount code created.")

    # 3. Construct execution payload for audit trail
    payload = {
        "customer_id": customer_id,
        "strategy_id": strategy.get("strategy_id"),
        "action": action_type,
        "risk_score": risk_score,
        "approval_status": approval_status,
        "is_automated": not is_approved,
        "execution_timestamp": time.time()
    }
    
    emit_telemetry(state, "ActionExecutionAgent", "EXECUTION_COMPLETED", 
                   "Final action successfully executed and recorded in the audit ledger.")
    
    return {
        "final_action": action_type,
        "execution_payload": payload,
        "execution_status": "SUCCESS",
        "agent_telemetry": state.get("agent_telemetry", [])
    }

@governance_protected("analyze_feedback")
def node_feedback_learning(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 9: FeedbackLearningAgent]
    Purpose: Closes the loop by learning from outcome data.
    """
    emit_telemetry(state, "FeedbackLearningAgent", "LEARNING_STARTED", "Capturing execution metrics for continuous improvement.")
    
    # Capture metrics for the learning loop
    metrics = {
        "customer_id": state.get("customer_id"),
        "risk_level": state.get("risk_level"),
        "strategy_selected": state.get("final_action"),
        "predicted_success": state.get("decision_confidence"),
        "timestamp": time.time()
    }
    
    emit_telemetry(state, "FeedbackLearningAgent", "LEARNING_COMPLETED", 
                   "Metrics captured for model retraining.")
    
    return {
        "feedback_metrics": metrics,
        "agent_telemetry": state.get("agent_telemetry", [])
    }
