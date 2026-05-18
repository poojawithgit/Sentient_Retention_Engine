import psycopg2
from psycopg2 import extras
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

def get_db_connection():
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def fetch_customer_data(customer_id: str):
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM raw_customer_churn WHERE customer_id = %s", (customer_id,))
            result = cur.fetchone()
            return result
    except Exception as e:
        print(f"Error fetching customer data: {e}")
        return None
    finally:
        conn.close()

def create_retention_action(customer_id: str, action_type: str, status: str = 'pending'):
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO retention_actions (user_id, action_type, status) VALUES (%s, %s, %s) RETURNING id",
                (customer_id, action_type, status)
            )
            result = cur.fetchone()
            conn.commit()
            return result['id'] if result else None
    except Exception as e:
        print(f"Error creating retention action: {e}")
        return None
    finally:
        conn.close()

def create_agent_memory(customer_id: str, action: str, result: str, churn_risk: float, reason: str):
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO agent_memory (user_id, action, result, churn_risk, reason) VALUES (%s, %s, %s, %s, %s)",
                (customer_id, action, result, churn_risk, reason)
            )
            conn.commit()
    except Exception as e:
        print(f"Error creating agent memory: {e}")
    finally:
        conn.close()

def fetch_governance_policies():
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM governance_policies WHERE is_active = TRUE")
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching governance policies: {e}")
        return []
    finally:
        conn.close()

def create_governance_audit_log(agent_id: str, action: str, risk_score: float, status: str, reason: str, metadata: dict = None):
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor() as cur:
            import json
            cur.execute(
                "INSERT INTO governance_audit_logs (agent_id, action_attempted, risk_score, status, reason, metadata) VALUES (%s, %s, %s, %s, %s, %s)",
                (agent_id, action, risk_score, status, reason, json.dumps(metadata) if metadata else None)
            )
            conn.commit()
    except Exception as e:
        print(f"Error creating governance audit log: {e}")
    finally:
        conn.close()

def create_approval_request(customer_id: str, agent_id: str, action: str, risk_score: float, payload: dict):
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            import json
            cur.execute(
                "INSERT INTO approval_requests (customer_id, agent_id, action_requested, risk_score, request_payload) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (customer_id, agent_id, action, risk_score, json.dumps(payload))
            )
            result = cur.fetchone()
            conn.commit()
            return result['id'] if result else None
    except Exception as e:
        print(f"Error creating approval request: {e}")
        return None
    finally:
        conn.close()

def fetch_agent_trust_levels():
    """
    Fetches all agent trust levels from the database.
    """
    conn = get_db_connection()
    if not conn:
        return {}
    
    try:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute("SELECT agent_id, trust_level FROM agent_trust_levels WHERE is_active = TRUE")
            results = cur.fetchall()
            return {row['agent_id']: row['trust_level'] for row in results}
    except Exception as e:
        print(f"Error fetching agent trust levels: {e}")
        return {}
    finally:
        conn.close()

def update_agent_trust_level(agent_id: str, new_trust_level: float):
    """
    Updates the trust level for a specific agent.
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE agent_trust_levels SET trust_level = %s, updated_at = CURRENT_TIMESTAMP WHERE agent_id = %s",
                (new_trust_level, agent_id)
            )
            conn.commit()
            return True
    except Exception as e:
        print(f"Error updating agent trust level: {e}")
        return False
    finally:
        conn.close()
