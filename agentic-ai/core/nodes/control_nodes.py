from typing import Dict, Any
from ..state import RetentionState
from ..llm_provider import get_llm
from ..models import BusinessRuleCheck

llm, LLM_AVAILABLE = get_llm()

def node_business_rules(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 12: Business Rules")
    
    if LLM_AVAILABLE:
        try:
            structured_llm = llm.with_structured_output(BusinessRuleCheck)
            
            prompt = f"""Review the proposed retention strategy:
            Proposed Action: {state.get('final_action')}
            Confidence: {state.get('confidence')}
            Iterations: {state.get('simulation_iterations')}
            Reasoning: {state.get('message')}
            
            Check against rules:
            1. No more than 3 iterations.
            2. Confidence must be > 0.5.
            3. Must be aligned with risk driver: {state.get('driver')}
            """
            
            check = structured_llm.invoke(prompt)
            print(f"Business Rule Check: {check.passed} - Violations: {check.violations}")
            
            # If rules fail OR human is explicitly required, flag it
            passed = check.passed and not check.requires_human
            return {"business_rules_passed": passed}
        except Exception as e:
            print(f"Structured business rule check failed: {e}, using basic logic")

    # Basic Fallback Logic
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
    return {"evaluation_passed": True, "technical_failure": False}

def node_retry_fallback(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 16: Retry / Fallback")
    return {"final_action": "Conservative Fallback Offer"}

def node_override_code(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 17: Override Code")
    return {"final_action": "SAFE FALLBACK"}
