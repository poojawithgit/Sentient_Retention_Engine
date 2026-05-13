import os
import json
import requests
from dotenv import load_dotenv
from langchain.tools import tool

# Load environment variables from .env file
load_dotenv()

@tool
def notify_user_via_email(customer_email: str, notification_type: str, subject: str, message_body: str) -> str:
    """
    Sends a notification email to the customer.
    
    Args:
        customer_email: The email address of the customer.
        notification_type: Type of notification (e.g., 'ALERT', 'OFFER', 'INFO').
        subject: Subject line of the email.
        message_body: The content of the email.
    
    Returns:
        A JSON string with the status of the operation.
    """
    print(f"INFO: Attempting to send email to {customer_email} (Type: {notification_type})")
    
    # --- CONFIGURATION ---
    # Use environment variables for email credentials
    # Assuming the backend uses SMTP, we need the credentials.
    # Since this is a tool, we'll use a generic HTTP call to the backend service 
    # which is the standard pattern for LangChain tools calling the backend.
    
    BACKEND_URL = os.getenv("BACKEND_URL") # e.g., http://localhost:8000
    
    if not BACKEND_URL:
        return json.dumps({
            "status": "error", 
            "message": "BACKEND_URL not configured in environment variables."
        })

    api_endpoint = f"{BACKEND_URL}/api/v1/notify-user"
    
    payload = {
        "email": customer_email,
        "notification_type": notification_type,
        "subject": subject,
        "body": message_body
    }
    
    try:
        # Call the backend endpoint to handle the actual email sending
        response = requests.post(
            api_endpoint, 
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            return response.text # Return the backend's confirmation message
        else:
            return json.dumps({
                "status": "error",
                "code": response.status_code,
                "message": f"Backend API error: {response.text}"
            })
            
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Exception during email notification: {str(e)}"
        })
