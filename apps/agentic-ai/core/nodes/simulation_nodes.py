import time
import random
import json
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import RetentionState
from ..llm_provider import get_llm
from ..models import SimulationResult
from .utils import emit_telemetry
from ..governance_policy import HARDCODED_POLICIES

llm, LLM_AVAILABLE = get_llm()

from ..governance_engine import governance_protected

@governance_protected("run_simulations")
def node_simulation(state: RetentionState) -> Dict[str, Any]:
    """
    [Agent 3: SimulationAgent]
    Purpose: Simulate outcomes for each candidate strategy.
    """
    candidates = state.get("strategy_candidates", [])
    emit_telemetry(state, "SimulationAgent", "SIMULATION_STARTED", f"Simulating {len(candidates)} candidate strategies.")
    
    simulation_results = []
    
    for strategy in candidates:
        emit_telemetry(state, "SimulationAgent", "STRATEGY_SIMULATION", f"Running digital twin for: {strategy.get('name')}")
        
        # Try to use Gemini Flash for dynamic customer reaction simulation
        llm_flash, flash_available = get_llm("gemini_flash")
        
        sim_data = None
        if flash_available:
            try:
                agent_id = "SimulationAgent"
                policy = HARDCODED_POLICIES.get(agent_id, {})
                allowed_actions = policy.get("allowed_actions", [])
                blocked_actions = policy.get("blocked_actions", [])

                system_prompt = f"""You are the {agent_id} for the Sentient Retention Engine.
Your purpose is to simulate the customer's reaction to a candidate retention strategy and estimate key metrics.

## Governance & Permission Scopes
You must operate STRICTLY under the following permission boundaries:
- ALLOWED ACTIONS: {', '.join(allowed_actions)}
- BLOCKED ACTIONS: {', '.join(blocked_actions)}

WARNING: You are strictly BLOCKED from performing {', '.join(blocked_actions)}. Under no circumstances should you simulate or generate any outcome that bypasses these limits or attempts to actually execute these blocked actions. Your task is strictly simulation and scenario analysis.

## Expected Output Format
You must output a single JSON object. Do not include any explanation or markdown formatting outside of a standard json block.
The JSON object must contain the following keys:
- success_probability: A float between 0.0 and 1.0 representing the likelihood that this strategy retains the customer.
- outcome: A string, one of "RETAINED" (probability > 0.8), "STABLE" (probability between 0.5 and 0.8), or "LOST" (probability < 0.5).
- retention_forecast: A percentage string representing the forecast (e.g., "85%").
- engagement_forecast: A float between 1.0 and 10.0 representing the forecast of customer engagement.
- clv_impact: A float representing estimated financial impact (e.g., customer lifetime value change, between 50.0 and 200.0).
- user_reaction: A string summarizing the customer's likely response (e.g., "Highly enthusiastic about the premium trial", "Skeptical but willing to stay for 3 months").
"""

                user_prompt = f"""Simulate customer reaction for the following candidate strategy:
Strategy ID: {strategy.get('strategy_id')}
Strategy Name: {strategy.get('name')}
Strategy Details: {strategy.get('details')}

Customer Profile:
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

                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt)
                ]
                
                response = llm_flash.invoke(messages)
                content = response.content.strip()
                
                # Clean up potential markdown JSON blocks
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                parsed_res = json.loads(content)
                if isinstance(parsed_res, dict) and "success_probability" in parsed_res:
                    # Sanitize metrics
                    success_prob = float(parsed_res.get("success_probability", 0.5))
                    outcome = parsed_res.get("outcome", "STABLE")
                    retention_forecast = parsed_res.get("retention_forecast", f"{int(success_prob * 100)}%")
                    engagement_forecast = float(parsed_res.get("engagement_forecast", 7.0))
                    clv_impact = float(parsed_res.get("clv_impact", 100.0))
                    user_reaction = parsed_res.get("user_reaction", "Simulated reaction")
                    
                    score = success_prob
                    
                    sim_data = {
                        **strategy,
                        "success_probability": success_prob,
                        "simulation_score": score,
                        "outcome": outcome,
                        "retention_forecast": retention_forecast,
                        "engagement_forecast": engagement_forecast,
                        "clv_impact": clv_impact,
                        "user_reaction": user_reaction
                    }
            except Exception as e:
                emit_telemetry(state, "SimulationAgent", "LLM_ERROR", f"Gemini Flash customer simulation failed: {e}. Using fallback logic.")
                sim_data = None
        
        # Fallback to original probabilistic simulation logic if Gemini was not available or failed
        if not sim_data:
            # Base probability from strategy ROI estimate + some randomness
            roi = strategy.get("roi_estimate", 0.5)
            sentiment_score = random.uniform(0.3, 0.9) # Simulated sentiment
            
            # User's Simulation Logic: score = (ROI * 0.7) + (sentiment_score * 0.3)
            score = (roi * 0.7) + (sentiment_score * 0.3)
            
            if score > 0.8:
                outcome = "RETAINED"
                success_probability = 0.94
                retention_forecast = "94%"
            elif score > 0.5:
                outcome = "STABLE"
                success_probability = 0.62
                retention_forecast = "62%"
            else:
                outcome = "LOST"
                success_probability = 0.21
                retention_forecast = "21%"
            
            # Engagement score forecast
            engagement_forecast = 7.5 + random.uniform(-1, 2)
            
            # CLV impact (dollar value)
            clv_impact = random.uniform(50, 200)
            
            sim_data = {
                **strategy,
                "success_probability": success_probability,
                "simulation_score": score,
                "outcome": outcome,
                "retention_forecast": retention_forecast,
                "engagement_forecast": engagement_forecast,
                "clv_impact": clv_impact,
                "user_reaction": "Positive" if score > 0.6 else "Skeptical"
            }
            
        simulation_results.append(sim_data)
        
        # Small delay to mimic processing
        time.sleep(0.1)

    emit_telemetry(state, "SimulationAgent", "SIMULATION_COMPLETED", 
                   f"Successfully simulated {len(simulation_results)} strategies.")
    
    return {
        "simulation_results": simulation_results,
        "engagement_score_forecast": sum(r["engagement_forecast"] for r in simulation_results) / len(simulation_results) if simulation_results else 0,
        "clv_impact": sum(r["clv_impact"] for r in simulation_results) / len(simulation_results) if simulation_results else 0,
        "agent_telemetry": state.get("agent_telemetry", [])
    }
