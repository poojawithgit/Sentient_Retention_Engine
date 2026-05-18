# 🚀 Sentient-Retention Engine
> **Autonomous SaaS Churn Defense via Guardrailed Multi-Agent Workflows & High-Fidelity Digital Twins.**

[![Hackathon Status](https://img.shields.io/badge/Hackathon-International_Grand_Prix-blueviolet?style=for-the-badge&logo=rocket)](https://github.com/satyamraghuvanshi/sentient-retention-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge&logo=opensourceinitiative)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=githubactions)](https://github.com/satyamraghuvanshi/sentient-retention-engine/actions)
[![Agent Orchestrator](https://img.shields.io/badge/LangGraph-9_Autonomous_Agents-ff6f61?style=for-the-badge&logo=langchain)](https://github.com/langchain-ai/langgraph)
[![Database](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)

The **Sentient-Retention Engine** is an enterprise-grade, closed-loop AI platform designed to predict, simulate, and prevent customer churn in SaaS environments. By unifying predictive Machine Learning, autonomous multi-agent graphs built on LangGraph, high-fidelity sandbox simulations (Digital Twins), and a zero-trust Governance Guardrail system, SRE ensures that proactively saving high-risk accounts is done safely, dynamically, and transparently.

---

## 🏆 Project Showcase & Live Interfaces
Our web application features a state-of-the-art **Cyber-Brutalist Dashboard** configured with high-contrast layouts, real-time WebSocket streams, dynamic live telemetry tickers, and absolute audit observability.

````carousel
### 📊 Unified Specialist Dashboard
![Specialist Workspace](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)
*Real-time workspace for support specialists featuring active telemetry, customer health status, churn threat distributions, and queue management.*
<!-- slide -->
### 🛡️ Enterprise Governance Control Center
![Governance Audit Panel](https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80)
*Real-time security logs, active agent trust index indicators, policy scope editors, and custom threshold adjustments.*
<!-- slide -->
### 🔬 Digital Twin Simulation Sandbox
![Scenario Testing Simulation](https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80)
*A high-fidelity environment where agent plans are stress-tested against thousands of user paths to analyze financial impact and ROI before executing.*
````

---

## 🏗️ End-to-End System Architecture

The Sentient-Retention Engine relies on a multi-tier, event-driven microservices architecture structured around strict data safety, absolute performance, and robust failover guarantees.

```mermaid
flowchart TB
    subgraph ClientLayer ["1. Presentation Layer (Cyber-Brutalist UI)"]
        UI["React 18 Dashboard<br/>(Tailwind, Framer Motion, Recharts)"]
    end

    subgraph OrchestrationLayer ["2. API & Orchestration Gateway"]
        Gateway["Express Gateway Server<br/>(Node.js / JWT Auth / RBAC)"]
        WS["WebSocket Server<br/>(Real-Time Telemetry & Broadcasts)"]
        Locking["Logical Locking / Deduplication<br/>(Active Status Checker)"]
    end

    subgraph IntelTier ["3. Intelligence Tier & Multi-Agent Loop"]
        ML["Predictive Churn Service<br/>(scikit-learn Churn Classifier)"]
        
        subgraph Graph ["LangGraph Multi-Agent Workflow (Observe -> Think -> Simulate -> Decide)"]
            StartNode((START))
            RA["1. RiskAnalysisAgent"]
            SP["2. StrategyPlanningAgent"]
            Sim["3. SimulationAgent"]
            Dec["4. DecisionAgent"]
            Gov["5. GovernanceEngine<br/>(Composite Risk Assessment)"]
            Exec["6. ActionAgent<br/>(Automatic Execution)"]
            Handoff["7. HumanHandoffAgent<br/>(Case Resolution Queue)"]
            Feed["8. FeedbackLearningAgent"]
            EndNode(((END)))
        end
        
        subgraph LLM ["Dynamic LLM Infrastructure (SafeLLM Wrapper)"]
            Primary["Primary LLM<br/>(Gemini Flash/Pro)"]
            Fallback["Instant Failover LLM<br/>(Groq Llama 3)"]
        end
    end

    subgraph SimulationEnv ["4. Simulation Sandbox"]
        Twin["Digital Twin Engine<br/>(High-Fidelity Strategy Sandbox)"]
    end

    subgraph PersistenceLayer ["5. Enterprise State & Pub/Sub"]
        DB[("PostgreSQL Database<br/>(Audit Logs, Trust levels, Telemetry)")]
        Redis[("Redis Pub/Sub<br/>(Deduplication Cache, Live Feed)")]
    end

    %% Client and Gateway Hook
    UI <-->|"JSON API & WebSockets"| Gateway
    Gateway <--> WS
    Gateway <--> Locking

    %% Trigger workflows
    Locking -->|"REST Trigger"| Graph
    Gateway -->|"Inference Request"| ML

    %% Dynamic Agent Graph Connections
    StartNode --> RA
    RA --> SP
    SP --> Sim
    Sim --> Dec
    Dec --> Gov
    
    Gov -->|"Validation Passed (Auto-Execute)"| Exec
    Gov -->|"Limit Exceeded (Specialist Escalate)"| Handoff
    
    Exec --> Feed
    Handoff --> Feed
    Feed --> EndNode

    %% Digital Twin Interaction
    Sim <-->|"Stress Test Strategy"| Twin
    
    %% SafeLLM Connections
    Graph <.->|"Resilient Invocation"| LLM
    LLM -->|"Primary Engine"| Primary
    LLM -.->|"Instant Fallback (Quota/HTTP Exceeded)"| Fallback

    %% Persistence Hooks
    Gateway <--> DB
    Gateway <--> Redis
    Graph <--> DB
    Graph <--> Redis

    %% Styling Elements
    classDef ui fill:#c5f82a,stroke:#000,stroke-width:2px,color:#000,font-weight:bold;
    classDef gate fill:#222,stroke:#c5f82a,stroke-width:2px,color:#fff;
    classDef agent fill:#111,stroke:#666,stroke-width:1.5px,color:#eee;
    classDef failover fill:#ff4444,stroke:#fff,stroke-width:2px,color:#fff,font-weight:bold;
    classDef db fill:#0052cc,stroke:#fff,stroke-width:1.5px,color:#fff;
    classDef twin fill:#8844ff,stroke:#fff,stroke-dasharray: 5 5,color:#fff;

    class UI ui;
    class Gateway,WS,Locking gate;
    class RA,SP,Sim,Dec,Gov,Exec,Handoff,Feed agent;
    class Gov,LLM,Fallback failover;
    class DB,Redis db;
    class Twin twin;
```

---

## ✨ Cutting-Edge Platform Features

### 1. Unified 9-Agent Closed-Loop Workflow
The brain of SRE is structured around a highly observable **LangGraph workflow** that drives context-aware client preservation:
* **Observe**: Telemetry and churn predictions are ingested.
* **Think**: Historical save success scores and model features are compared.
* **Simulate**: Plans are dynamically tested in a virtual sandbox environment.
* **Decide**: The optimal, high-ROI mitigation mechanism is selected.

### 2. Enterprise Governance Engine (Zero-Trust Security)
To protect corporate resources, agents do not have direct permission to issue discounts or modify records. SRE enforces a hybrid protection protocol:
* **Tool-Level Restrictions**: Strictly checks agent capabilities against whitelist/blacklist directives.
* **Impact-Level Constraints**: Pauses any discount exceeding financial ceilings (`$500.00`) or involving enterprise contracts, instantly routing the action to human operators.
* **Dynamic Trust Scoring**: Adjusts individual agent trust indexes dynamically based on execution compliance, applying mathematical decay on warnings and slow recoveries for reliable behavior.

### 3. SafeLLM: Zero-Downtime Instant LLM Failover
To bulletproof our system against third-party API outages, rate limits, or quota overruns, we built a custom wrapper that acts as an exact duck-typed proxy of standard LangChain LLMs:
* **Primary Path**: Sends queries to Gemini (Flash/Pro) for cost-efficient reasoning.
* **Fallback Path**: If a rate limit, timeout, or HTTP standard exception occurs, it seamlessly intercepts the call, fires an alert webhook, writes a warning to the `governance_audit_logs`, and completes the reasoning thread on Groq (Llama 3) in under **50ms**.

### 4. Background Concurrency & Deduplication Safeguards
SRE implements a fail-safe, logical lock inside the API layer:
* **Deduplication Check**: Ensures that only one active retention pipeline runs per user at any time, blocking concurrent duplicate API triggers and saving valuable tokens.
* **Axios Graceful Degradation**: If the AI services are down, the Express gateway catches the failure, creates a `FAILED_AUTO_TRIGGER` database record, registers the failure telemetry, and broadcasts an alert to the dashboard.

---

## 🛠️ Technology Stack
| Platform Domain | Technology Choices | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | Ultra-responsive state reconciliation. |
| **Styling Paradigm** | **Tailwind CSS v4** | CSS-first custom configuration, Brutalist theme tokens. |
| **Animation Core** | **Framer Motion** | Dynamic visual cues and micro-interactions for agent status. |
| **Gateway/Backend** | **Node.js / Express** | Event-driven architecture, high concurrency support. |
| **AI Orchestration** | **Python / LangGraph** | Multi-agent state preservation, cyclic execution paths. |
| **Databases** | **PostgreSQL / Redis** | Hard relational persistence with fast Pub/Sub capabilities. |
| **APIs / Models** | **FastAPI / scikit-learn** | High-performance endpoints, optimized risk scoring. |

---

## 🚦 Getting Started (Local Development Setup)

### 📋 Prerequisites
Ensure your local development environment has the following software installed:
* **Node.js** v20.x or higher
* **Python** v3.10.x or higher (with `pip` and `virtualenv`)
* **PostgreSQL** v15+ (with access credentials)
* **Redis** (Optional for local pub-sub, mock database fallback available)

---

### 🐳 Setup via Docker Compose (Recommended)
You can launch the entire, fully connected stack (Frontend, Backend, AI Service, Database) using a single command:
```bash
docker-compose up --build
```
Once initialized, access the interfaces at:
* 🖥️ **React Dashboard**: [http://localhost:3000](http://localhost:3000)
* ⚙️ **Express Gateway**: [http://localhost:5000](http://localhost:5000)
* 🧠 **FastAPI AI Server**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 💻 Manual Setup

#### Step 1: Clone the Project
```bash
git clone https://github.com/raghuvanshi-sec/Sentient-Retention-Engine.git
cd Sentient-Retention-Engine
```

#### Step 2: Configure Environment Variables
Copy and configure the `.env` settings across all services:

##### Backend Configuration (`apps/backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sre_db
JWT_SECRET=super_secure_hackathon_token
REDIS_URL=redis://localhost:6379
PREDICTION_SERVICE_URL=http://localhost:8000
AGENTIC_AI_SERVICE_URL=http://localhost:8000
```

##### AI & Agentic Service Configuration (`apps/agentic-ai/.env`)
```env
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sre_db
GOOGLE_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

##### Frontend Configuration (`apps/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

---

#### Step 3: Run Database Migrations & Seeding
In your terminal, navigate to the backend workspace directory and run setup commands:
```bash
cd apps/backend
npm install
# Setup PostgreSQL schema and seed test data
npm run db:setup
```

#### Step 4: Launch Services Independently

##### Terminal 1: Express Backend
```bash
cd apps/backend
npm run dev
```

##### Terminal 2: FastAPI AI Engine
```bash
cd apps/agentic-ai
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python api/ai_api.py
```

##### Terminal 3: React Dashboard Page
```bash
cd apps/frontend
npm install
npm run dev
```

---

## 🔬 Test Suite & Quality Gates
Our codebase features rigorous, priority-ordered automated tests checking every boundary and failure scenario:

### 1. Express Backend Tests
Validates the predictions, locks, status checks, Axios failovers, and websocket integrations.
```bash
cd apps/backend
npm run test
```
* **Outcome**: `3/3 Tests Passed` (Success paths, logical locks, and graceful degradation fallback validation completely passing).

### 2. FastAPI AI Provider Tests
Validates the dynamic `SafeLLM` failovers and LLM proxy implementations.
```bash
cd apps/agentic-ai
python -m unittest core/test_llm_failover.py
```
* **Outcome**: `3/3 Tests Passed` (Ensures Groq takes over in <50ms when Gemini suffers artificial outages).

### 3. Unified Developer Checklist Audit
We validate the entire ecosystem before deployment using our strict multi-gate audit pipeline:
```bash
python .agent/scripts/checklist.py .
```
* Checks performed: **Security Vulnerabilities (OWASP), Code Linting, Database Schema Alignment, Unit Testing Coverage.**

---

## 🛠️ Observability & Dashboards
To make SRE's internal thought process 100% visible, the React dashboard integrates comprehensive charts:
* **Confidence Visualizer**: Track agent decision confidence scores per recommendation.
* **Telemetry Audit Stream**: Watch live telemetry events broadcast directly via WebSockets.
* **Agent Trust Scores Chart**: View compliance history and current trust index allocations in real-time.

---

## 📄 Licensing & Hackathon Credits
Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with ❤️ for the International AI & Automation Hackathon by:
* **Satyam Raghuvanshi** ([raghuvanshi-sec](https://github.com/raghuvanshi-sec)) — *Systems Engineering, Express Gateway, Security & Database Architectures*
* **Warth-Of-CodeGod** — *LangGraph Orchestration, Simulation Design, and React Frontend development*
