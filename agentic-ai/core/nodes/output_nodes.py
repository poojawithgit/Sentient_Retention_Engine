from typing import Dict, Any
from ..state import RetentionState

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
    return {
        "audit_log": logs,
        "eval_reasoning": f"Audit log entry created for {state.get('customer_id')}.",
        "message": "Finalizing audit trail..."
    }

def node_final_output(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 19: Final Output")
    return {
        "eval_reasoning": "Pipeline execution successfully completed with optimal strategy.",
        "message": "Success! Strategy ready for deployment."
    }

def node_feedback_capture(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 20: Feedback Capture")
    current_loops = state.get("loop_count", 0)
    return {
        "loop_count": current_loops + 1,
        "eval_reasoning": f"Feedback loop {current_loops + 1} initiated. Re-evaluating strategy with new context.",
        "message": "Continuous refinement active..."
    }

def node_memory_high(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 9a: Memory Store (High)")
    return {
        "eval_reasoning": "Consolidated simulation history for high-risk strategy selection.",
        "message": "Analyzing simulation performance..."
    }

def node_memory_low(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 9b: Memory Store (Low)")
    return {
        "eval_reasoning": "Consolidated simulation history for engagement strategy selection.",
        "message": "Analyzing simulation performance..."
    }
