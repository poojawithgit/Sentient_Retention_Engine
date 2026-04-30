const db = require('../config/db');

class RetentionRepository {
  async createChurnPrediction(data) {
    const { user_id, usage_score, complaints_count, payment_delay_count, churn_risk, risk_level } = data;
    return await db.query(
      'INSERT INTO churn_predictions (user_id, usage_score, complaints_count, payment_delay_count, churn_risk, risk_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, usage_score, complaints_count, payment_delay_count, churn_risk, risk_level]
    );
  }

  async createAgentMemory(data) {
    const { user_id, action, result, churn_risk, expected_churn, reason } = data;
    return await db.query(
      'INSERT INTO agent_memory (user_id, action, result, churn_risk, expected_churn, reason) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, action, result, churn_risk, expected_churn, reason]
    );
  }

  async getMemoryByUserId(userId) {
    const result = await db.query(
      'SELECT action, result, churn_risk, expected_churn, reason, executed_at as timestamp FROM agent_memory WHERE user_id = $1 ORDER BY executed_at DESC',
      [userId]
    );
    return result.rows;
  }

  async getAuditLogs(limit) {
    const result = await db.query(
      `SELECT
        m.user_id, m.action, m.churn_risk, m.expected_churn, m.executed_at as timestamp, p.risk_level
       FROM agent_memory m
       LEFT JOIN churn_predictions p ON m.user_id = p.user_id AND ABS(EXTRACT(EPOCH FROM (m.executed_at - p.predicted_at))) < 2
       ORDER BY m.executed_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async upsertUser(user_id) {
    return await db.query(
      'INSERT INTO users (user_id, email, name) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING',
      [user_id, `${user_id}@sre.internal`, user_id]
    );
  }

  async createRetentionAction(user_id, action_type, status) {
    const result = await db.query(
      'INSERT INTO retention_actions (user_id, action_type, status) VALUES ($1, $2, $3) RETURNING id, executed_at',
      [user_id, action_type, status]
    );
    return result.rows[0];
  }

  async getClaimedEscalations(specialist_id) {
    const result = await db.query(
      `SELECT ra.id, ra.user_id, ra.action_type, ra.status, ra.executed_at as claimed_at, am.reason, am.churn_risk
       FROM retention_actions ra
       LEFT JOIN agent_memory am ON am.user_id = ra.user_id AND am.action = 'HUMAN_INTERVENTION'
       WHERE ra.status = 'claimed' AND ra.action_type LIKE $1
       ORDER BY ra.executed_at DESC LIMIT 50`,
      [`CLAIMED_BY:${specialist_id}%`]
    );
    return result.rows;
  }

  async getKpiData(today) {
    const [
      interventions,
      totalProcessed,
      churnPrevented,
      activeUsers,
      distribution
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM retention_actions WHERE executed_at >= $1', [today]),
      db.query('SELECT COUNT(*) FROM churn_predictions'),
      db.query('SELECT AVG(churn_risk - expected_churn) as avg_improvement FROM agent_memory'),
      db.query('SELECT COUNT(DISTINCT user_id) FROM users'),
      db.query('SELECT action, COUNT(*) as count FROM agent_memory GROUP BY action')
    ]);

    return {
      interventionsToday: interventions.rows[0].count,
      totalProcessed: totalProcessed.rows[0].count,
      avgImprovement: churnPrevented.rows[0].avg_improvement,
      activeUsersCount: activeUsers.rows[0].count,
      distributionData: distribution.rows
    };
  }
}

module.exports = RetentionRepository;
