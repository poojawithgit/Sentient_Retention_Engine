const { logger } = require('./logger');

class LiveSimulator {
  constructor(broadcast, repository) {
    this.broadcast = broadcast;
    this.repository = repository;
    this.users = ['user_882', 'user_419', 'user_102', 'user_667', 'user_334', 'user_991'];
    this.actions = ['Discount_20', 'Personalized_Email', 'Call_Schedule', 'Plan_Upgrade_Offer'];
    this.reasons = ['Usage_Drop', 'Multiple_Complaints', 'Competitor_Search', 'Payment_Failure'];
    this.interval = null;
  }

  start() {
    logger.info('Starting Live Simulation for Dashboard...');
    
    // Generate an event every 5-15 seconds
    const scheduleNext = () => {
      const delay = Math.random() * 10000 + 5000;
      this.interval = setTimeout(async () => {
        await this.generateEvent();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  stop() {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
  }

  async generateEvent() {
    const userId = this.users[Math.floor(Math.random() * this.users.length)];
    const roll = Math.random();

    try {
      if (roll < 0.6) {
        // Generate Prediction
        const risk = 0.3 + Math.random() * 0.6;
        const riskLevel = risk > 0.7 ? 'HIGH' : risk > 0.4 ? 'MEDIUM' : 'LOW';
        
        const prediction = {
          user_id: userId,
          churn_risk: risk,
          risk_level: riskLevel,
          confidence: 0.8 + Math.random() * 0.15,
          timestamp: new Date().toISOString()
        };

        this.broadcast({ type: 'CHURN_PREDICTION', payload: prediction });

        if (riskLevel === 'HIGH' && Math.random() > 0.5) {
          // Trigger Escalation
          const reason = this.reasons[Math.floor(Math.random() * this.reasons.length)];
          const escalation = {
            user_id: userId,
            churn_risk: risk,
            reason: reason,
            priority: 'HIGH',
            timestamp: new Date().toISOString()
          };
          
          this.broadcast({ type: 'SPECIALIST_ESCALATION', payload: escalation });
          
          // Also persist in retention_actions as pending
          await this.repository.createRetentionAction(userId, 'ESCALATION_TRIGGERED', 'pending');
        }
      } else {
        // Generate Agent Decision
        const action = this.actions[Math.floor(Math.random() * this.actions.length)];
        const decision = {
          user_id: userId,
          action: action,
          reason: 'Autonomous retention heuristic triggered',
          churn_risk: Math.random() * 0.4,
          timestamp: new Date().toISOString()
        };

        this.broadcast({ type: 'AGENT_DECISION', payload: decision });
        
        // Persist in agent memory
        await this.repository.createAgentMemory({
          user_id: userId,
          action: action,
          result: 'executed',
          churn_risk: decision.churn_risk,
          expected_churn: decision.churn_risk * 0.7,
          reason: decision.reason
        });
      }
    } catch (error) {
      logger.error('Error in LiveSimulator generation', { error: error.message });
    }
  }
}

module.exports = LiveSimulator;
