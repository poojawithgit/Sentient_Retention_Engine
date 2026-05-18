const { logger } = require('../utils/logger');

class SimulationService {
  constructor(broadcast, repository) {
    this.broadcast = broadcast;
    this.repository = repository;
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Starting Ambient Activity Simulator');
    
    // Simulate events every 5-15 seconds
    const scheduleNext = () => {
      const delay = Math.random() * 10000 + 5000;
      this.intervalId = setTimeout(() => {
        this.generateEvent();
        if (this.isRunning) scheduleNext();
      }, delay);
    };
    
    scheduleNext();
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) clearTimeout(this.intervalId);
  }

  async generateEvent() {
    const eventTypes = ['CHURN_PREDICTION', 'AGENT_DECISION', 'SIMULATION_EVENT', 'SPECIALIST_ESCALATION'];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const userId = `user_${Math.floor(Math.random() * 9000) + 1000}`;
    
    let payload = { user_id: userId };

    if (type === 'CHURN_PREDICTION') {
      const risk = Math.random();
      const riskLevel = risk > 0.7 ? 'HIGH' : risk > 0.4 ? 'MEDIUM' : 'LOW';
      payload = {
        ...payload,
        churn_risk: parseFloat(risk.toFixed(4)),
        risk_level: riskLevel,
        confidence: 0.85 + Math.random() * 0.1
      };

      // Persist prediction
      try {
        if (this.repository) {
          await this.repository.upsertUser(userId);
          await this.repository.createChurnPrediction({
            user_id: userId,
            usage_score: Math.floor(Math.random() * 100),
            complaints_count: Math.floor(Math.random() * 5),
            payment_delay_count: Math.floor(Math.random() * 3),
            churn_risk: payload.churn_risk,
            risk_level: payload.risk_level
          });
        }
      } catch (err) {
        logger.error('Failed to persist simulation prediction', { error: err.message });
      }
    } else if (type === 'AGENT_DECISION') {
      const actions = ['DISCOUNT_25', 'UPGRADE_PLAN', 'SUPPORT_CALL', 'FEATURE_TUTORIAL'];
      payload = {
        ...payload,
        action: actions[Math.floor(Math.random() * actions.length)],
        reason: 'Automated retention strategy triggered by risk score.',
        expected_improvement: (Math.random() * 30 + 10).toFixed(1) + '%'
      };
    } else if (type === 'SIMULATION_EVENT') {
      payload = {
        ...payload,
        status: 'SUCCESS',
        iterations: 100,
        best_path: 'Aggressive Discount'
      };
    } else if (type === 'SPECIALIST_ESCALATION') {
      const reasons = ['COMPLEX_BILLING_ISSUE', 'COMPETITOR_SWITCH_THREAT', 'HIGH_VALUE_ACCOUNT_AT_RISK', 'PREMIUM_SUPPORT_REQUIRED'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      const risk = 0.8 + Math.random() * 0.15;
      
      payload = {
        ...payload,
        reason,
        churn_risk: risk,
        priority: 'CRITICAL',
        assigned_to: null
      };

      // Persist escalation
      try {
        if (this.repository) {
          await this.repository.upsertUser(userId);
          
          await this.repository.createAgentMemory({
            user_id: userId,
            action: 'ESCALATION',
            result: 'pending',
            churn_risk: risk,
            expected_churn: risk * 0.9,
            reason: reason
          });

          await this.repository.createRetentionAction(userId, 'ESCALATION', 'pending');
          logger.info('Persisted simulation escalation', { userId });
        }
      } catch (err) {
        logger.error('Failed to persist simulation escalation', { error: err.message });
      }
    }

    this.broadcast({
      type,
      payload,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = SimulationService;
