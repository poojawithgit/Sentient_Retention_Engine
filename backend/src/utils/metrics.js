const promClient = require('prom-client');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'sentient-backend'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const predictionRequests = new promClient.Counter({
  name: 'prediction_requests_total',
  help: 'Total number of prediction requests',
  labelNames: ['status']
});

const websocketConnections = new promClient.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(predictionRequests);
register.registerMetric(websocketConnections);
register.registerMetric(dbQueryDuration);

// Middleware to measure HTTP request duration
const measureRequestDuration = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
};

module.exports = {
  register,
  httpRequestDuration,
  predictionRequests,
  websocketConnections,
  dbQueryDuration,
  measureRequestDuration
};