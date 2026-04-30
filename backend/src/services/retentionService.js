const axios = require('axios');
const config = require('../config');
const { logger } = require('../utils/logger');
const { AppError } = require('../utils/errors');

class RetentionService {
  constructor(cache, repository) {
    this.cache = cache;
    this.repository = repository;
  }

  async predictChurn(userData) {
    const { user_id, usage, complaints, payment_delay } = userData;
    
    try {
      const response = await axios.post(`${config.services.prediction}/predict`, {
        user_id,
        usage_score: usage,
        complaints_count: complaints,
        payment_delay_count: payment_delay
      });

      const { churn_risk, risk_level } = response.data;

      await this.repository.createChurnPrediction({
        user_id,
        usage_score: usage,
        complaints_count: complaints,
        payment_delay_count: payment_delay,
        churn_risk,
        risk_level
      });

      await this.cache.del('kpis');
      await this.cache.invalidatePattern('audit-logs:*');

      return { user_id, churn_risk, risk_level, confidence: 0.85 };
    } catch (error) {
      logger.error('Error in predictChurn service', { error: error.message, user_id });
      throw new AppError('Churn prediction failed', 500);
    }
  }

  async runAgent(userData) {
    const { user_id, usage, complaints, payment_delay } = userData;

    try {
      const response = await axios.post(`${config.services.agent}/agent`, {
        user_id,
        usage_score: usage,
        complaints_count: complaints,
        payment_delay_count: payment_delay
      });

      const result = response.data;

      await this.repository.createAgentMemory({
        user_id,
        action: result.best_action,
        result: 'executed',
        churn_risk: result.churn_risk,
        expected_churn: result.expected_churn,
        reason: result.reason
      });

      await this.cache.del('kpis');
      await this.cache.del(`memory:${user_id}`);
      await this.cache.invalidatePattern('audit-logs:*');

      return result;
    } catch (error) {
      logger.error('Error in runAgent service', { error: error.message, user_id });
      throw new AppError('Agent execution failed', 500);
    }
  }

  async simulate(simulationData) {
    try {
      const response = await axios.post(`${config.services.simulation}/simulate`, simulationData);
      return response.data;
    } catch (error) {
      logger.error('Simulation service error', { error: error.message });
      throw new AppError('Simulation failed', 500);
    }
  }

  async getMemory(userId) {
    const cacheKey = `memory:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const rows = await this.repository.getMemoryByUserId(userId);
    const response = { user_id: userId, memory: rows, count: rows.length };

    await this.cache.set(cacheKey, response, 300);
    return response;
  }

  async getAuditLogs(limit = 50) {
    const cacheKey = `audit-logs:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const rows = await this.repository.getAuditLogs(limit);
    const response = { logs: rows, count: rows.length };

    await this.cache.set(cacheKey, response, 30);
    return response;
  }

  async claimEscalation(claimData) {
    const { user_id, specialist_id, specialist_name, churn_risk } = claimData;
    
    await this.repository.upsertUser(user_id);
    
    const action = await this.repository.createRetentionAction(
      user_id, 
      `CLAIMED_BY:${specialist_id}`, 
      'claimed'
    );

    await this.repository.createAgentMemory({
      user_id,
      action: 'HUMAN_INTERVENTION',
      result: 'claimed',
      churn_risk,
      expected_churn: churn_risk * 0.5,
      reason: `Claimed by ${specialist_name}`
    });

    return {
      status: 'success',
      claimed_at: action.executed_at,
      action_id: action.id
    };
  }

  async getClaimedEscalations(specialist_id) {
    const rows = await this.repository.getClaimedEscalations(specialist_id);
    return { claimed: rows, count: rows.length };
  }

  async getKpis() {
    const cacheKey = 'kpis';
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const today = new Date().toISOString().split('T')[0];
    const data = await this.repository.getKpiData(today);

    const result = {
      interventions_today: parseInt(data.interventionsToday) || 0,
      total_processed: parseInt(data.totalProcessed) || 0,
      churn_prevented: (parseFloat(data.avgImprovement || 0) * 100).toFixed(1) + '%',
      active_users: parseInt(data.activeUsersCount) || 0,
      distribution: data.distributionData.map(r => ({ name: r.action, value: parseInt(r.count) }))
    };

    await this.cache.set(cacheKey, result, 60);
    return result;
  }
}

module.exports = RetentionService;
