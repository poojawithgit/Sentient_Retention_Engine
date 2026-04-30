import json
from core.workflow import build_workflow
from core.state import RetentionState

def main():
    print("Building workflow...")
    app = build_workflow()
    
    print("\n--- Testing High Risk Customer Flow ---")
    high_risk_input: RetentionState = {
        "customer_id": "cust_123_high",
        "plan_tier": "Premium",
        "usage_last_30d": 10.5,
        "billing_history": "Failed",
        "support_ticket_count": 2, # >0 triggers high risk churn score >0.65 in mock
        "network_drop_events": 5,
        "last_login": "2023-10-01",
        "payment_status": "Overdue"
    }
    
    result = app.invoke(high_risk_input)
    print("\nFinal State for High Risk:")
    print(json.dumps(result.get("output_payload", {}), indent=2))
    print(f"Action Taken: {result.get('final_action')}")
    
    print("\n\n--- Testing Low Risk Customer Flow ---")
    low_risk_input: RetentionState = {
        "customer_id": "cust_456_low",
        "plan_tier": "Basic",
        "usage_last_30d": 50.0,
        "billing_history": "Paid",
        "support_ticket_count": 0, # triggers low risk churn score <0.65 in mock
        "network_drop_events": 0,
        "last_login": "2023-10-25",
        "payment_status": "Current"
    }
    
    result = app.invoke(low_risk_input)
    print("\nFinal State for Low Risk:")
    print(json.dumps(result.get("output_payload", {}), indent=2))
    print(f"Action Taken: {result.get('final_action')}")

if __name__ == "__main__":
    main()
