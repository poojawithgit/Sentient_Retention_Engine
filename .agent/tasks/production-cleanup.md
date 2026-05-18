# Task: Production-Grade Codebase Cleanup & Restructuring

## Objective

Transform the Sentient Retention Engine from a hackathon prototype into a production-ready, highly maintainable, and enterprise-grade AI governance platform with standardized architecture and verified security boundaries, while maintaining all previous core features and simulation logic.

---

## Refactoring Roadmap

### Phase 1: Repository Audit & Dead Code Liquidation

* Scan and delete unused temporary, mock, or legacy files.
* Remove unused icons, assets, and test artifacts.
* Clean up redundant config files and trace/debug logs.

### Phase 2: Root Directory Restructuring (Enterprise Layout)

* Create new top-level directories:
  * `frontend/` (Move from `apps/frontend`)
  * `backend/` (Move from `apps/backend`)
  * `agents/` (Move from `apps/agentic-ai`)
  * `simulation/` (Move from `apps/ml-service` and core simulation nodes)
  * `governance/` (Consolidate policy and engine logic)
  * `observability/` (Standardize logging, metrics, and tracing config)
  * `security/` (House RBAC rules and dynamic check schemas)
  * `shared/` (Centralize shared utilities, schemas, and types)
* Create backward-compatible Windows Directory Junctions inside `apps/` to ensure current background dev servers (`npm run dev`, `python api/ai_api.py`) continue running with zero downtime:
  * `apps/frontend` -> `frontend`
  * `apps/backend` -> `backend`
  * `apps/agentic-ai` -> `agents`
  * `apps/ml-service` -> `simulation`
* Update `docker-compose.yml` build contexts and volume mounts to reflect the new production structure.
* Update `infra/nginx/nginx.conf` and other service dependencies to point directly to the restructured paths.

### Phase 3: Frontend Polish & Typography Refinement

* Enforce the typographic brutalist system in the new `frontend/` layout:
  * Configure Inter, Bebas Neue, and JetBrains Mono in `frontend/tailwind.config.js`.
  * Refactor `frontend/src/styles/index.css` to use sharp brutalist elements (`rounded-sm`/`rounded-[2px]`).
* Remove unused components, routes, and dead states.
* Verify error boundaries and layout responsiveness in `GovernanceView` and `LoginPage`.

### Phase 4: Backend, Database & API Consolidation

* Clean up redundant route handlers and duplicated validation schemas in `backend/`.
* Separate business logic into distinct Controller and Service layers.
* Standardize the DB client initialization and connection pooling.

### Phase 5: AI Agent & Governance Reorganization

* Relocate agent workflow management, trust levels, and registry logic into a clean directory in `agents/`.
* Standardize rule validation checks in `governance/` using deterministic Python/Node schemas.
* Verify permission interceptors and the emergency override telemetry injection pipeline.

### Phase 6: Security, secrets, and Environment Variables Sanitization

* Scan and ensure no hardcoded secrets exist in the active folders.
* Audit `.env.example` templates and verify secure JWT/Auth validation.
* Sanitize logging statements to ensure zero leak of PII or sensitive keys.

### Phase 7: Observability & Logging Standardization

* Centralize log formatting, event naming, and governance audit schemas inside `observability/`.
* Ensure structured JSON logging across all backend and agent execution pathways.

### Phase 8: Verification & Automated Audits

* Run `python .agent/scripts/checklist.py .` to ensure 100% linting, security, and schema validation compliance.
* Run `python .agent/scripts/verify_all.py .` to verify production and accessibility parameters.
* Generate the final production audit and cleanup report.
