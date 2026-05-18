const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const response = {
    status: err.status,
    message: err.message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  logger.error('API Error', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId,
    stack: err.stack,
  });

  res.status(err.statusCode).json(response);
};

module.exports = errorHandler;
