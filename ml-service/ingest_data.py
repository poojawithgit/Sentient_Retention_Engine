import pandas as pd
import psycopg2
from psycopg2 import extras
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection details
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sentient_retention")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "Telco-Customer-Churn.csv")

def ingest_data():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    print(f"Loading data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)

    # Clean column names to match table schema
    df.columns = [col.lower().replace('-', '_').replace(' ', '_') for col in df.columns]
    # Small correction for senior_citizen
    if 'seniorcitizen' in df.columns:
        df.rename(columns={'seniorcitizen': 'senior_citizen'}, inplace=True)

    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # Clear existing data
        cur.execute("TRUNCATE TABLE raw_customer_churn CASCADE;")

        # Prepare data for insertion
        # Note: total_charges is currently VARCHAR in schema because of empty strings
        data = [tuple(x) for x in df.values]
        
        insert_query = """
        INSERT INTO raw_customer_churn (
            customer_id, gender, senior_citizen, partner, dependents, tenure,
            phone_service, multiple_lines, internet_service, online_security,
            online_backup, device_protection, tech_support, streaming_tv,
            streaming_movies, contract, paperless_billing, payment_method,
            monthly_charges, total_charges, churn
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        print(f"Inserting {len(data)} rows...")
        extras.execute_batch(cur, insert_query, data)

        conn.commit()
        cur.close()
        conn.close()
        print("Data ingestion complete!")

    except Exception as e:
        print(f"Error ingesting data: {e}")

if __name__ == "__main__":
    ingest_data()
