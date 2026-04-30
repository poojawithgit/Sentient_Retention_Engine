class Planner:
    def __init__(self, model_name="gpt-4"):
        self.model_name = model_name

    def create_plan(self, user_id, objective):
        # AI Logic to decide which tools to use
        # For now, return a static sequence based on objective
        if "churn" in objective.lower():
            return ["predict_churn_risk", "analyze_segment", "generate_retention_offer"]
        return ["notify_success"]
