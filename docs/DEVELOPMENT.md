# Development Guide

## Environment Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-org/sentient-retention-engine.git
   ```

2. **Setup Submodules (if applicable)**:
   This project uses a monorepo structure. Ensure all folders in `apps/` are present.

3. **Install Global Dependencies**:
   Ensure `docker`, `node`, and `python` are installed on your system.

## Workflow

### 1. Local Development

We recommend running services individually during active development to see hot-reloads:

- **Backend**: `cd apps/backend && npm run dev`
- **Frontend**: `cd apps/frontend && npm run dev`
- **ML Service**: `cd apps/ml-service && python main.py`

### 2. Adding a New Route

1. Define the controller method in `apps/backend/src/controllers/`.
2. Define the validation schema in `apps/backend/src/middleware/validator.js`.
3. Add the route to `apps/backend/src/routes/retentionRoutes.js` (ensuring correct `auth.protect` and `auth.restrictTo` modifiers).

### 3. Modifying AI Logic

1. AI logic resides in `apps/agentic-ai/core/`.
2. Modify `workflow.py` to change the LangGraph node sequence.
3. Test using the integrated terminal before deploying to the backend.

## Code Standards

- **Linting**: Run `npm run lint` in relevant service folders.
- **Security**: Run the security scanner before every commit:

  ```bash
  python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
  ```

## Testing

- **Backend**: `npm test`
- **Python**: `pytest`
- **Frontend**: `npm run test` (Vitest/Playwright)
