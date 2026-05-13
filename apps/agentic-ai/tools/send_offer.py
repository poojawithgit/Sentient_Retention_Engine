import os
import requests
from dotenv import load_dotenv
from langchain.tools import tool
import json

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION ---
# API endpoint for sending offers
BACKEND_URL = os.getenv("BACKEND_URL")  # e.g., http://localhost:8000

@tool
def send_offer(user_id: str, offer_type: str, value: str) -> str:
    """
    Sends a retention offer to a user via the backend API.
    
    Args:
        user_id: The unique identifier of the customer.
        offer_type: The type of offer (e.g., 'DISCOUNT', 'FREE_TRIAL', 'UPGRADE').
        value: The value or details of the offer (e.g., '20%', '30 days').
    
    Returns:
        A JSON string with the status of the operation.
    """
    if not BACKEND_URL:
        return json.dumps({
            "error": "BACKEND_URL not configured. Check .env file."
        })

    api_endpoint = f"{BACKEND_URL}/api/v1/send-offer/{user_id}"
    
    payload = {
        "offer_type": offer_type,
        "value": value
    }
    
    try:
        response = requests.post(
            api_endpoint,
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            return response.text
        else:
            return json.dumps({
                "status": "error",
                "code": response.status_code,
                "message": f"Backend API error: {response.text}"
            })

    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Exception during offer submission: {str(e)}"
        })

def send_offer(user_id, offer_type="Discount", value="20%"):
    """
    Simulates sending a retention offer to a user.
    """
    print(f"Tool (send_offer): Sending {value} {offer_type} to user {user_id}")
    return {
        "status": "success",
        "action": f"Sent {value} {offer_type}",
        "timestamp": "2026-04-14T11:20:00Z"
    }
