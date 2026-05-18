from typing import Dict, Any, List
from dataclasses import dataclass
import json


@dataclass
class UserProfile:
    """User profile for digital twin simulation"""

    user_id: str
    usage: float
    complaints: int
    payment_delay: int
    churn_risk: float


@dataclass
class SimulationResult:
    """Result of a simulation scenario"""

    action: str
    original_churn: float
    simulated_churn: float
    reduction: float
    reduction_percentage: float


class DigitalTwinEngine:
    """
    Digital Twin Simulation Engine for evaluating retention strategies.
    Simulates the impact of different actions before actual execution.
    """

    # Action effect multipliers (calibrated for realistic simulation)
    ACTION_EFFECTS = {
        "DISCOUNT": {
            "base_reduction": 0.25,  # 25% base reduction
            "usage_boost": 0.1,  # boosts usage by 10%
            "payment_boost": -0.05,  # reduces payment delay tendency
        },
        "EMAIL": {
            "base_reduction": 0.10,  # 10% base reduction
            "usage_boost": 0.05,  # small usage boost
            "payment_boost": 0.0,  # no payment effect
        },
        "NONE": {
            "base_reduction": 0.0,  # no change
            "usage_boost": 0.0,
            "payment_boost": 0.0,
        },
    }

    def __init__(self):
        self.simulation_history = []

    def simulate(self, user: UserProfile, action: str) -> SimulationResult:
        """
        Simulate the effect of an action on user churn risk.

        Args:
            user: User profile with current state
            action: Action to simulate (DISCOUNT, EMAIL, NONE)

        Returns:
            SimulationResult with predicted outcomes
        """
        if action not in self.ACTION_EFFECTS:
            raise ValueError(f"Unknown action: {action}")

        effects = self.ACTION_EFFECTS[action]
        original_churn = user.churn_risk

        # Calculate churn reduction
        base_reduction = effects["base_reduction"]

        # Adjust based on user characteristics
        # High-risk users benefit more from interventions
        risk_multiplier = 1 + (original_churn * 0.5)

        # Calculate simulated churn
        reduction = base_reduction * risk_multiplier
        simulated_churn = max(0.0, original_churn - reduction)

        reduction_pct = (reduction / original_churn * 100) if original_churn > 0 else 0

        result = SimulationResult(
            action=action,
            original_churn=original_churn,
            simulated_churn=round(simulated_churn, 4),
            reduction=round(reduction, 4),
            reduction_percentage=round(reduction_pct, 2),
        )

        self.simulation_history.append(
            {"user_id": user.user_id, "action": action, "result": result.__dict__}
        )

        return result

    def simulate_all_actions(self, user: UserProfile) -> Dict[str, SimulationResult]:
        """
        Simulate all available actions and return results.

        Args:
            user: User profile with current state

        Returns:
            Dictionary mapping action names to simulation results
        """
        results = {}
        for action in ["DISCOUNT", "EMAIL", "NONE"]:
            results[action] = self.simulate(user, action)
        return results

    def get_best_action(self, simulations: Dict[str, SimulationResult]) -> str:
        """
        Determine the best action based on simulation results.

        Args:
            simulations: Dictionary of simulation results

        Returns:
            Best action name
        """
        best_action = "NONE"
        lowest_churn = float("inf")

        for action, result in simulations.items():
            if result.simulated_churn < lowest_churn:
                lowest_churn = result.simulated_churn
                best_action = action

        return best_action

    def get_recommendation(self, user: UserProfile) -> Dict[str, Any]:
        """
        Get a full recommendation including simulations and best action.

        Args:
            user: User profile with current state

        Returns:
            Complete recommendation with all details
        """
        simulations = self.simulate_all_actions(user)
        best_action = self.get_best_action(simulations)

        return {
            "user_id": user.user_id,
            "original_churn": user.churn_risk,
            "simulations": {
                action: {
                    "simulated_churn": result.simulated_churn,
                    "reduction": result.reduction,
                    "reduction_percentage": result.reduction_percentage,
                }
                for action, result in simulations.items()
            },
            "best_action": best_action,
            "expected_churn": simulations[best_action].simulated_churn,
        }


def create_user_profile(
    user_id: str, usage: float, complaints: int, payment_delay: int, churn_risk: float
) -> UserProfile:
    """Helper function to create a UserProfile"""
    return UserProfile(
        user_id=user_id,
        usage=usage,
        complaints=complaints,
        payment_delay=payment_delay,
        churn_risk=churn_risk,
    )


if __name__ == "__main__":
    # Test the simulation engine
    engine = DigitalTwinEngine()

    # Create sample user
    user = create_user_profile(
        user_id="user_123", usage=15.0, complaints=3, payment_delay=2, churn_risk=0.65
    )

    # Get recommendation
    recommendation = engine.get_recommendation(user)

    print("Digital Twin Simulation Results:")
    print(json.dumps(recommendation, indent=2))
