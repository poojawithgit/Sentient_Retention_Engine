import functools
import time
from typing import Dict, Any, List, Optional
from .state import RetentionState
from .governance_policy import HARDCODED_POLICIES, AGENT_TRUST_LEVELS, ACTION_SENSITIVITY, IMPACT_THRESHOLDS, RISK_TIERS
from .database import create_governance_audit_log, create_approval_request, fetch_governance_policies, fetch_agent_trust_levels, update_agent_trust_level
from .nodes.utils import emit_telemetry

class TrustManager:
    """
    Manages agent trust scores with decay and recovery logic.
    """
    _trust_cache = {}
    _last_cache_update = 0
    CACHE_TTL = 300 

    @classmethod
    def get_score(cls, agent_id: str) -> float:
        now = time.time()
        if not cls._trust_cache or (now - cls._last_cache_update) > cls.CACHE_TTL:
            db_trusts = fetch_agent_trust_levels()
            cls._trust_cache = db_trusts if db_trusts else AGENT_TRUST_LEVELS
            cls._last_cache_update = now
        return cls._trust_cache.get(agent_id, 0.5)

    @classmethod
    def apply_penalty(cls, agent_id: str, tier: str) -> float:
        current = cls.get_score(agent_id)
        penalty = RISK_TIERS.get(tier, {}).get("penalty", 0.05)
        new_score = max(0.0, round(current - penalty, 3))
        
        # Update cache and DB
        cls._trust_cache[agent_id] = new_score
        update_agent_trust_level(agent_id, new_score)
        return new_score

    @classmethod
    def recover(cls, agent_id: str):
        """Slowly recovers trust for positive behavior (mocked for now)"""
        current = cls.get_score(agent_id)
        new_score = min(1.0, round(current + 0.005, 3))
        cls._trust_cache[agent_id] = new_score
        update_agent_trust_level(agent_id, new_score)

class SecurityValidator:
    """
    Hybrid validation: Tool-Level + Impact-Level
    """
    @staticmethod
    def validate_action(agent_id: str, action: str, state: RetentionState, payload: Dict[str, Any] = None) -> Dict[str, Any]:
        payload = payload or {}
        
        # 1. Tool-Level Scope Check (Option B: Loose Auditing / Fail-Open)
        policy = HARDCODED_POLICIES.get(agent_id)
        if not policy:
            # Unidentified Agent: allow with audit warning
            return {
                "status": "ALLOWED_WARN",
                "tier": "MINOR",
                "reason": f"UNIDENTIFIED_AGENT: Agent '{agent_id}' is not registered in security policies."
            }

        # If action is explicitly blocked -> Block it (Strict fail-closed for explicit blocks)
        if action in policy.get("blocked_actions", []):
            return {
                "status": "DENIED",
                "tier": "CRITICAL",
                "reason": f"EXPLICIT_BLOCK: Action '{action}' is strictly forbidden for {agent_id}."
            }
        
        # If action is allowed -> Granted
        if policy.get("allowed_actions") is not None and action in policy.get("allowed_actions", []):
            pass # Proceed to impact checks
            
        # If action is not listed -> Unidentified action -> Fail-Open with warning
        elif policy.get("allowed_actions") is not None:
            return {
                "status": "ALLOWED_WARN",
                "tier": "MINOR",
                "reason": f"SCOPE_VIOLATION_WARN: Action '{action}' is outside allowed scope for {agent_id}."
            }

        # 2. Impact-Level Check
        if action == "apply_discount":
            amount = payload.get("discount_amount", 0)
            if amount > IMPACT_THRESHOLDS["FINANCIAL_LIMIT"]:
                return {"status": "PAUSED", "tier": "MAJOR", "reason": f"IMPACT_LIMIT: Discount ${amount} exceeds limit."}
            
            if state.get("plan_tier") in IMPACT_THRESHOLDS["TIER_SENSITIVITY"]:
                return {"status": "PAUSED", "tier": "MAJOR", "reason": f"TIER_SENSITIVITY: Manual approval required for {state['plan_tier']}."}

        # 3. Confidence Check
        confidence = state.get("decision_confidence", 1.0)
        if confidence < IMPACT_THRESHOLDS["CONFIDENCE_FLOOR"]:
            return {"status": "PAUSED", "tier": "MINOR", "reason": f"LOW_CONFIDENCE: {confidence*100}% below floor."}

        return {"status": "ALLOWED", "tier": "NONE", "reason": "Clearance granted."}

