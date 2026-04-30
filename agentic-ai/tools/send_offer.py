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
