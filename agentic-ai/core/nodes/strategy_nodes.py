import json
from typing import Dict, Any
from langchain_core.messages import HumanMessage, SystemMessage
from ..state import RetentionState
from ..llm_provider import get_llm
from ..models import RetentionStrategy

llm, LLM_AVAILABLE = get_llm()

def node_rag(state: RetentionState) -> Dict[str, Any]:
    print(f"[NODE] 3: Knowledge Retrieval (Driver: {state.get('driver')})")
    driver = state.get('driver', 'UNKNOWN')
    if driver == "QUALITY":
        rag_context = "Playbook: For quality issues, offer network-self-heal diagnostics and priority support."
    elif driver == "PRICE":
        rag_context = "Playbook: For price sensitivity, offer 20% discount on next 3 billing cycles."
    else:
        rag_context = "Playbook: General retention strategies."
        
    return {"rag_context": rag_context}

def node_strategist(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 11: Strategist (LLM: GPT-4o)")
    
    # Try to get GPT-4o, fallback to default LLM if not available
    strategist_llm, available = get_llm("openai")
    if not available:
        strategist_llm, available = get_llm("groq")

    # Aggregate simulation results (memory store)
    offers = state.get('offers_tried', [])
    strategies = state.get('strategies_tried', [])
    responses = state.get('responses', [])
    nps_scores = state.get('nps_scores', [])
    
    simulation_results = []
    for i in range(len(responses)):
        res = {
            "action": offers[i] if i < len(offers) else (strategies[i-len(offers)] if i-len(offers) < len(strategies) else "Unknown"),
            "user_reaction": responses[i],
            "nps_impact": nps_scores[i] if i < len(nps_scores) else "N/A"
        }
        simulation_results.append(res)

    if available:
        try:
            structured_llm = strategist_llm.with_structured_output(RetentionStrategy)
            
            prompt = f"""You are the Retention Strategist. From the simulation results, select the single best action. 
            Write a personalized retention message for this customer.
            
            Customer Context:
            - ID: {state.get('customer_id')}
            - Plan: {state.get('plan_tier')}
            - Churn Score: {state.get('churn_score')}
            - Primary Driver: {state.get('driver')}
            
            Playbook Grounding (RAG):
            {state.get('rag_context')}
            
            Simulation History (Memory Store):
            {json.dumps(simulation_results, indent=2)}
            
            Select the best performing action and compose the final output.
            """
            
            strategy = structured_llm.invoke(prompt)
            return {
                "final_action": strategy.final_action,
                "message": strategy.message,
                "confidence": strategy.confidence,
                "bundle_details": strategy.bundle_details,
                "eval_reasoning": f"Strategist selected {strategy.final_action} based on simulation results."
            }
        except Exception as e:
            print(f"Strategist failed: {e}, using fallback")
            
    # Robust fallback
    last_action = offers[-1] if offers else (strategies[-1] if strategies else "Standard Bundle")
    return {
        "final_action": last_action,
        "message": f"Hello, we've reviewed your account. To show our appreciation, we are offering you: {last_action}.",
        "confidence": 0.85,
        "bundle_details": "Selected based on previous interaction history.",
        "eval_reasoning": "Fallback strategy applied due to LLM unavailability."
    }

def node_retention_offer_tool(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 7a: Retention Offer API Tool")
    driver = state.get('driver', 'PRICE')
    
    if driver == "PRICE":
        offer = f"20% Discount (Attempt {state.get('simulation_iterations')})"
    elif driver == "QUALITY":
        offer = f"Network Priority Pass (Attempt {state.get('simulation_iterations')})"
    else:
        offer = f"Standard Bundle (Attempt {state.get('simulation_iterations')})"
        
    offers = state.get('offers_tried', [])
    offers.append(offer)
    return {"offers_tried": offers}

def node_engagement_api(state: RetentionState) -> Dict[str, Any]:
    print("[NODE] 7b: Engagement API Tool")
    strategies = ["Loyalty bonus", "Content recommendation", "Plan upgrade nudge"]
    idx = (state.get('simulation_iterations', 1) - 1) % len(strategies)
    strat = strategies[idx]
    
    strats = state.get('strategies_tried', [])
    strats.append(strat)
    return {"strategies_tried": strats}
