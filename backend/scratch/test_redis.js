const redis = require('redis');
require('dotenv').config({ path: './.env' });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log('Testing connection to:', redisUrl);

const client = redis.createClient({ url: redisUrl });

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  try {
    await client.connect();
    console.log('Successfully connected to Redis!');
    await client.set('test_key', 'hello');
    const val = await client.get('test_key');
    console.log('Test value:', val);
    await client.disconnect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
  }
})();
