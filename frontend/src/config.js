const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/api/v1/ws',
  AGENT_WS_URL: import.meta.env.VITE_AGENT_WS_URL || 'ws://localhost:8002/ws/agent',
  POLLING_INTERVAL: 10000,
  DEFAULT_SPECIALIST_ID: 'specialist_001'
};

export default config;
