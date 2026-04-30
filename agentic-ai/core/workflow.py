from langgraph.graph import StateGraph, START, END
from .state import RetentionState
from .nodes import (
    node_input, node_intent_summary, node_classifier, node_rag,
    node_digital_twin_sim, node_retention_offer_tool, node_impact_eval_high, node_memory_high,
    node_nurture_sim, node_engagement_api, node_impact_eval_low, node_memory_low,
    node_strategist, node_business_rules, node_human_handoff, node_output_formatter,
    node_evaluator, node_retry_fallback, node_override_code, node_audit_log,
    node_final_output, node_feedback_capture
)

def build_workflow():
    workflow = StateGraph(RetentionState)
    
    # 1. Add all nodes
    workflow.add_node("input", node_input)
    workflow.add_node("intent_summary", node_intent_summary)
    workflow.add_node("classifier", node_classifier)
    workflow.add_node("rag", node_rag)
    
    # High Risk Nodes
    workflow.add_node("digital_twin_sim", node_digital_twin_sim)
    workflow.add_node("retention_offer_tool", node_retention_offer_tool)
    workflow.add_node("impact_eval_high", node_impact_eval_high)
    workflow.add_node("memory_high", node_memory_high)
    
    # Low Risk Nodes
    workflow.add_node("nurture_sim", node_nurture_sim)
    workflow.add_node("engagement_api", node_engagement_api)
    workflow.add_node("impact_eval_low", node_impact_eval_low)
    workflow.add_node("memory_low", node_memory_low)
    
    # Downstream Nodes
    workflow.add_node("strategist", node_strategist)
    workflow.add_node("business_rules", node_business_rules)
    workflow.add_node("output_formatter", node_output_formatter)
    workflow.add_node("human_handoff", node_human_handoff)
    
    workflow.add_node("evaluator", node_evaluator)
    workflow.add_node("retry_fallback", node_retry_fallback)
    workflow.add_node("override_code", node_override_code)
    
    workflow.add_node("audit_log", node_audit_log)
    workflow.add_node("final_output", node_final_output)
    workflow.add_node("feedback_capture", node_feedback_capture)
    
    # 2. Main Spine Edges
    workflow.add_edge(START, "input")
    workflow.add_edge("input", "intent_summary")
    workflow.add_edge("intent_summary", "classifier")
    workflow.add_edge("classifier", "rag")
    
    # 3. Conditional Routing Function (Node 5)
    def route_risk(state: RetentionState) -> str:
        score = state.get("churn_score", 0.5)
        if score > 0.65:
            return "high_risk"
        return "low_risk"

    workflow.add_conditional_edges(
        "rag",
        route_risk,
        {
            "high_risk": "digital_twin_sim",
            "low_risk": "nurture_sim"
        }
    )
    
    # 4. Lane Edges (6 -> 7 -> 8)
    # High Risk Lane: 6a -> 7a -> 8a
    workflow.add_edge("digital_twin_sim", "retention_offer_tool")
    workflow.add_edge("retention_offer_tool", "impact_eval_high")
    
    def high_risk_loop_condition(state: RetentionState) -> str:
        iters = state.get("simulation_iterations", 0)
        responses = state.get("responses", [])
        if responses and "accept" in responses[-1]:
            return "end_loop"
        if iters >= 3:
            return "end_loop"
        return "continue_loop"

    workflow.add_conditional_edges(
        "impact_eval_high",
        high_risk_loop_condition,
        {
            "continue_loop": "digital_twin_sim",
            "end_loop": "memory_high"
        }
    )
    
    # 5. Low Risk Lane: 6b -> 7b -> 8b
    workflow.add_edge("nurture_sim", "engagement_api")
    workflow.add_edge("engagement_api", "impact_eval_low")
    
    def low_risk_loop_condition(state: RetentionState) -> str:
        iters = state.get("simulation_iterations", 0)
        if iters >= 3:
            return "end_loop"
        return "continue_loop"
        
    workflow.add_conditional_edges(
        "impact_eval_low",
        low_risk_loop_condition,
        {
            "continue_loop": "nurture_sim",
            "end_loop": "memory_low"
        }
    )
    
    # 6. Rejoin Downstream
    workflow.add_edge("memory_high", "strategist")
    workflow.add_edge("memory_low", "strategist")
    workflow.add_edge("strategist", "business_rules")
    
    # 7. Business Rules Conditional
    def route_business_rules(state: RetentionState) -> str:
        if state.get("business_rules_passed"):
            return "pass"
        return "human"
        
    workflow.add_conditional_edges(
        "business_rules",
        route_business_rules,
        {
            "pass": "audit_log",
            "human": "human_handoff"
        }
    )
    
    workflow.add_edge("audit_log", "evaluator")
    workflow.add_edge("human_handoff", "final_output")
    
    # 8. Evaluator / ROI Critic Conditional
    def route_evaluator(state: RetentionState) -> str:
        if state.get("technical_failure"):
            return "sys_err"
        if state.get("evaluation_passed"):
            return "pass"
        return "fail"
        
    workflow.add_conditional_edges(
        "evaluator",
        route_evaluator,
        {
            "pass": "output_formatter",
            "fail": "retry_fallback",
            "sys_err": "override_code"
        }
    )
    
    # 9. Retry Fallback Logic
    workflow.add_edge("retry_fallback", "human_handoff")
    
    # 10. Override and Output Endpoints
    workflow.add_edge("override_code", "final_output")
    workflow.add_edge("output_formatter", "final_output")
    workflow.add_edge("final_output", "feedback_capture")
    
    def route_feedback(state: RetentionState):
        if state.get("loop_count", 0) < 2:  # Allow up to 2 loops for refinement
            print(f"[LOOP] Re-entering classifier (Loop {state.get('loop_count')})")
            return "classifier"
        return "end"

    workflow.add_conditional_edges(
        "feedback_capture",
        route_feedback,
        {
            "classifier": "classifier",
            "end": END
        }
    )
    
    return workflow.compile()
