# System Architecture

## Overview

The Sentient Retention Engine is a distributed system designed for real-time customer retention management. It utilizes a modular microservices approach to separate concerns between user interface, business logic, machine learning, and autonomous decision-making.

## Core Components

### 1. Frontend (`apps/frontend`)

- **Type**: Single Page Application (SPA)
- **Framework**: React 18 + Vite
- **Key Features**:
  - Real-time KPI dashboards.
  - Interactive Agentic Pipeline visualization.
  - Admin management for specialists and escalations.
  - Secure authentication via JWT.

### 2. Backend (`apps/backend`)

- **Type**: API Gateway & Orchestrator
- **Framework**: Node.js + Express
- **Responsibilities**:
  - Centralized Authentication & Authorization (RBAC).
  - Proxying requests to internal services (ML, AI).
  - Database persistence for memories, logs, and user state.
  - WebSocket management for real-time pipeline updates.

### 3. ML Service (`apps/ml-service`)

- **Type**: Predictive Inference Service
- **Framework**: Python + FastAPI
- **Model**: scikit-learn (RandomForest/GradientBoosting)
- **Functions**:
  - `POST /predict`: Calculates churn probability and risk levels.
  - `POST /train`: Retrains the model on updated customer datasets.

### 4. Agentic AI (`apps/agentic-ai`)

- **Type**: Decision Engine
- **Framework**: Python + LangGraph
- **Engine**: Digital Twin Simulation
- **Functions**:
  - Orchestrates the full retention loop.
  - Runs parallel simulations to compare outcome probabilities.
  - Generates natural language reasoning for human specialists.

## Data Flow

1. **Ingestion**: Raw customer metrics are stored in PostgreSQL.
2. **Analysis**: Backend triggers `ml-service` to assess risk.
3. **Deciding**: If risk > threshold, `agentic-ai` is invoked.
4. **Simulation**: Digital Twin evaluates "Discount" vs "Outreach".
5. **Execution**: Selected action is logged and presented on the Dashboard.
6. **Escalation**: High-risk cases are flagged for human specialists.

## Infrastructure

- **Database**: PostgreSQL for persistent storage.
- **Cache**: Redis for session management and quick KPI retrieval.
- **Proxy**: Nginx as a reverse proxy for internal routing.
- **Containers**: Fully dockerized for consistent deployment.
