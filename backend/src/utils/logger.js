const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sentient-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add correlation ID middleware
const addCorrelationId = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || require('crypto').randomUUID();
  req.correlationId = correlationId;
  res.set('x-correlation-id', correlationId);
  logger.defaultMeta.correlationId = correlationId;
  next();
};

module.exports = { logger, addCorrelationId };