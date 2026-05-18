from typing import Dict, Any, List, TypedDict, Optional

class RetentionState(TypedDict):
    # 1. Base Input Data
    customer_id: str
    plan_tier: str
    usage_last_30d: float
    billing_history: str
    support_ticket_count: int
    network_drop_events: int
    last_login: str
    payment_status: str
    
    # 2. RiskAnalysisAgent Output
    risk_level: str  # CRITICAL, HIGH, MEDIUM, LOW
    risk_score: float
    primary_drivers: List[str]
    
    # 3. StrategyPlanningAgent Output
    strategy_candidates: List[Dict[str, Any]]
    rag_context: str
    
    # 4. SimulationAgent Output
    simulation_results: List[Dict[str, Any]]
    engagement_score_forecast: float
    clv_impact: float
    
    # 5. DecisionAgent Output
    selected_strategy: Dict[str, Any]
    decision_confidence: float
    decision_reasoning: str
    
    # 6. GovernanceEngine Output
    governance_report: Dict[str, Any]
    validation_passed: bool
    policy_violations: List[str]
    roi_check: bool
    
    # 7. ActionGenerationAgent Output
    final_action: str
    message: str
    bundle_details: str
    output_payload: Dict[str, Any]
    
    # 8. HumanHandoffAgent State
    escalated_to_human: bool
    escalation_reason: str
    human_status: str  # PENDING, CLAIMED, RESOLVED
    specialist_notes: Optional[str]
    
    # 9. Observability & Learning
    agent_telemetry: List[Dict[str, Any]]  # Granular events for the dashboard
    feedback_metrics: Optional[Dict[str, Any]]
    audit_log: List[Dict[str, Any]]
    
    # 10. Governance & Security Enforcement
    agent_trust_level: float
    action_risk_score: float
    approval_chain_status: str  # NONE, PENDING, APPROVED, REJECTED
    governance_logs: List[Dict[str, Any]]
    
    # Execution Metadata
    technical_failure: bool
    loop_count: int
    raw_customer_data: Optional[Dict[str, Any]]
