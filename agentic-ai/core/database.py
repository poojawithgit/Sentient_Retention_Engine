import psycopg2
from psycopg2 import extras
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sentient_retention")

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
