const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { logger, addCorrelationId } = require('./utils/logger');
const { measureRequestDuration } = require('./utils/metrics');
const errorHandler = require('./middleware/errorHandler');
const loaders = require('./loaders');
const retentionRoutes = require('./routes/retentionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security Middleware
app.use(helmet());

// Middleware
app.use(addCorrelationId);
app.use(measureRequestDuration);
app.use(express.json());
app.use(cors(config.cors));
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// Initialize Components via Loaders
const initApp = async () => {
  try {
    const { retentionController } = await loaders(app, config);

    // Routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1', retentionRoutes(retentionController));

    // Global Routes
    app.get('/', (req, res) => {
      res.json({
        message: 'Sentient Retention Engine - Backend is running',
        version: '1.2.0',
        status: 'UP'
      });
    });

    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        service: 'sentient-backend'
      });
    });

    // Error handling middleware
    app.use(errorHandler);

    logger.info('Backend components initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize backend components', { error: err.message });
    process.exit(1);
  }
};

initApp();

module.exports = app;