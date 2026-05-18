import time
from typing import Dict, Any, List
from ..state import RetentionState
from ..llm_provider import get_llm
from ..models import BusinessRuleCheck
from .utils import emit_telemetry
from ..database import create_retention_action, create_agent_memory
from ..governance_engine import SecurityValidator, CompositeRiskModel

llm, LLM_AVAILABLE = get_llm()

def node_governance(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 5: GovernanceEngine]
    Purpose: Validate selected strategy against confidence, ROI, business policy, and risk thresholds.
    Enhanced with Security Enforcement Layer.
    """
    strategy = state.get("selected_strategy", {})
    action_name = strategy.get("name", "UNKNOWN_ACTION")
    confidence = state.get("decision_confidence", 0)
    risk_level = state.get("risk_level", "MEDIUM")
    
    emit_telemetry(state, "GovernanceEngine", "VALIDATION_STARTED", 
                   f"Initiating validation layer for {action_name} | Risk: {risk_level}")
    
    # 1. Advanced Risk Scoring (Composite Model)
    # Using 'DecisionAgent' as the acting agent context for the decision node
    risk_score = CompositeRiskModel.calculate_score(state, action_name, confidence, "DecisionAgent")
    state["action_risk_score"] = risk_score
    
    # 2. Security & Permission Validation
    validation = SecurityValidator.validate_action("DecisionAgent", action_name, state)
    
    violations = []
    if validation["status"] == "DENIED":
        violations.append(f"SECURITY_DENIAL: {validation['reason']}")
    elif validation["status"] == "PAUSED":
        violations.append(f"APPROVAL_REQUIRED: {validation['reason']}")

    # 3. Legacy Policy Checks (ROI, Confidence)
    target_confidence = 0.90 if risk_level == "CRITICAL" else 0.80
    if confidence < target_confidence:
        violations.append(f"CONFIDENCE_UNDER_THRESHOLD: {confidence:.2f} < {target_confidence}")
    
    passed = len(violations) == 0 and validation["status"] == "ALLOWED"
    
    # Handle Approval Chain Trigger
    approval_status = "NONE"
    if validation["status"] == "PAUSED":
        approval_status = "PENDING"
        emit_telemetry(state, "GovernanceEngine", "APPROVAL_CHAIN_TRIGGERED", 
                       f"Action {action_name} requires specialist review. Risk Score: {risk_score}")

    validation_status = "VALIDATION_PASSED" if passed else "VALIDATION_FAILED"
    message = "Governance Clearance Granted" if passed else f"Governance Constraint: {violations[0] if violations else 'Validation Failed'}"
    
    # Enrich metadata for the dashboard
    governance_metadata = {
        "confidence": f"{confidence*100:.1f}%",
        "risk_score": risk_score,
        "security_status": validation["status"],
        "approval_status": approval_status,
        "violations": violations
    }

    emit_telemetry(state, "GovernanceEngine", validation_status, message, governance_metadata)

    return {
        "validation_passed": passed,
        "action_risk_score": risk_score,
        "approval_chain_status": approval_status,
        "policy_violations": violations,
        "governance_report": {
            "status": "APPROVED" if passed else "REJECTED_OR_PAUSED",
            "violations": violations,
            "timestamp": time.time(),
            "risk_score": risk_score,
            "metadata": governance_metadata
        },
        "agent_telemetry": state.get("agent_telemetry", [])
    }

def node_human_handoff(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 7: HumanHandoffAgent]
    Purpose: Bridges AI uncertainty with specialist intervention by persisting cases to the management queue.
    """
    customer_id = state.get("customer_id")
    risk_score = state.get("risk_score", 0.5)
    violations = state.get("policy_violations", [])
    reason = violations[0] if violations else "Low AI confidence / ROI threshold fail"
    
    emit_telemetry(state, "HumanHandoffAgent", "ESCALATION_TRIGGERED", 
                   f"Escalating customer {customer_id} to human specialist. Reason: {reason}")
    
    # Persist the escalation to the database for the Admin Dashboard
    # This creates a 'pending' record in retention_actions that specialists can 'claim'
    escalation_id = create_retention_action(customer_id, "ESCALATION", "pending")
    
    # Record in agent memory
    create_agent_memory(
        customer_id=customer_id,
        action="HUMAN_INTERVENTION",
        result="escalated",
        churn_risk=risk_score,
        reason=f"Governance Failure: {reason}. Manual review required."
    )
    
    return {
        "status": "HANDOFF_COMPLETE",
        "specialist_queue_id": f"SQ-{escalation_id}" if escalation_id else "PENDING_QUEUE",
        "handoff_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "escalated_to_human": True,
        "human_status": "PENDING",
        "escalation_id": str(escalation_id) if escalation_id else None,
        "escalation_reason": reason,
        "final_action": "HUMAN_REVIEW_REQUIRED",
        "message": f"ESCALATION_SUCCESS: Case {escalation_id or 'NEW'} added to Specialist Queue. Reason: {reason}",
        "agent_telemetry": state.get("agent_telemetry", [])
    }
