from typing import Dict, Any, List, TypedDict, Optional

class RetentionState(TypedDict):
    # 1. Input Node Data
    customer_id: str
    plan_tier: str
    usage_last_30d: float
    billing_history: str
    support_ticket_count: int
    network_drop_events: int
    last_login: str
    payment_status: str
    
    # 2. Intent Summary Data
    summary: str
    likely_frustration: str
    signal_strength: str
    
    # 3. XGBoost Classifier Data
    churn_score: float
    driver: str # PRICE, QUALITY, CONTENT, UNKNOWN
    shap_features: List[str]
    
    # 4. RAG Data
    rag_context: str
    
    # 5. Routing State
    risk_lane: str # HIGH or LOW
    
    # 6. Loop & Simulation Data (High & Low Risk Lanes)
    simulation_iterations: int
    offers_tried: List[str]
    strategies_tried: List[str]
    responses: List[str]
    nps_scores: List[float]
    engagement_score: float
    clv: float
    
    # Downstream LLM Eval Data
    success_probability: float
    eval_reasoning: str
    
    # 7. Strategist Output
    final_action: str
    message: str
    bundle_details: str
    confidence: float
    
    # 8. Business Rules & Guardrails
    escalated_to_human: bool
    business_rules_passed: bool
    evaluation_passed: bool
    technical_failure: bool
    
    # 9. Output & Audit
    raw_customer_data: Optional[Dict[str, Any]]
    output_payload: Dict[str, Any]
    audit_log: List[Dict[str, Any]]
    loop_count: int
