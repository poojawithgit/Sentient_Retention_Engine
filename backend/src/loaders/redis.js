const redis = require('redis');
const { logger } = require('../utils/logger');

const initRedis = async (app, config) => {
  const publisher = redis.createClient({ url: config.redisUrl });
  const subscriber = redis.createClient({ url: config.redisUrl });

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

  return { publisher, subscriber, broadcast };
};

module.exports = initRedis;
