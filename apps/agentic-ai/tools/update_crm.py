import os
import requests
from dotenv import load_dotenv
from langchain.tools import tool
import json

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION ---
# Update CRM endpoint URL
BACKEND_URL = os.getenv("BACKEND_URL")  # e.g., http://localhost:8000

@tool
def update_customer_crm_record(user_id: str, retention_action: str, notes: str = "") -> str:
    """
    Updates the customer's record in the CRM with the retention action taken.
    
    Args:
        user_id: The unique identifier of the customer.
        retention_action: The action that was taken (e.g., 'OFFER_APPLIED', 'DISCOUNT_GRANTED').
        notes: Additional notes about the interaction.
    
    Returns:
        A JSON string with the status of the operation.
    """
    if not BACKEND_URL:
        return json.dumps({
            "error": "BACKEND_URL not configured. Check .env file."
        })

    api_endpoint = f"{BACKEND_URL}/api/v1/update-crm/{user_id}"
    
    payload = {
        "action_type": retention_action,
        "notes": notes
    }
    
    try:
        response = requests.put(
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
            "message": f"Exception during CRM update: {str(e)}"
        })
