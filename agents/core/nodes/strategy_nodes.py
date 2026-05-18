import json
import time
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import RetentionState
from ..llm_provider import get_llm
from ..models import RetentionStrategy
from .utils import emit_telemetry
from ..governance_policy import HARDCODED_POLICIES

llm, LLM_AVAILABLE = get_llm()

from ..governance_engine import governance_protected

@governance_protected("generate_strategies")
def node_strategy_planning(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 2: StrategyPlanningAgent]
    Purpose: Generate high-level candidate strategies based on risk drivers using Gemini Pro.
    """
    risk_level = state.get("risk_level", "MEDIUM")
    drivers = state.get("primary_drivers", ["GENERAL_CHURN_RISK"])
    emit_telemetry(state, "StrategyPlanningAgent", "STRATEGY_GENERATION_STARTED", 
                   f"Planning strategies for {risk_level} risk due to {', '.join(drivers)}")

    agent_id = "StrategyPlanningAgent"
    policy = HARDCODED_POLICIES.get(agent_id, {})
    allowed_actions = policy.get("allowed_actions", [])
    blocked_actions = policy.get("blocked_actions", [])

    system_prompt = f"""You are the {agent_id} for the Sentient Retention Engine.
Your goal is to generate high-level candidate retention strategies tailored to the customer's risk factors.

## Governance & Permission Scopes
You must operate STRICTLY under the following permission boundaries:
- ALLOWED ACTIONS: {', '.join(allowed_actions)}
- BLOCKED ACTIONS: {', '.join(blocked_actions)}

WARNING: You are strictly BLOCKED from performing {', '.join(blocked_actions)}. Under no circumstances should you generate any strategy candidate that attempts to directly execute these blocked actions (for example, attempting to execute discounts or bypass governance).
Your generated candidate strategies must only consist of high-level proposals for further simulation.

## Expected Output Format
You must output a JSON list of candidate strategies. Do not include any explanation or markdown formatting outside of a standard json block.
Each candidate strategy must have:
- strategy_id: A unique short string (e.g. ST-ENGAGE, ST-SUPPORT, ST-PLAN)
- name: The name of the strategy (e.g., Feature Enablement Trial, Priority Specialist Support)
- details: A description of the strategy and how it addresses the customer's churn risk.
- roi_estimate: A float between 1.0 and 2.0 representing estimated Return on Investment.

Example valid JSON output:
[
  {{
    "strategy_id": "ST-SUPPORT",
    "name": "Priority Specialist Support",
    "details": "Direct line to senior support specialist + priority queue.",
    "roi_estimate": 1.35
  }}
]
"""

    user_prompt = f"""Generate candidate retention strategies for the following customer:
- Customer ID: {state.get('customer_id')}
- Plan Tier: {state.get('plan_tier')}
- Churn Risk Level: {state.get('risk_level')}
- Churn Risk Score: {state.get('risk_score')}
- Primary Drivers: {', '.join(state.get('primary_drivers', []))}
- Support Tickets: {state.get('support_ticket_count', 0)}
- Usage (last 30d): {state.get('usage_last_30d', 0)}
- Network Drop Events: {state.get('network_drop_events', 0)}
- Payment Status: {state.get('payment_status')}
"""

    candidates = []
    llm_pro, pro_available = get_llm("gemini_pro")

    if pro_available:
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            response = llm_pro.invoke(messages)
            content = response.content.strip()
            
            # Clean up potential markdown JSON blocks
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            parsed_candidates = json.loads(content)
            if not isinstance(parsed_candidates, list):
                parsed_candidates = [parsed_candidates]
                
            # Verify and sanitize candidates
            valid_candidates = []
            for item in parsed_candidates:
                if isinstance(item, dict) and "strategy_id" in item and "name" in item and "details" in item:
                    try:
                        item["roi_estimate"] = float(item.get("roi_estimate", 1.15))
                    except:
                        item["roi_estimate"] = 1.15
                    valid_candidates.append(item)
            candidates = valid_candidates
            
        except Exception as llm_err:
            emit_telemetry(state, "StrategyPlanningAgent", "LLM_ERROR", f"Gemini Pro strategy planning failed: {llm_err}. Using fallback logic.")
            candidates = []

    if not candidates:
        # Fallback to rule-based logic
        if "USAGE_DECLINE" in drivers:
            candidates.append({
                "strategy_id": "ST-USAGE",
                "name": "Feature Enablement Trial",
                "details": "Premium trial for 3 months to increase engagement via new features.",
                "roi_estimate": 1.45
            })
        if "BILLING_ISSUE" in drivers:
            candidates.append({
                "strategy_id": "ST-BILLING",
                "name": "Billing Grace Period",
                "details": "Waive late fees and offer flexible payment plan.",
                "roi_estimate": 1.25
            })
        if "SUPPORT_FRICTION" in drivers:
            candidates.append({
                "strategy_id": "ST-SUPPORT",
                "name": "Priority Specialist Support",
                "details": "Direct line to senior support specialist + priority queue.",
                "roi_estimate": 1.35
            })
        if risk_level == "CRITICAL":
            candidates.append({
                "strategy_id": "ST-CRITICAL",
                "name": "VIP Concierge Discount",
                "details": "Dedicated account manager + 20% loyalty discount.",
                "roi_estimate": 1.65
            })
        
        if not candidates:
            candidates.append({
                "strategy_id": "ST-DEFAULT",
                "name": "Loyalty Appreciation",
                "details": "Standard 10% discount for continued service.",
                "roi_estimate": 1.15
            })

    emit_telemetry(state, "StrategyPlanningAgent", "CANDIDATES_GENERATED", 
                   f"Generated {len(candidates)} candidate strategies.")
    
    return {
        "strategy_candidates": candidates,
        "agent_telemetry": state.get("agent_telemetry", [])
    }

@governance_protected("select_optimal_path")
def node_decision(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 4: DecisionAgent]
    Purpose: Ranks and selects the optimal strategy based on simulation outcomes.
    """
    emit_telemetry(state, "DecisionAgent", "DECISION_STARTED", "Selecting optimal strategy based on simulations.")
    
    sim_results = state.get("simulation_results", [])
    candidates = state.get("strategy_candidates", [])
    
    if not sim_results:
        # If no simulation happened, pick the one with highest ROI estimate
        selected = max(candidates, key=lambda x: x.get("roi_estimate", 0))
        reasoning = "Selected based on initial ROI estimate (No simulation data available)."
        confidence = 0.65 # Lower confidence without simulation
    else:
        # User's Decision Logic: score = (roi * 0.4) + (confidence * 0.6)
        def calculate_score(s):
            roi = s.get("roi_estimate", 0)
            conf = s.get("success_probability", 0)
            return (roi * 0.4) + (conf * 0.6)
            
        selected = max(sim_results, key=calculate_score)
        confidence = selected.get("success_probability", 0)
        score = calculate_score(selected)
        reasoning = f"Selected {selected.get('name')} with weighted score {score:.2f} (ROI: {selected.get('roi_estimate')}, Conf: {confidence:.2f})"
    
    emit_telemetry(state, "DecisionAgent", "DECISION_COMPLETED", 
                   f"Strategy Selected: {selected.get('name')}", 
                   {"confidence": confidence, "reasoning": reasoning})
    
    return {
        "selected_strategy": selected,
        "decision_confidence": confidence,
        "decision_reasoning": reasoning,
        "agent_telemetry": state.get("agent_telemetry", [])
    }
