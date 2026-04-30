from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
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

                # Initialize state based on RetentionState definition
                initial_state = {
                    "customer_id": user_id,
                    "plan_tier": payload.get("plan_tier", "Gold"),
                    "usage_last_30d": float(payload.get("usage_score", 15.0)),
                    "support_ticket_count": int(payload.get("complaints_count", 0)),
                    "network_drop_events": int(payload.get("network_drops", 0)),
                    "payment_status": payload.get("payment_status", "Paid"),
                    "simulation_iterations": 0,
                    "offers_tried": [],
                    "strategies_tried": [],
                    "responses": [],
                    "nps_scores": [],
                    "audit_log": []
                }
                
                await websocket.send_json({"type": "status", "message": "Pipeline Started", "node": "START"})
                
                # We iterate over the stream
                async for event in retention_graph.astream(initial_state):
                    # event is a dict: {node_name: state_update}
                    for node_name, state_update in event.items():
                        # Skip internal or empty updates
                        if not state_update or not isinstance(state_update, dict):
                            print(f"DEBUG: Skipping update for {node_name}: {state_update}")
                            continue

                        if node_name.startswith("__"):
                            continue

                        print(f"Node Completed: {node_name}")
                        
                        try:
                            # Prepare data for frontend mapping
                            reasoning = (
                                state_update.get("eval_reasoning") or 
                                state_update.get("message") or 
                                state_update.get("summary") or 
                                f"Processed in {node_name}"
                            )
                            
                            msg = {
                                "type": "node_update",
                                "node": node_name,
                                "status": "Completed",
                                "data": {
                                    "risk_score": state_update.get("churn_score"),
                                    "driver": state_update.get("driver"),
                                    "action": state_update.get("final_action"),
                                    "offer": state_update.get("offers_tried")[-1] if state_update.get("offers_tried") else None,
                                    "message": state_update.get("message"),
                                    "reasoning": reasoning
                                }
                            }
                            # Clean up None values
                            msg["data"] = {k: v for k, v in msg["data"].items() if v is not None}
                            
                            # Use the node_name from the outer loop, don't override it
                            msg["node_id"] = node_name
                            msg["type"] = "node_update"
                            msg["status"] = "Active"
                            msg["timestamp"] = datetime.now().strftime("%H:%M:%S")
                            
                            # Add some helpful fields if they are missing
                            if "reasoning" not in msg and "eval_reasoning" in msg:
                                msg["reasoning"] = msg["eval_reasoning"]
                            
                            await websocket.send_json(msg)
                            await asyncio.sleep(0.5) # Pace for visualization
                        except Exception as node_err:
                            print(f"Error processing node update for {node_name}: {node_err}")
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
