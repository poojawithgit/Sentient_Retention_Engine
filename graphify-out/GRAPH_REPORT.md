# Graph Report - .  (2026-04-28)

## Corpus Check
- Corpus is ~12,898 words - fits in a single context window. You may not need a graph.

## Summary
- 242 nodes · 237 edges · 23 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Agent Reasoning and Planning|Agent Reasoning and Planning]]
- [[_COMMUNITY_System Documentation and Architecture|System Documentation and Architecture]]
- [[_COMMUNITY_Digital Twin Simulation Engine|Digital Twin Simulation Engine]]
- [[_COMMUNITY_ML Prediction Service|ML Prediction Service]]
- [[_COMMUNITY_Agentic API Layer|Agentic API Layer]]
- [[_COMMUNITY_Frontend Dashboard UI|Frontend Dashboard UI]]
- [[_COMMUNITY_Retention Agent Core|Retention Agent Core]]
- [[_COMMUNITY_Agent State and Workflow|Agent State and Workflow]]
- [[_COMMUNITY_ML Training Pipeline|ML Training Pipeline]]
- [[_COMMUNITY_Retention Offer Tool|Retention Offer Tool]]
- [[_COMMUNITY_Backend Express API|Backend Express API]]
- [[_COMMUNITY_Agent Configuration|Agent Configuration]]
- [[_COMMUNITY_Action Executor|Action Executor]]
- [[_COMMUNITY_Agent Memory Store|Agent Memory Store]]
- [[_COMMUNITY_Feature Engineering Pipeline|Feature Engineering Pipeline]]
- [[_COMMUNITY_Ticket Creation Tool|Ticket Creation Tool]]
- [[_COMMUNITY_User Notification Tool|User Notification Tool]]
- [[_COMMUNITY_CRM Update Tool|CRM Update Tool]]
- [[_COMMUNITY_Database Connection Layer|Database Connection Layer]]
- [[_COMMUNITY_Error Handling Middleware|Error Handling Middleware]]
- [[_COMMUNITY_React App Shell|React App Shell]]
- [[_COMMUNITY_Frontend Router|Frontend Router]]
- [[_COMMUNITY_Data Ingestion Script|Data Ingestion Script]]

## God Nodes (most connected - your core abstractions)
1. `DigitalTwinEngine` - 8 edges
2. `Sentient Retention Engine` - 8 edges
3. `Agentic AI Engine` - 7 edges
4. `predict_churn()` - 6 edges
5. `load_model()` - 5 edges
6. `train_model()` - 5 edges
7. `RetentionAgent` - 4 edges
8. `Planner` - 4 edges
9. `UserProfile` - 4 edges
10. `SimulationResult` - 4 edges

## Surprising Connections (you probably didn't know these)
- `scikit-learn (AI Service)` --semantically_similar_to--> `XGBoost Dependency`  [INFERRED] [semantically similar]
  agentic-ai/requirements.txt → ml-service/requirements.txt
- `train_model()` --calls--> `train_pipeline()`  [INFERRED]
  ml-service\main.py → ml-service\train.py
- `Agentic AI Engine` --conceptually_related_to--> `LangGraph Dependency`  [INFERRED]
  README.md → agentic-ai/requirements.txt
- `Agentic AI Engine` --conceptually_related_to--> `Decision Prompt Template (TODO)`  [INFERRED]
  README.md → agentic-ai/prompts/decision_prompt.txt
- `Agentic AI Engine` --conceptually_related_to--> `Explanation Prompt Template (TODO)`  [INFERRED]
  README.md → agentic-ai/prompts/explanation_prompt.txt

## Hyperedges (group relationships)
- **Agent Decision Pipeline** — readme_agentic_ai_engine, readme_observe_think_loop, decision_prompt_placeholder, explanation_prompt_placeholder [INFERRED 0.85]
- **Full-Stack Architecture** — readme_react_frontend, readme_nodejs_backend, readme_fastapi_ml_service, readme_postgresql_database [EXTRACTED 1.00]
- **ML Model Training Dependencies** — requirements_ai_scikit_learn, requirements_ml_xgboost, requirements_ml_psycopg2 [INFERRED 0.70]

## Communities

### Community 0 - "Agent Reasoning and Planning"
Cohesion: 0.16
Nodes (22): node_audit_log(), node_business_rules(), node_classifier(), node_digital_twin_sim(), node_engagement_api(), node_evaluator(), node_feedback_capture(), node_final_output() (+14 more)

### Community 1 - "System Documentation and Architecture"
Cohesion: 0.1
Nodes (23): Decision Prompt Template (TODO), Explanation Prompt Template (TODO), Vite HTML Entry Point, POST /api/v1/agent, Agentic AI Engine, Digital Twin Simulation, DISCOUNT Retention Action, EMAIL Retention Action (+15 more)

### Community 2 - "Digital Twin Simulation Engine"
Cohesion: 0.15
Nodes (12): create_user_profile(), DigitalTwinEngine, Simulate all available actions and return results.          Args:             us, Determine the best action based on simulation results.          Args:, Get a full recommendation including simulations and best action.          Args:, Helper function to create a UserProfile, Result of a simulation scenario, Digital Twin Simulation Engine for evaluating retention strategies.     Simulate (+4 more)

### Community 3 - "ML Prediction Service"
Cohesion: 0.2
Nodes (15): ChurnPredictionRequest, ChurnPredictionResponse, get_risk_level(), health_check(), load_model(), mock_predict(), predict_churn(), Train a new model using the ingestion pipeline and the CSV data (+7 more)

