import time
from typing import Dict, Any
from ..state import RetentionState

def emit_telemetry(state: RetentionState, agent_name: str, event_type: str, message: str, data: Dict[str, Any] = None):
    """Utility to record agent events for the ObservabilityAgent."""
    event = {
        "timestamp": time.time(),
        "agent": agent_name,
        "event_type": event_type,
        "message": message,
        "data": data or {}
    }
    if "agent_telemetry" not in state or state["agent_telemetry"] is None:
        state["agent_telemetry"] = []
    
    # Ensure it's a list if it's somehow not (though RetentionState says it's a list)
    if not isinstance(state["agent_telemetry"], list):
        state["agent_telemetry"] = []
        
    state["agent_telemetry"].append(event)
    print(f"[{agent_name}] {event_type}: {message}")
