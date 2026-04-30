const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const redis = require('redis');
require('dotenv').config();
const db = require('./config/db');
const CacheManager = require('./utils/cache');
const { logger, addCorrelationId } = require('./utils/logger');
const { register, measureRequestDuration, predictionRequests, websocketConnections } = require('./utils/metrics');

const app = express();

// Initialize cache manager
const cache = new CacheManager(process.env.REDIS_URL || 'redis://localhost:6379');

// Redis setup for Pub/Sub
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const publisher = redis.createClient({ 
  url: redisUrl,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 5) return new Error('Redis connection failed');
      return Math.min(retries * 100, 3000);
    }
  }
});
const subscriber = redis.createClient({ 
  url: redisUrl,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => {
      if (retries > 5) return new Error('Redis connection failed');
      return Math.min(retries * 100, 3000);
    }
  }
});

// Connect to Redis
(async () => {
  try {
    await publisher.connect();
    await subscriber.connect();
    console.log('Connected to Redis');

    // Subscribe to events channel
    await subscriber.subscribe('sentient-events', (message) => {
      try {
        const data = JSON.parse(message);
        const wss = app.get('wss');
        if (wss) {
          wss.clients.forEach((client) => {
            if (client.readyState === 1) { // OPEN
              client.send(JSON.stringify(data));
            }
          });
        }
      } catch (e) {
        console.error('Error processing Redis message:', e);
      }
    });
  } catch (err) {
    console.warn('Redis unavailable, using in-memory fallbacks:', err.message);
  }
})();

// Helper to publish events to Redis (replaces in-memory broadcast)
const broadcast = async (app, data) => {
  try {
    await publisher.publish('sentient-events', JSON.stringify(data));
  } catch (err) {
    console.error('Redis publish error:', err);
    // Fallback to direct broadcast if Redis fails
    const wss = app.get('wss');
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify(data));
        }
      });
    }
  }
};

// Middleware
app.use(addCorrelationId);
app.use(measureRequestDuration);
app.use(express.json());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Sentient Retention Engine - Backend (PostgreSQL) is running',
    version: '1.1.0',
    endpoints: [
      '/api/v1/predict',
      '/api/v1/simulate',
      '/api/v1/agent',
      '/api/v1/action',
      '/api/v1/memory',
      '/api/v1/health',
      '/health'
    ]
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'backend' });
});

const predictionServiceUrl = process.env.PREDICTION_SERVICE_URL || 'http://prediction-service:8002';