### Community 4 - "Agentic API Layer"
Cohesion: 0.23
Nodes (10): PipelineRequest, predict_churn(), PredictionRequest, root(), websocket_endpoint(), get_twin_state(), simulate_action(), twin_status() (+2 more)

### Community 5 - "Frontend Dashboard UI"
Cohesion: 0.26
Nodes (12): ActivityKPICard(), AuditLogTable(), BarChart(), ChainOfThoughtTerminal(), Dashboard(), DonutChart(), EscalationCard(), FeatureImportance() (+4 more)

### Community 6 - "Retention Agent Core"
Cohesion: 0.2
Nodes (2): RetentionAgent, Planner

### Community 7 - "Agent State and Workflow"
Cohesion: 0.22
Nodes (4): main(), RetentionState, build_workflow(), TypedDict

### Community 8 - "ML Training Pipeline"
Cohesion: 0.6
Nodes (3): preprocess_data(), Ported from the user's notebook: telco-customer-churn-prediction.ipynb, train_pipeline()

### Community 9 - "Retention Offer Tool"
Cohesion: 0.5
Nodes (2): Simulates sending a retention offer to a user., send_offer()

### Community 10 - "Backend Express API"
Cohesion: 0.67
Nodes (2): broadcast(), mockPredict()

### Community 11 - "Agent Configuration"
Cohesion: 0.67
Nodes (1): # TODO: Implement config.py logic

### Community 12 - "Action Executor"
Cohesion: 0.67
Nodes (1): # TODO: Implement core/executor.py logic

### Community 13 - "Agent Memory Store"
Cohesion: 0.67
Nodes (1): # TODO: Implement core/memory.py logic

### Community 14 - "Feature Engineering Pipeline"
Cohesion: 0.67
Nodes (1): # TODO: Implement models/feature_pipeline.py logic

### Community 15 - "Ticket Creation Tool"
Cohesion: 0.67
Nodes (1): # TODO: Implement tools/create_ticket.py logic

### Community 16 - "User Notification Tool"
Cohesion: 0.67
Nodes (1): # TODO: Implement tools/notify_user.py logic

### Community 17 - "CRM Update Tool"
Cohesion: 0.67
Nodes (1): # TODO: Implement tools/update_crm.py logic

### Community 18 - "Database Connection Layer"
Cohesion: 0.67
Nodes (1): connectWithRetry()

### Community 19 - "Error Handling Middleware"
Cohesion: 0.67
Nodes (1): errorHandler()

### Community 20 - "React App Shell"
Cohesion: 0.67
Nodes (1): App()

### Community 21 - "Frontend Router"
Cohesion: 0.67
Nodes (1): AppRouter()

### Community 22 - "Data Ingestion Script"
Cohesion: 0.67
Nodes (1): ingest_data()

## Knowledge Gaps
- **25 isolated node(s):** `User profile for digital twin simulation`, `Result of a simulation scenario`, `Digital Twin Simulation Engine for evaluating retention strategies.     Simulate`, `Simulate the effect of an action on user churn risk.          Args:`, `Simulate all available actions and return results.          Args:             us` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Retention Agent Core`** (10 nodes): `agent.py`, `planner.py`, `RetentionAgent`, `.__init__()`, `.run()`, `Planner`, `.create_plan()`, `.__init__()`, `agent.py`, `planner.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Retention Offer Tool`** (4 nodes): `send_offer.py`, `send_offer.py`, `Simulates sending a retention offer to a user.`, `send_offer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Express API`** (4 nodes): `app.js`, `app.js`, `broadcast()`, `mockPredict()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Configuration`** (3 nodes): `config.py`, `# TODO: Implement config.py logic`, `config.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Action Executor`** (3 nodes): `executor.py`, `# TODO: Implement core/executor.py logic`, `executor.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Memory Store`** (3 nodes): `memory.py`, `# TODO: Implement core/memory.py logic`, `memory.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Feature Engineering Pipeline`** (3 nodes): `feature_pipeline.py`, `feature_pipeline.py`, `# TODO: Implement models/feature_pipeline.py logic`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Ticket Creation Tool`** (3 nodes): `create_ticket.py`, `create_ticket.py`, `# TODO: Implement tools/create_ticket.py logic`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `User Notification Tool`** (3 nodes): `notify_user.py`, `notify_user.py`, `# TODO: Implement tools/notify_user.py logic`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CRM Update Tool`** (3 nodes): `update_crm.py`, `update_crm.py`, `# TODO: Implement tools/update_crm.py logic`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Connection Layer`** (3 nodes): `db.js`, `connectWithRetry()`, `db.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Error Handling Middleware`** (3 nodes): `error.middleware.js`, `error.middleware.js`, `errorHandler()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React App Shell`** (3 nodes): `App()`, `App.jsx`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Router`** (3 nodes): `AppRouter()`, `router.jsx`, `router.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Ingestion Script`** (3 nodes): `ingest_data.py`, `ingest_data()`, `ingest_data.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ChurnPredictionResponse` connect `ML Prediction Service` to `Agentic API Layer`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `train_model()` connect `ML Prediction Service` to `ML Training Pipeline`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Agentic AI Engine` (e.g. with `LangGraph Dependency` and `Decision Prompt Template (TODO)`) actually correct?**
  _`Agentic AI Engine` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `User profile for digital twin simulation`, `Result of a simulation scenario`, `Digital Twin Simulation Engine for evaluating retention strategies.     Simulate` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `System Documentation and Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._