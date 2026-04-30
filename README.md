# Sentient Retention Engine

A production-ready Agentic AI system for SaaS Churn Prediction and Retention. This platform combines Machine Learning for churn prediction, Agentic Decision-Making for action selection, and Digital Twin Simulation for evaluating retention strategies before execution.

## Architecture Overview

┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                          │
│                  Dashboard with Tailwind CSS                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                    │
│              REST API + Agent Orchestration                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│  ML SERVICE             │     │  DIGITAL TWIN ENGINE        │
│  (FastAPI + scikit)     │     │  (Python Simulation)        │
│  - Churn Prediction     │     │  - Action Evaluation        │
│  - Risk Classification  │     │  - Strategy Comparison      │
└─────────────────────────┘     └─────────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│  POSTGRESQL DATABASE   │
│  - User Data            │
│  - Agent Memory         │
│  - Decision Logs        │
└─────────────────────────┘

## Core Features

### 1. ML-Based Churn Prediction

- Uses features: usage, complaints, payment_delay
- Returns churn probability (0-1) with risk level (LOW/MEDIUM/HIGH)
- Fallback mock prediction when ML service unavailable

### 2. Agentic AI Engine

Implements a full decision-making loop:

1. **OBSERVE** - Receive user data + churn risk from ML
2. **THINK** - Interpret risk level (LOW < 0.4, MEDIUM 0.4-0.7, HIGH > 0.7)
3. **SIMULATE** - Digital Twin evaluates all actions
4. **DECIDE** - Select action with lowest simulated churn
5. **EXPLAIN** - Generate human-readable reasoning
6. **ACT** - Return structured response

### 3. Digital Twin Simulation

Evaluates retention strategies before execution:

- **DISCOUNT** - 25% base churn reduction
- **EMAIL** - 10% base churn reduction
- **NONE** - No intervention

### 4. Memory System

Stores past decisions for learning and audit:

- userId, action, result, churn_risk, expected_churn

## Project Structure

sentient-retention-engine/
├── frontend/                 # React + Tailwind CSS
│   ├── src/
│   │   ├── app/             # App configuration
│   │   ├── pages/           # Dashboard page
│   │   └── services/        # API client
│   └── package.json
│
├── backend/                  # Node.js + Express
│   ├── src/
│   │   └── app.js           # Main API server
│   ├── index.js
│   └── package.json
│
├── ml-service/               # Python + FastAPI
│   ├── main.py              # ML API endpoints
│   └── requirements.txt
│
├── digital-twin/             # Digital Twin Engine
│   └── engine.py            # Simulation logic
│
├── agentic-engine/           # Agentic AI Engine
│   └── engine.py            # Full agent loop
│
├── database/                 # PostgreSQL
│   └── schema.sql           # Database schema
│
└── README.md

## API Endpoints

### POST /api/v1/predict

Get churn prediction from ML service.

**Request:**

```json
{
  "user_id": "user_001",
  "usage": 15,
  "complaints": 3,
  "payment_delay": 2
}
```

**Response:**

```json
{
  "user_id": "user_001",
  "churn_risk": 0.65,
  "risk_level": "MEDIUM",
  "confidence": 0.85
}
```

### POST /api/v1/simulate

Run Digital Twin simulation for all actions.

**Request:**

```json
{
  "user_id": "user_001",
  "churn_risk": 0.65
}
```

### POST /api/v1/agent

Full agent loop - predict, simulate, decide, explain.

**Request:**

```json
{
  "user_id": "user_001",
  "usage": 15,
  "complaints": 3,
  "payment_delay": 2
}
```

**Response:**

```json
{
  "user_id": "user_001",
  "churn_risk": 0.65,
  "risk_level": "MEDIUM",
  "simulations": {
    "DISCOUNT": { "simulated_churn": 0.49, "reduction_percentage": 24.6 },
    "EMAIL": { "simulated_churn": 0.59, "reduction_percentage": 9.2 },
    "NONE": { "simulated_churn": 0.65, "reduction_percentage": 0 }
  },
  "best_action": "DISCOUNT",
  "expected_churn": 0.49,
  "reason": "User has MEDIUM churn risk (65.0%), proactive engagement recommended...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### POST /api/v1/action

Execute a retention action (mock).

### POST /api/v1/memory

Store decision in memory.

### GET /api/v1/memory/:userId

Retrieve memory for a user.

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE sentient_retention;"

# Run schema
psql -U postgres -d sentient_retention -f database/schema.sql
```

### 2. ML Service Setup

```bash
cd ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start service
python main.py
# Service runs on http://localhost:8001

# Optional: Train model
curl -X POST http://localhost:8001/train
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start server
npm start
# Server runs on http://localhost:8000
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env file:
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

## Running the Full System

1. Start PostgreSQL
2. Start ML Service: `cd ml-service && python main.py`
3. Start Backend: `cd backend && npm start`
4. Start Frontend: `cd frontend && npm run dev`
5. Open browser to <http://localhost:5173>

## How Agent Flow Works

User Input (usage, complaints, payment_delay)
         │
         ▼
┌─────────────────────────────────────┐
│         ML SERVICE                   │
│   Predict churn probability         │
│   usage=15, complaints=3, delay=2   │
│   → churn_risk = 0.65               │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       AGENTIC AI ENGINE             │
│                                     │
│ OBSERVE: Receive user data          │
│ THINK:   Risk level = MEDIUM        │
│ SIMULATE:                          │
│   DISCOUNT → 0.49 (24.6% reduction) │
│   EMAIL   → 0.59 (9.2% reduction)   │
│   NONE    → 0.65 (no change)        │
│ DECIDE:  Best = DISCOUNT            │
│ EXPLAIN: Generate reasoning         │
│ ACT:     Return structured response │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       FRONTEND DASHBOARD            │
│   Display risk, simulations,        │
│   best action, and AI reasoning     │
└─────────────────────────────────────┘

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, Axios
- **ML Service**: Python, FastAPI, scikit-learn
- **Database**: PostgreSQL
- **Digital Twin**: Python (simulated)

## License

MIT License
