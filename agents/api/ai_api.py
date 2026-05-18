from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
import uvicorn
import sys
import os
import json
import asyncio
from datetime import datetime

# Add the parent directory to sys.path to allow importing from 'core'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.workflow import build_workflow

app = FastAPI(title="Sentient Retention AI Engine")

# Compile the graph once
retention_graph = build_workflow()

class PredictionRequest(BaseModel):
    userId: str

class PipelineTriggerRequest(BaseModel):
    userId: str
    plan_tier: Optional[str] = "Gold"
    usage_score: Optional[float] = 15.0
    complaints_count: Optional[int] = 0
    network_drops: Optional[int] = 0
    payment_status: Optional[str] = "Paid"

@app.get("/")
async def root():
    return {"message": "Agentic AI Layer is Active", "port": 8002}

@app.websocket("/ws/agent/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    print(f"WebSocket connected for user: {user_id}", flush=True)

    try:
        while True:
            # Wait for trigger message
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get("action") == "start_pipeline":
                print(f"Starting pipeline for user: {user_id}")

                # Initialize state based on the new 9-agent RetentionState definition
                initial_state = {
                    "customer_id": user_id,
                    "plan_tier": payload.get("plan_tier", "Gold"),
                    "usage_last_30d": float(payload.get("usage_score", 15.0)),
                    "support_ticket_count": int(payload.get("complaints_count", 0)),
                    "network_drop_events": int(payload.get("network_drops", 0)),
                    "payment_status": payload.get("payment_status", "Paid"),
                    "billing_history": "Standard billing cycle",
                    "last_login": datetime.now().isoformat(),
                    "simulation_iterations": 0,
                    "agent_telemetry": [],
                    "audit_log": [],
                    "technical_failure": False,
                    "loop_count": 0,
                    "escalated_to_human": False
                }
                
                await websocket.send_json({"type": "status", "message": "Pipeline Started", "node": "START"})
                
                # Iterate over the graph stream
                async for event in retention_graph.astream(initial_state):
                    for node_name, state_update in event.items():
                        if not state_update or not isinstance(state_update, dict):
                            continue

                        if node_name.startswith("__"):
                            continue

                        print(f"Node Completed: {node_name}")
                        
                        try:
                            # Prepare rich data for the 9-agent dashboard visualization
                            msg = {
                                "type": "node_update",
                                "node": node_name,
                                "status": "Completed",
                                "timestamp": datetime.now().strftime("%H:%M:%S"),
                                "data": {
                                    "risk_score": state_update.get("risk_score"),
                                    "risk_level": state_update.get("risk_level"),
                                    "drivers": state_update.get("primary_drivers"),
                                    "candidates": state_update.get("strategy_candidates"),
                                    "selected": state_update.get("selected_strategy"),
                                    "confidence": state_update.get("decision_confidence"),
                                    "reasoning": (
                                        state_update.get("decision_reasoning") or 
                                        state_update.get("escalation_reason") or
                                        state_update.get("message") or
                                        f"Processed in {node_name}"
                                    ),
                                    "validation": state_update.get("validation_passed"),
                                    "action": state_update.get("final_action"),
                                    "telemetry": state_update.get("agent_telemetry", [])[-1] if state_update.get("agent_telemetry") else None
                                }
                            }
                            # Clean up None values
                            msg["data"] = {k: v for k, v in msg["data"].items() if v is not None}
                            
                            await websocket.send_json(msg)
                            
                            # If a telemetry event was just emitted, send it as a dedicated event too
                            if state_update.get("agent_telemetry"):
                                last_event = state_update["agent_telemetry"][-1]
                                await websocket.send_json({
                                    "type": "AGENT_TELEMETRY",
                                    "agent": last_event.get("agent"),
                                    "event": last_event.get("event"),
                                    "message": last_event.get("message"),
                                    "metadata": last_event.get("metadata"),
                                    "timestamp": last_event.get("timestamp")
                                })
                                
                            await asyncio.sleep(0.6) # Slightly slower pace for human readability
                        except Exception as node_err:
                            print(f"Error processing node event for {node_name}: {node_err}")
                            continue
                
                # Signal completion
                await websocket.send_json({"type": "status", "message": "Pipeline Completed", "node": "END"})
                
    except WebSocketDisconnect:
        print(f"Client disconnected: {user_id}")
    except Exception as e:
        error_msg = str(e)
        print(f"Error in websocket for user {user_id}: {error_msg}")
        
        if "524" in error_msg or "Provider returned error" in error_msg:
            friendly_error = "AI Provider (Groq) is currently overloaded. Falling back to simplified logic."
        else:
            friendly_error = f"Pipeline Error: {error_msg}"
            
        try:
            await websocket.send_json({
                "type": "error", 
                "message": friendly_error,
                "raw_error": error_msg
            })
        except:
            pass

@app.post("/api/run-pipeline")
async def run_pipeline(payload: PipelineTriggerRequest):
    print(f"Triggering automated pipeline via REST for user: {payload.userId}", flush=True)
    
    # Initialize state matching the 9-agent RetentionState definition
    initial_state = {
        "customer_id": payload.userId,
        "plan_tier": payload.plan_tier or "Gold",
        "usage_last_30d": float(payload.usage_score if payload.usage_score is not None else 15.0),
        "support_ticket_count": int(payload.complaints_count if payload.complaints_count is not None else 0),
        "network_drop_events": int(payload.network_drops if payload.network_drops is not None else 0),
        "payment_status": payload.payment_status or "Paid",
        "billing_history": "Standard billing cycle",
        "last_login": datetime.now().isoformat(),
        "simulation_iterations": 0,
        "agent_telemetry": [],
        "audit_log": [],
        "technical_failure": False,
        "loop_count": 0,
        "escalated_to_human": False
    }
    
    try:
        # Run graph using ainvoke
        final_state = await retention_graph.ainvoke(initial_state)
        
        # Format a clean response detailing the pipeline outcome
        response_payload = {
            "status": "success",
            "user_id": payload.userId,
            "risk_score": final_state.get("risk_score"),
            "risk_level": final_state.get("risk_level"),
            "selected_strategy": final_state.get("selected_strategy"),
            "decision_reasoning": (
                final_state.get("decision_reasoning") or 
                final_state.get("escalation_reason") or
                final_state.get("message") or
                "Pipeline execution complete"
            ),
            "final_action": final_state.get("final_action"),
            "escalated_to_human": final_state.get("escalated_to_human", False),
            "escalation_reason": final_state.get("escalation_reason"),
            "specialist_queue_id": final_state.get("specialist_queue_id")
        }
        
        return response_payload
    except Exception as e:
        error_msg = str(e)
        print(f"Error executing automated pipeline for user {payload.userId}: {error_msg}", flush=True)
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {error_msg}")

@app.post("/predict/churn")
async def predict_churn(request: PredictionRequest):
    # This could eventually call the ML service or a specific part of the graph
    return {
        "userId": request.userId,
        "churn_probability": 0.35,
        "risk_level": "Medium",
        "reasoning": "Recent drop in session frequency and high support ticket activity."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
