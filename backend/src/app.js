const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const redis = require('redis');
const config = require('./config');
const db = require('./config/db');
const CacheManager = require('./utils/cache');
const { logger, addCorrelationId } = require('./utils/logger');
const { measureRequestDuration } = require('./utils/metrics');
const errorHandler = require('./middleware/errorHandler');

// Services and Controllers
const RetentionService = require('./services/retentionService');
const RetentionController = require('./controllers/retentionController');
const retentionRoutes = require('./routes/retentionRoutes');

const app = express();

// Initialize Cache
const cache = new CacheManager(config.redisUrl);

// Redis setup for Pub/Sub
const publisher = redis.createClient({ url: config.redisUrl });
const subscriber = redis.createClient({ url: config.redisUrl });

const initRedis = async () => {
  try {
    await publisher.connect();
    await subscriber.connect();
    logger.info('Connected to Redis Pub/Sub');

    await subscriber.subscribe('sentient-events', (message) => {
      try {
        const data = JSON.parse(message);
        const wss = app.get('wss');
        if (wss) {
          wss.clients.forEach((client) => {
            if (client.readyState === 1) client.send(JSON.stringify(data));
          });
        }
      } catch (e) {
        logger.error('Error processing Redis message', { error: e.message });
      }
    });
  } catch (err) {
    logger.warn('Redis Pub/Sub unavailable, using in-memory fallbacks', { error: err.message });
  }
};

initRedis();

const broadcast = async (data) => {
  try {
    if (publisher.isOpen) {
      await publisher.publish('sentient-events', JSON.stringify(data));
    } else {
      const wss = app.get('wss');
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) client.send(JSON.stringify(data));
        });
      }
    }
  } catch (err) {
    logger.error('Broadcast error', { error: err.message });
  }
};

// Middleware
app.use(addCorrelationId);
app.use(measureRequestDuration);
app.use(express.json());
app.use(cors(config.cors));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const RetentionRepository = require('./repositories/retentionRepository');

// ... existing imports ...

// Initialize Components
const retentionRepository = new RetentionRepository();
const retentionService = new RetentionService(cache, retentionRepository);
const retentionController = new RetentionController(retentionService, broadcast);

// Routes
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

module.exports = app;