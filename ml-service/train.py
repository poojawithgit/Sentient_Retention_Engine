import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "database", "Telco-Customer-Churn.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def preprocess_data(df):
    """
    Ported from the user's notebook: telco-customer-churn-prediction.ipynb
    """
    # 1. Drop customerID
    if 'customerID' in df.columns:
        df = df.drop('customerID', axis=1)
    
    # 2. Convert TotalCharges to numeric, handle missing values
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    df = df.dropna()

    # 3. Map binary columns
    binary_cols = ['Partner', 'Dependents', 'PhoneService', 'PaperlessBilling', 'Churn']
    for col in binary_cols:
        if col in df.columns:
            df[col] = df[col].map({'Yes': 1, 'No': 0})
    
    # gender mapping
    if 'gender' in df.columns:
        df['gender'] = df['gender'].map({'Male': 1, 'Female': 0})

    # 4. Map 'No internet service' and 'No phone service' to -1 for simplicity (as seen in notebook)
    categorical_with_no_service = [
        'MultipleLines', 'OnlineSecurity', 'OnlineBackup', 
        'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies'
    ]
    for col in categorical_with_no_service:
        if col in df.columns:
            # The notebook seems to have specifically mapped 'No internet service' and 'No phone service'
            # Looking at the notebook sample output: tenure: 48, OnlineSecurity: 1, etc.
            # Let's map accurately based on notebook cell #9 and #10
            df[col] = df[col].replace({'Yes': 1, 'No': 0, 'No internet service': -1, 'No phone service': -1})

    # 5. Contract mapping (cell #13)
    cmap = {
        "Month-to-month": 1,
        "One year": 12,
        "Two year": 24
    }
    if 'Contract' in df.columns:
        df['Contract'] = df['Contract'].map(cmap)

    # 6. Get dummies for InternetService and PaymentMethod (cell #16)
    df = pd.get_dummies(df, columns=["InternetService", "PaymentMethod"], drop_first=True, dtype=int)

    # 7. Add feature 'kalanay' (cell #22)
    df['kalanay'] = df['Contract'] % df['tenure']
    # Handle division by zero for tenure=0 (shouldn't be any as we dropped NaNs and tenure 0 is rare)
    df['kalanay'] = df['kalanay'].replace([np.inf, -np.inf], 0).fillna(0)

    # Convert everything to float/int
    df = df.astype(float)

    return df

def train_pipeline():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        return

    print(f"Loading data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    
    print("Preprocessing data...")
    df_processed = preprocess_data(df)
    
    # Split features and target
    X = df_processed.drop('Churn', axis=1)
    y = df_processed['Churn']
    
    # Save the feature names for prediction alignment
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, os.path.join(MODELS_DIR, "feature_names.pkl"))
    
    print(f"Training on {len(X)} samples with {len(feature_names)} features.")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Using RandomForest as in the notebook
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    print("Model Evaluation:")
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    # Save model
    joblib.dump(model, os.path.join(MODELS_DIR, "churn_model.pkl"))
    print(f"Model saved to {os.path.join(MODELS_DIR, 'churn_model.pkl')}")

if __name__ == "__main__":
    train_pipeline()
