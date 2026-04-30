export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    CHARTS: '/dashboard/charts',
  },
  CUSTOMERS: {
    LIST: '/customers',
    DETAIL: (id) => `/customers/${id}`,
    CHURN_PREDICTION: (id) => `/customers/${id}/predict-churn`,
  },
  RETENTION: {
    CAMPAIGNS: '/retention/campaigns',
    METRICS: '/retention/metrics',
  },
};

export default ENDPOINTS;
