class RetentionAgent:
    def __init__(self, planner, executor, memory):
        self.planner = planner
        self.executor = executor
        self.memory = memory

    def run(self, user_id, objective):
        print(f"Agent starting task for user {user_id}: {objective}")
        
        # 1. Plan the steps
        plan = self.planner.create_plan(user_id, objective)
        print(f"Plan generated: {plan}")

        # 2. Execute the steps
        results = []
        for step in plan:
            result = self.executor.execute(step)
            results.append(result)
            self.memory.save(user_id, step, result)
        
        return results

if __name__ == "__main__":
    # Placeholder for initializing components
    print("Retention Agent Logic Loaded")
