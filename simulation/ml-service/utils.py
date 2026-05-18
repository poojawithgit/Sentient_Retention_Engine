import pandas as pd
import numpy as np
import joblib
import os
import logging
import json
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-service")

def log_event(event_type: str, data: dict):
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        **data
    }
    logger.info(json.dumps(log_entry))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FEATURES_PATH = os.path.join(BASE_DIR, "models", "feature_names.pkl")

def get_feature_names():
    if os.path.exists(FEATURES_PATH):
        return joblib.load(FEATURES_PATH)
    return []

def preprocess_single_request(data: dict, feature_names: list):
    """
    Preprocess a single prediction request to match training features.
    If customer_id is provided, try to find them in the dataset to get more accurate fields.
    """
    user_id = data.get('user_id')
    csv_data = {}
    
    # Try to fetch from CSV if user_id exists in the telco dataset
    # This allows us to use real data for customers in the spreadsheet
    try:
        csv_path = os.path.join(BASE_DIR, "..", "..", "infra", "database", "Telco-Customer-Churn.csv")
        if os.path.exists(csv_path):
            df_full = pd.read_csv(csv_path)
            customer_row = df_full[df_full['customerID'] == user_id]
            if not customer_row.empty:
                # Found the customer in the telco dataset!
                # We should use their actual fields instead of defaults.
                row = customer_row.iloc[0].to_dict()
                # We need to apply the same mapping as in train.py
                csv_data['gender'] = 1 if row['gender'] == 'Male' else 0
                csv_data['SeniorCitizen'] = int(row['SeniorCitizen'])
                csv_data['Partner'] = 1 if row['Partner'] == 'Yes' else 0
                csv_data['Dependents'] = 1 if row['Dependents'] == 'Yes' else 0
                csv_data['tenure'] = int(row['tenure'])
                csv_data['PhoneService'] = 1 if row['PhoneService'] == 'Yes' else 0
                csv_data['MultipleLines'] = 1 if row['MultipleLines'] == 'Yes' else (0 if row['MultipleLines'] == 'No' else -1)
                csv_data['OnlineSecurity'] = 1 if row['OnlineSecurity'] == 'Yes' else (0 if row['OnlineSecurity'] == 'No' else -1)
                csv_data['OnlineBackup'] = 1 if row['OnlineBackup'] == 'Yes' else (0 if row['OnlineBackup'] == 'No' else -1)
                csv_data['DeviceProtection'] = 1 if row['DeviceProtection'] == 'Yes' else (0 if row['DeviceProtection'] == 'No' else -1)
                csv_data['TechSupport'] = 1 if row['TechSupport'] == 'Yes' else (0 if row['TechSupport'] == 'No' else -1)
                csv_data['StreamingTV'] = 1 if row['StreamingTV'] == 'Yes' else (0 if row['StreamingTV'] == 'No' else -1)
                csv_data['StreamingMovies'] = 1 if row['StreamingMovies'] == 'Yes' else (0 if row['StreamingMovies'] == 'No' else -1)
                
                cmap = {"Month-to-month": 1, "One year": 12, "Two year": 24}
                csv_data['Contract'] = cmap.get(row['Contract'], 1)
                csv_data['PaperlessBilling'] = 1 if row['PaperlessBilling'] == 'Yes' else 0
                csv_data['MonthlyCharges'] = float(row['MonthlyCharges'])
                csv_data['TotalCharges'] = pd.to_numeric(row['TotalCharges'], errors='coerce')
                
                # Dummies (set manually based on feature_names)
                csv_data['InternetService_Fiber optic'] = 1 if row['InternetService'] == 'Fiber optic' else 0
                csv_data['InternetService_No'] = 1 if row['InternetService'] == 'No' else 0
                csv_data['PaymentMethod_Credit card (automatic)'] = 1 if row['PaymentMethod'] == 'Credit card (automatic)' else 0
                csv_data['PaymentMethod_Electronic check'] = 1 if row['PaymentMethod'] == 'Electronic check' else 0
                csv_data['PaymentMethod_Mailed check'] = 1 if row['PaymentMethod'] == 'Mailed check' else 0
                
                print(f"Loaded data from CSV for customer {user_id}")
    except Exception as e:
        print(f"Error fetching customer from CSV: {e}")

    # Create a base dataframe with defaults or CSV data
    defaults = {
        'gender': 1,
        'SeniorCitizen': 0,
        'Partner': 0,
        'Dependents': 0,
        'tenure': 24, # Default to 2 years if unknown
        'PhoneService': 1,
        'MultipleLines': 0,
        'OnlineSecurity': 0,
        'OnlineBackup': 0,
        'DeviceProtection': 0,
        'TechSupport': 0,
        'StreamingTV': 0,
        'StreamingMovies': 0,
        'Contract': 12,
        'PaperlessBilling': 1,
        'MonthlyCharges': float(data.get('usage', 50.0)),
        'TotalCharges': float(data.get('usage', 50.0)) * 12,
        'InternetService_Fiber optic': 0,
        'InternetService_No': 0,
        'PaymentMethod_Credit card (automatic)': 0,
        'PaymentMethod_Electronic check': 0,
        'PaymentMethod_Mailed check': 0,
    }
    
    # Override defaults with CSV data if found
    for k, v in csv_data.items():
        defaults[k] = v
        
    # Update defaults with specifically provided data from request
    for key, value in data.items():
        if key in defaults and value is not None:
            defaults[key] = value

    # Calculate 'kalanay'
    defaults['kalanay'] = defaults['Contract'] % defaults['tenure'] if defaults['tenure'] > 0 else 0
    
    # Create DataFrame
    df = pd.DataFrame([defaults])
    
    # Ensure all required features are present and in correct order
    for col in feature_names:
        if col not in df.columns:
            df[col] = 0
            
    return df[feature_names]

def get_risk_level(risk: float) -> str:
    if risk < 0.4: return "LOW"
    if risk < 0.7: return "MEDIUM"
    return "HIGH"

def mock_predict(usage: float, complaints: int, payment_delay: int) -> float:
    base_risk = 0.3
    usage_factor = 0.5 if usage < 10 else 0.3 if usage < 20 else 0.1 if usage < 50 else -0.1
    complaints_factor = complaints * 0.2
    payment_factor = payment_delay * 0.15
    risk = base_risk + usage_factor + complaints_factor + payment_factor
    return round(max(0.0, min(1.0, risk)), 4)
