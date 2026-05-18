# Gemini Agentic AI Integration Plan

## Goal
Integrate Google Gemini as the primary LLM provider for the Sentient Retention Engine platform using a robust, hybrid Flash/Pro setup, dynamic prompt security injection from the GovernanceEngine, and an elegant fallback mechanism.

## Tasks
- [ ] Task 1: Add `langchain-google-genai` to `apps/agentic-ai/requirements.txt` → Verify: Dependency is listed in `requirements.txt`
- [ ] Task 2: Install the required dependencies in the `agentic-ai` environment → Verify: Successful pip installation without package conflicts
- [ ] Task 3: Update `apps/agentic-ai/core/llm_provider.py` to support `gemini_flash` (`gemini-1.5-flash`) and `gemini_pro` (`gemini-1.5-pro`) with standard environment variables (`GOOGLE_API_KEY`, `GEMINI_API_KEY`) and fallback to Groq/OpenAI if keys are missing → Verify: `get_llm("gemini_flash")` and `get_llm("gemini_pro")` return correct model instances
- [ ] Task 4: Integrate LLM capability into `apps/agentic-ai/core/nodes/strategy_nodes.py` to generate strategy recommendations using `gemini_pro` and dynamically inject allowed/blocked policies into the system instructions → Verify: Run planning node and verify generated candidates align with the customer's risk drivers and respect blocked actions
- [ ] Task 5: Integrate LLM capability into `apps/agentic-ai/core/nodes/simulation_nodes.py` to simulate customer reactions using `gemini_flash` → Verify: Simulation results are generated probabilistically by the Gemini model
- [ ] Task 6: Add security & lint validations and run checklist.py → Verify: `python .agent/scripts/checklist.py .` passes all checks

## Done When
- [ ] Gemini Flash & Pro are initialized successfully in `llm_provider.py`
- [ ] Strategy planning and customer simulation nodes leverage Gemini models with dynamic system prompt permission checks
- [ ] The entire retention pipeline executes successfully with telemetry logging

## Notes
- We use a hybrid model setup (`gemini-1.5-pro` for strategy generation/decisions, `gemini-1.5-flash` for simulation/analysis).
- Safety policies from the `GovernanceEngine` are injected into Gemini's system prompt (Defense-in-Depth).
