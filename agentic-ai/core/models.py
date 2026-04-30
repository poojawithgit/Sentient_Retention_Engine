from pydantic import BaseModel, Field
from typing import List, Optional

class ChurnAnalysis(BaseModel):
    score: float = Field(..., description="Churn risk score from 0 to 1")
    primary_driver: str = Field(..., description="Main reason for churn risk")
    risk_level: str = Field(..., description="Categorical risk level: HIGH, MEDIUM, LOW")

class RetentionStrategy(BaseModel):
    final_action: str = Field(..., description="Selected single best action from simulations")
    message: str = Field(..., description="Personalized retention message for the customer")
    confidence: float = Field(..., description="Confidence score in the selected strategy")
    bundle_details: str = Field(..., description="Specific details of the bundle or offer")

class SimulationResult(BaseModel):
    user_reaction: str = Field(..., description="Predicted user reaction to the offer")
    acceptance_probability: float = Field(..., description="Probability of user accepting the offer")
    new_churn_score: float = Field(..., description="Predicted churn score after intervention")

class BusinessRuleCheck(BaseModel):
    passed: bool = Field(..., description="Whether the strategy passed business rules")
    violations: List[str] = Field(default_factory=list, description="List of rule violations if any")
    requires_human: bool = Field(..., description="Whether human intervention is mandatory")
