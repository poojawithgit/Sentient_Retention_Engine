from langgraph.graph import StateGraph, START, END
from .state import RetentionState
from .nodes import (
    node_risk_analysis,
    node_strategy_planning,
    node_simulation,
    node_decision,
    node_governance,
    node_human_handoff,
    node_action_execution,
    node_feedback_learning
)

def build_workflow():
    workflow = StateGraph(RetentionState)
    
    # 1. Add all 9 specialized agents as nodes
    workflow.add_node("risk_analysis", node_risk_analysis)
    workflow.add_node("strategy_planning", node_strategy_planning)
    workflow.add_node("simulation", node_simulation)
    workflow.add_node("decision", node_decision)
    workflow.add_node("governance", node_governance)
    workflow.add_node("human_handoff", node_human_handoff)
    workflow.add_node("action_execution", node_action_execution)
    workflow.add_node("feedback_learning", node_feedback_learning)
    
    # 2. Linear Spine Edges (Analysis -> Planning -> Simulation -> Decision -> Governance)
    workflow.add_edge(START, "risk_analysis")
    workflow.add_edge("risk_analysis", "strategy_planning")
    workflow.add_edge("strategy_planning", "simulation")
    workflow.add_edge("simulation", "decision")
    workflow.add_edge("decision", "governance")
    
    # 3. Governance Conditional Routing (The Core Validation Layer)
    def route_governance(state: RetentionState) -> str:
        """
        Routes based on GovernanceEngine validation status.
        """
        if state.get("validation_passed"):
            return "approved"
        return "escalate"

    workflow.add_conditional_edges(
        "governance",
        route_governance,
        {
            "approved": "action_execution",
            "escalate": "human_handoff"
        }
    )
    
    # 4. Finalizing the process
    workflow.add_edge("action_execution", "feedback_learning")
    workflow.add_edge("human_handoff", "feedback_learning")
    
    # 5. Continuous Learning Loop / End
    workflow.add_edge("feedback_learning", END)
    
    return workflow.compile()