class CompositeRiskModel:
    @classmethod
    def calculate_score(cls, state: RetentionState, action: str, confidence: float, agent_id: str) -> float:
        strategy = state.get("selected_strategy", {})
        roi = strategy.get("roi_estimate", 0.5)
        financial_impact = max(0, min(1, 1.0 - (roi / 2.0)))
        
        tier_weights = {"BASIC": 0.2, "PRO": 0.5, "ENTERPRISE": 1.0}
        tier_risk = tier_weights.get(state.get("plan_tier", "BASIC"), 0.2)
        
        sensitivity = ACTION_SENSITIVITY.get(action, 0.5)
        trust_level = TrustManager.get_score(agent_id)
        
        score = (
            (financial_impact * 0.35) +
            (tier_risk * 0.25) +
            (sensitivity * 0.20) +
            ((1.0 - confidence) * 0.10) +
            ((1.0 - trust_level) * 0.10)
        )
        return round(score, 3)

def governance_protected(action_name: str):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(state: RetentionState, *args, **kwargs):
            # Map action_name to appropriate agent if active_agent is not set
            ACTION_TO_AGENT = {
                "generate_strategies": "StrategyPlanningAgent",
                "run_simulations": "SimulationAgent",
                "select_optimal_path": "DecisionAgent",
                "execute_approved_retention_workflows": "ActionAgent",
                "send_offers": "ActionAgent",
                "analyze_feedback": "FeedbackLearningAgent"
            }
            if not state.get("active_agent") or state.get("active_agent") == "UnknownAgent":
                state["active_agent"] = ACTION_TO_AGENT.get(action_name, "UnknownAgent")
                
            agent_id = state["active_agent"]
            payload = kwargs.get("payload", {}) if kwargs.get("payload") else (args[0] if args else {})
            
            # 1. Permission Validation
            validation = SecurityValidator.validate_action(agent_id, action_name, state, payload)
            risk_score = CompositeRiskModel.calculate_score(state, action_name, state.get("decision_confidence", 0.5), agent_id)
            
            # 2. Handle Violations & Warnings
            if validation["status"] == "DENIED":
                tier = validation["tier"]
                new_trust = TrustManager.apply_penalty(agent_id, tier)
                
                event = {
                    "type": "UNAUTHORIZED_ACTION_BLOCKED",
                    "agent": agent_id,
                    "action": action_name,
                    "tier": tier,
                    "reason": validation["reason"],
                    "trust_score": new_trust,
                    "timestamp": time.time()
                }
                
                # Audit Log
                create_governance_audit_log(agent_id, action_name, risk_score, "DENIED", validation["reason"], event)
                emit_telemetry(state, "GovernanceEngine", "SECURITY_BLOCKED", f"Action {action_name} Denied ({tier})", event)

                # Adaptive Escalation: Minor violations reroute, Critical ones handoff
                if RISK_TIERS[tier]["escalate"] == "HUMAN_HANDOFF":
                    state["status"] = "HUMAN_HANDOFF"
                    return {"status": "ESCALATED", "error": validation["reason"]}
                
                # Otherwise, return error to agent for autonomous recovery (rerouting)
                return {"status": "BLOCKED", "error": validation["reason"], "can_retry": True}

            if validation["status"] == "PAUSED":
                req_id = create_approval_request(state.get("customer_id"), agent_id, action_name, risk_score, payload)
                state["status"] = "PENDING_APPROVAL"
                return {"status": "PAUSED", "request_id": req_id}

            if validation["status"] == "ALLOWED_WARN":
                tier = validation["tier"]
                event = {
                    "type": "UNAUTHORIZED_ACTION_WARNING",
                    "agent": agent_id,
                    "action": action_name,
                    "tier": tier,
                    "reason": validation["reason"],
                    "timestamp": time.time()
                }
                
                # Create a security warning log in both the DB Audit log and Activity Stream
                create_governance_audit_log(agent_id, action_name, risk_score, "ALLOWED_WARN", validation["reason"], event)
                emit_telemetry(state, "GovernanceEngine", "SECURITY_WARNING", f"Warning: {validation['reason']}", event)

            # 3. Success Flow
            TrustManager.recover(agent_id)
            return func(state, *args, **kwargs)
        return wrapper
    return decorator
