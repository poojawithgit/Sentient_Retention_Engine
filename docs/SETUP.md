# Setup Guide

This guide provides detailed instructions for setting up the Sentient Retention Engine for local development.

## 🐳 Docker Setup (Recommended)

The easiest way to get started is using Docker Compose, which orchestrates the entire stack including the database and Redis.

```bash
docker-compose up --build
```

Access the services at:

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`
- **ML Service**: `http://localhost:8001`

---

## 💻 Manual Local Setup

If you prefer to run services natively:

### 1. Database & Cache

Ensure PostgreSQL and Redis are running.

```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE sentient_retention;"
psql -U postgres -d sentient_retention -f infra/database/schema.sql

# Redis
redis-server
```

### 2. Backend

```bash
cd apps/backend
npm install
cp .env.example .env
# Update .env with your credentials
npm run dev
```

### 3. Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### 4. ML Service

```bash
cd apps/ml-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 5. Agentic AI

```bash
cd apps/agentic-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Each service requires specific environment variables. Refer to the `.env.example` files in each service directory for mandatory keys.

| Service | Key Variables |
| :--- | :--- |
| **Backend** | `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, `ML_SERVICE_URL`, `AI_SERVICE_URL` |
| **ML Service** | `PORT`, `MODEL_DIR` |
| **Agentic AI** | `GROQ_API_KEY`, `OPENAI_API_KEY`, `DATABASE_URL` |
| **Frontend** | `VITE_API_URL` |
