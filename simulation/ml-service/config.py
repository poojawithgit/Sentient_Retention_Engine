from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    # API Settings
    APP_NAME: str = "Sentient-Retention ML Service"
    DEBUG: bool = False
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    
    # Model Settings
    MODEL_DIR: str = os.path.join(os.path.dirname(__file__), "models")
    MODEL_FILE: str = "churn_model.pkl"
    SCALER_FILE: str = "scaler.pkl"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @property
    def model_path(self) -> str:
        return os.path.join(self.MODEL_DIR, self.MODEL_FILE)
    
    @property
    def scaler_path(self) -> str:
        return os.path.join(self.MODEL_DIR, self.SCALER_FILE)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
