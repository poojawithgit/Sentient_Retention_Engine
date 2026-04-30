const redis = require('redis');

class CacheManager {
  constructor(redisUrl) {
    const isTls = redisUrl.startsWith('rediss://');
    
    this.client = redis.createClient({ 
      url: redisUrl,
      socket: {
        tls: isTls,
        rejectUnauthorized: false, // Required for many cloud providers
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Maximum reconnection attempts reached. Continuing without cache.');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 200, 5000);
        }
      }
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('Redis: Connected successfully'));
    
    this.client.connect().catch(err => {
      console.error('Redis Initial Connection Error:', err.message);
    });
  }

  async get(key) {
    if (!this.client.isOpen) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.client.isOpen) return;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      console.error('Cache set error:', err);
    }
  }

  async del(key) {
    if (!this.client.isOpen) return;
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Cache del error:', err);
    }
  }

  async invalidatePattern(pattern) {
    if (!this.client.isOpen) return;
    try {
      const keys = [];
      for await (const key of this.client.scanIterator({
        MATCH: pattern,
        COUNT: 100
      })) {
        keys.push(key);
      }
      
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (err) {
      console.error('Cache invalidate error:', err);
    }
  }
}

module.exports = CacheManager;