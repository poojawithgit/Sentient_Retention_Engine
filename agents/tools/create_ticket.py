import os
import requests
from dotenv import load_dotenv
from langchain.tools import tool
import json

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION ---
# Support ticket system URL
ZENDESK_URL = os.getenv("ZENDESK_URL")  # e.g., https://your-subdomain.zendesk.com/api/v2
ZENDESK_USER = os.getenv("ZENDESK_EMAIL")
ZENDESK_TOKEN = os.getenv("ZENDESK_TOKEN")  # API Token, not user password

@tool
def create_support_ticket(subject: str, description: str, customer_email: str, priority: str = "normal") -> str:
    """
    Creates a new support ticket in Zendesk for manual review.
    
    Args:
        subject: The subject line of the ticket.
        description: Detailed description of the issue, including the proposed solution.
        customer_email: The email address of the customer to notify.
        priority: The priority level (normal, high, urgent, low).
    
    Returns:
        The ticket number and a link to the ticket.
    """
    if not all([ZENDESK_URL, ZENDESK_USER, ZENDESK_TOKEN]):
        return json.dumps({
            "error": "Zendesk not configured. Check ZENDESK_URL, ZENDESK_EMAIL, and ZENDESK_TOKEN in .env file."
        })

    # Validate priority
    valid_priorities = ["normal", "high", "urgent", "low"]
    if priority.lower() not in valid_priorities:
        priority = "normal"

    # Payload structure for Zendesk API
    payload = {
        "ticket": {
            "subject": subject,
            "comment": {
                "body": description
            },
            "requester": {
                "email": customer_email
            },
            "priority": priority,
            "tags": ["sentient_ai_action", "escalated"]
        }
    }

    try:
        response = requests.post(
            f"{ZENDESK_URL}/tickets.json",
            json=payload,
            auth=(ZENDESK_USER, ZENDESK_TOKEN),
            headers={
                "Content-Type": "application/json"
            }
        )

        if response.status_code == 201:
            result = response.json()
            ticket_id = result["ticket"]["id"]
            ticket_url = result["ticket"]["url"].replace(".json", "") # Make it a human-readable URL
            
            return json.dumps({
                "status": "success",
                "ticket_id": ticket_id,
                "ticket_url": ticket_url,
                "message": f"Ticket {ticket_id} created successfully."
            })
        else:
            return json.dumps({
                "status": "error",
                "code": response.status_code,
                "message": f"Zendesk API error: {response.text}"
            })

    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Exception during ticket creation: {str(e)}"
        })
