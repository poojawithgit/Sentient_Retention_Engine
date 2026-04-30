require('dotenv').config();

const config = {
  port: process.env.PORT || 8000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  services: {
    prediction: process.env.PREDICTION_SERVICE_URL || 'http://localhost:8001',
    agent: process.env.AGENT_SERVICE_URL || 'http://localhost:8003',
    agenticAi: process.env.AGENTIC_AI_URL || 'http://localhost:8002',
    simulation: process.env.SIMULATION_SERVICE_URL || 'http://localhost:8004',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

module.exports = config;
