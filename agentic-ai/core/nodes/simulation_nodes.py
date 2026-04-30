from typing import Dict, Any
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import RetentionState
from ..llm_provider import get_llm
from ..models import SimulationResult

llm, LLM_AVAILABLE = get_llm()

def node_digital_twin_sim(state: RetentionState) -> Dict[str, Any]:
    print(f"[NODE] 6a: Digital Twin Sim (Iter: {state.get('simulation_iterations', 0)})")
    iters = state.get('simulation_iterations', 0) + 1
    
    last_offer = "Standard Bundle"
    if state.get('offers_tried'):
        last_offer = state.get('offers_tried')[-1]

    if LLM_AVAILABLE:
        try:
            structured_llm = llm.with_structured_output(SimulationResult)
            
            prompt = f"""You are a digital twin of a telco customer. 
            Evaluate this offer: {last_offer}
            Customer Context: {state.get('summary')}
            Driver: {state.get('driver')}
            """
            
            sim = structured_llm.invoke(prompt)
            response = "accept" if sim.acceptance_probability > 0.7 else f"reject: {sim.user_reaction}"
            
            responses = state.get('responses', [])
            responses.append(response)
            
            return {
                "simulation_iterations": iters,
                "responses": responses,
                "churn_score": sim.new_churn_score
            }
        except Exception as e:
            print(f"Structured simulation failed: {e}, using mock fallback")
            
    # Mock Fallback
    response = "accept" if iters >= 2 else "reject: need better offer"
    responses = state.get('responses', [])
    responses.append(response)
    
    return {
        "simulation_iterations": iters,
        "responses": responses
    }

def node_nurture_sim(state: RetentionState) -> Dict[str, Any]:
    print(f"[NODE] 6b: Nurture Sim (Iter: {state.get('simulation_iterations', 0)})")
    iters = state.get('simulation_iterations', 0) + 1
    
    nps_scores = state.get('nps_scores', [])
    nps_scores.append(7.0 + iters)
    
    return {
        "simulation_iterations": iters,
        "nps_scores": nps_scores
    }

def node_impact_eval_high(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 8a: Impact Eval (High)")
    prob = min(0.4 + (state.get('simulation_iterations', 1) * 0.2), 0.95)
    return {
        "success_probability": prob,
        "eval_reasoning": "Offer becomes more compelling with iteration."
    }

def node_impact_eval_low(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 8b: Impact Eval (Low)")
    prob = 0.85
    return {
        "success_probability": prob,
        "eval_reasoning": "Engagement strategy is highly likely to boost NPS."
    }