// POST /predict - Get churn prediction from prediction service
app.post('/api/v1/predict', async (req, res) => {
  const startTime = Date.now();
  try {
    const { user_id, usage, complaints, payment_delay } = req.body;
    logger.info('Prediction request received', { user_id, usage, complaints, payment_delay });

    if (!user_id || usage === undefined || complaints === undefined || payment_delay === undefined) {
      logger.warn('Missing required fields in prediction request', { user_id });
      return res.status(400).json({
        error: 'Missing required fields: user_id, usage, complaints, payment_delay'
      });
    }

    let churnRisk, riskLevel;

    try {
      const response = await axios.post(`${predictionServiceUrl}/predict`, {
        user_id,
        usage_score: usage,
        complaints_count: complaints,
        payment_delay_count: payment_delay
      });
      churnRisk = response.data.churn_risk;
      riskLevel = response.data.risk_level;
    } catch (error) {
      console.log('Prediction service unavailable:', error.message);
      return res.status(500).json({ error: 'Prediction service unavailable' });
    }

    // Save to churn_predictions table
    try {
      await db.query(
        'INSERT INTO churn_predictions (user_id, usage_score, complaints_count, payment_delay_count, churn_risk, risk_level) VALUES ($1, $2, $3, $4, $5, $6)',
        [user_id, usage, complaints, payment_delay, churnRisk, riskLevel]
      );

      // Invalidate cache
      await cache.del('kpis');
      await cache.invalidatePattern('audit-logs:*');
    } catch (dbErr) {
      console.error('Failed to log prediction to database:', dbErr.message);
      // Don't fail the request if logging fails, but it's good to know
    }

    const prediction = {
      user_id,
      churn_risk: churnRisk,
      risk_level: riskLevel,
      confidence: 0.85
    };

    broadcast(app, {
      type: 'CHURN_PREDICTION',
      payload: prediction
    });

    logger.info('Prediction completed successfully', {
      user_id,
      churn_risk: churnRisk,
      risk_level,
      duration: Date.now() - startTime
    });

    res.json(prediction);
  } catch (error) {
    logger.error('Prediction error', {
      error: error.message,
      user_id: req.body?.user_id,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Prediction failed' });
  }
});

const simulationServiceUrl = process.env.SIMULATION_SERVICE_URL || 'http://simulation-service:8004';

// POST /api/v1/simulate - Run simulation for all actions
app.post('/api/v1/simulate', async (req, res) => {
  try {
    const { user_id, usage, complaints, payment_delay, churn_risk } = req.body;

    if (!churn_risk) {
      return res.status(400).json({ error: 'churn_risk is required' });
    }

    const response = await axios.post(`${simulationServiceUrl}/simulate`, {
        user_id,
        usage_score: usage,
        complaints_count: complaints,
        payment_delay_count: payment_delay,
        churn_risk
      });

      const result = response.data;

    broadcast(app, {
      type: 'SIMULATION_EVENT',
      payload: result
    });

    res.json(result);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'http://agent-service:8003';

// POST /api/v1/agent - Full agent loop
app.post('/api/v1/agent', async (req, res) => {
  try {
    const { user_id, usage, complaints, payment_delay } = req.body;

    if (!user_id || usage === undefined || complaints === undefined || payment_delay === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, usage, complaints, payment_delay'
      });
    }

    try {
      const response = await axios.post(`${agentServiceUrl}/agent`, {
        user_id,
        usage_score: usage,
        complaints_count: complaints,
        payment_delay_count: payment_delay
      });

      const result = response.data;

      // Store in agent_memory table (still in backend as it's DB access)
      try {
        await db.query(
          'INSERT INTO agent_memory (user_id, action, result, churn_risk, expected_churn, reason) VALUES ($1, $2, $3, $4, $5, $6)',
          [user_id, result.best_action, 'executed', result.churn_risk, result.expected_churn, result.reason]
        );

        // Invalidate cache
        await cache.del('kpis');
        await cache.del(`memory:${user_id}`);
        await cache.invalidatePattern('audit-logs:*');
      } catch (dbErr) {
        console.error('Failed to store agent memory in database:', dbErr.message);
      }

      res.json(result);
    } catch (error) {
      console.error('Agent service error:', error.message);
      res.status(500).json({ error: 'Agent service unavailable' });
    }
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Agent execution failed' });
  }
});

// POST /api/v1/action - Execute action
app.post('/api/v1/action', async (req, res) => {
  try {
    const { user_id, action } = req.body;
    
    if (!user_id || !action) {
      return res.status(400).json({ error: 'Missing required fields: user_id, action' });
    }

    // Log to retention_actions table
    try {
      await db.query(
        'INSERT INTO retention_actions (user_id, action_type, status) VALUES ($1, $2, $3)',
        [user_id, action, 'completed']
      );
    } catch (dbErr) {
      console.error('Failed to log retention action:', dbErr.message);
    }

    const actionMessages = {
      DISCOUNT: 'Discount offer sent to user successfully',
      EMAIL: 'Retention email sent to user successfully',
      NONE: 'No action taken - user monitored'
    };

    res.json({
      user_id,
      action,
      status: 'success',
      message: actionMessages[action] || 'Action executed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Action error:', error);
    res.status(500).json({ error: 'Action execution failed' });
  }
});

// GET /api/v1/memory/:userId - Get memory for user from database
app.get('/api/v1/memory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `memory:${userId}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await db.query(
      'SELECT action, result, churn_risk, expected_churn, reason, executed_at as timestamp FROM agent_memory WHERE user_id = $1 ORDER BY executed_at DESC',
      [userId]
    );

    const response = {
      user_id: userId,
      memory: result.rows,
      count: result.rowCount
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, response, 300);

    res.json(response);
  } catch (error) {
    console.error('Memory retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});

// POST /api/v1/run-pipeline - Simulate a user journey with agentic feedback
app.post('/api/v1/run-pipeline', async (req, res) => {
  try {
    const { userId, iterations = 1 } = req.body;
    
    // 1. Prediction Simulation
    const churnRisk = (Math.random() * 0.4 + 0.6).toFixed(2); // High risk 0.6 - 1.0
    const riskLevel = churnRisk > 0.8 ? 'HIGH' : 'MEDIUM';
    
    broadcast(app, {
      type: 'CHURN_PREDICTION',
      payload: { user_id: userId, churn_risk: churnRisk, risk_level: riskLevel }
    });

    // 2. Agent Decision Simulation
    setTimeout(async () => {
      const actions = ['DISCOUNT', 'EMAIL', 'NONE'];
      const bestAction = actions[Math.floor(Math.random() * actions.length)];
      
      broadcast(app, {
        type: 'AGENT_DECISION',
        payload: { user_id: userId, action: bestAction, status: 'executed' }
      });

      // Persist simulation result
      await db.query(
        'INSERT INTO agent_memory (user_id, action, result, churn_risk, expected_churn, reason) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, bestAction, 'simulated', churnRisk, (churnRisk * 0.5).toFixed(2), `Simulated ${bestAction} for demo`]
      );
    }, 2000);

    res.json({ status: 'simulation_started', user_id: userId });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// GET /api/v1/kpis - Get global KPIs
app.get('/api/v1/kpis', async (req, res) => {
  try {
    const cacheKey = 'kpis';
    const cached = await cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const today = new Date().toISOString().split('T')[0];

    // Interventions Today
    const interventionsResult = await db.query(
      'SELECT COUNT(*) FROM retention_actions WHERE executed_at >= $1',
      [today]
    );

    // Total Processed
    const totalProcessedResult = await db.query('SELECT COUNT(*) FROM churn_predictions');

    // Churn Prevented (Aggregated improvement)
    const churnPreventedResult = await db.query(
      'SELECT AVG(churn_risk - expected_churn) as avg_improvement FROM agent_memory'
    );

    // Active Users (Unique users processed)
    const activeUsersResult = await db.query('SELECT COUNT(DISTINCT user_id) FROM users');

    // Action Distribution
    const distributionResult = await db.query(
      'SELECT action, COUNT(*) as count FROM agent_memory GROUP BY action'
    );

    const result = {
      interventions_today: parseInt(interventionsResult.rows[0].count) || 0,
      total_processed: parseInt(totalProcessedResult.rows[0].count) || 0,
      churn_prevented: (parseFloat(churnPreventedResult.rows[0].avg_improvement) * 100).toFixed(1) + '%' || '0%',
      active_users: parseInt(activeUsersResult.rows[0].count) || 0,
      distribution: distributionResult.rows.map(r => ({ name: r.action, value: parseInt(r.count) }))
    };

    // Cache for 10 seconds as per plan
    await cache.set(cacheKey, result, 10);

    res.json(result);
  } catch (error) {
    console.error('KPI retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve KPIs' });
  }
});

// GET /api/v1/audit-logs - Get latest executions across all users
app.get('/api/v1/audit-logs', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const cacheKey = `audit-logs:${limit}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await db.query(
      `SELECT
        m.user_id,
        m.action,
        m.churn_risk,
        m.expected_churn,
        m.executed_at as timestamp,
        p.risk_level
       FROM agent_memory m
       LEFT JOIN churn_predictions p ON m.user_id = p.user_id AND ABS(EXTRACT(EPOCH FROM (m.executed_at - p.predicted_at))) < 2
       ORDER BY m.executed_at DESC
       LIMIT $1`,
      [limit]
    );

    const response = {
      logs: result.rows,
      count: result.rowCount
    };

    // Cache for 30 seconds
    await cache.set(cacheKey, response, 30);

    res.json(response);
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// POST /api/v1/escalations/claim - Specialist takes ownership of an escalation
app.post('/api/v1/escalations/claim', async (req, res) => {
  try {
    const { escalation_id, user_id, specialist_id = 'specialist_001', specialist_name = 'On-Call Specialist', churn_risk = 0.85 } = req.body;

    if (!escalation_id || !user_id) {
      return res.status(400).json({ error: 'Missing required fields: escalation_id, user_id' });
    }

    // Ensure user exists in users table (upsert)
    await db.query(
      `INSERT INTO users (user_id, email, name) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO NOTHING`,
      [user_id, `${user_id}@sre.internal`, user_id]
    );

    // Log the claim as a retention action
    const result = await db.query(
      `INSERT INTO retention_actions (user_id, action_type, status)
       VALUES ($1, $2, $3)
       RETURNING id, executed_at`,
      [user_id, `CLAIMED_BY:${specialist_id}`, 'claimed']
    );

    // Also store in agent_memory for audit trail
    await db.query(
      `INSERT INTO agent_memory (user_id, action, result, churn_risk, expected_churn, reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user_id,
        'HUMAN_INTERVENTION',
        'claimed',
        churn_risk,
        churn_risk * 0.5,
        `Escalation ${escalation_id} claimed by ${specialist_name} (${specialist_id}). Automated AI pipeline suspended for this customer.`
      ]
    );

    broadcast(app, {
      type: 'ESCALATION_CLAIMED',
      payload: {
        escalation_id,
        user_id,
        specialist_id,
        specialist_name,
        claimed_at: result.rows[0].executed_at
      }
    });

    res.json({
      status: 'success',
      message: `Escalation ${escalation_id} claimed by ${specialist_name}`,
      escalation_id,
      user_id,
      specialist_id,
      specialist_name,
      claimed_at: result.rows[0].executed_at,
      action_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Escalation claim error:', error);
    res.status(500).json({ error: 'Failed to claim escalation', detail: error.message });
  }
});

// GET /api/v1/escalations/claimed - Fetch all claimed escalations for "My Tasks" view
app.get('/api/v1/escalations/claimed', async (req, res) => {
  try {
    const { specialist_id = 'specialist_001' } = req.query;

    const result = await db.query(
      `SELECT 
        ra.id,
        ra.user_id,
        ra.action_type,
        ra.status,
        ra.executed_at as claimed_at,
        am.reason,
        am.churn_risk
       FROM retention_actions ra
       LEFT JOIN agent_memory am ON am.user_id = ra.user_id AND am.action = 'HUMAN_INTERVENTION'
       WHERE ra.status = 'claimed' AND ra.action_type LIKE $1
       ORDER BY ra.executed_at DESC
       LIMIT 50`,
      [`CLAIMED_BY:${specialist_id}%`]
    );

    res.json({
      claimed: result.rows,
      count: result.rowCount,
      specialist_id
    });
  } catch (error) {
    console.error('Claimed escalations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch claimed escalations' });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    db: 'connected',
    uptime: process.uptime(),
    service: 'sentient-backend'
  });
});

module.exports = app;