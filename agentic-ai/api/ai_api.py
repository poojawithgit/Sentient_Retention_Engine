from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import uvicorn
import sys
import os
import json
import asyncio

# Add the parent directory to sys.path to allow importing from 'core'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.workflow import build_workflow

app = FastAPI(title="Sentient Retention AI Engine")

# Compile the graph once
retention_graph = build_workflow()

class PredictionRequest(BaseModel):
    userId: str

class PipelineRequest(BaseModel):
    user_id: str
    usage_score: float = 15.0
    complaints_count: int = 0
    payment_delay_count: int = 0
    context_notes: str = ""

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

                # Initialize state
                initial_state = {
                    "user_id": user_id,
                    "usage_score": payload.get("usage_score", 15.0),
                    "complaints_count": payload.get("complaints_count", 0),
                    "payment_delay_count": payload.get("payment_delay_count", 0),
                    "context_notes": payload.get("context_notes", "Live session trigger"),
                    "simulation_iterations": 0,
                    "offers_tried": [],
                    "strategies_tried": []
                }
                
                # Stream the graph
                await websocket.send_json({"type": "status", "message": "Pipeline Started", "node": "START"})
                
                # We iterate over the stream
                for event in retention_graph.stream(initial_state):
                    print(f"DEBUG: Event: {event}", flush=True)
                    # event is a dict: {node_name: state_update}
                    for node_name, state_update in event.items():
                        if not isinstance(state_update, dict):
                            continue
                            
                        # Prepare data for frontend mapping
                        msg = {
                            "type": "node_update",
                            "node": node_name,
                            "status": "Completed",
                            "data": {
                                "risk_level": state_update.get("risk_level", "Unknown"),
                                "strategy": state_update.get("selected_strategy", "N/A"),
                                "offer": state_update.get("selected_offer", "N/A"),
                                "reasoning": state_update.get("strategist_reasoning", "Processing complete.")
                            }
                        }
                        await websocket.send_json(msg)

                        # Small delay for visual effect in the dashboard
                        await asyncio.sleep(0.5)
                
                await websocket.send_json({"type": "status", "message": "Pipeline Completed", "node": "END"})
                
    except WebSocketDisconnect:
        print(f"Client disconnected: {user_id}")
    except Exception as e:
        print(f"Error in websocket: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass

@app.post("/predict/churn")
async def predict_churn(request: PredictionRequest):
    return {
        "userId": request.userId,
        "churn_probability": 0.35,
        "risk_level": "Medium",
        "reasoning": "Recent drop in session frequency and high support ticket activity."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
