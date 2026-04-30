const { logger } = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../utils/errors');

class RetentionController {
  constructor(retentionService, broadcast) {
    this.retentionService = retentionService;
    this.broadcast = broadcast;
    
    // Bind methods with catchAsync for centralized error handling
    this.predict = catchAsync(this.predict.bind(this));
    this.runAgent = catchAsync(this.runAgent.bind(this));
    this.simulate = catchAsync(this.simulate.bind(this));
    this.getMemory = catchAsync(this.getMemory.bind(this));
    this.getAuditLogs = catchAsync(this.getAuditLogs.bind(this));
    this.getKpis = catchAsync(this.getKpis.bind(this));
    this.claimEscalation = catchAsync(this.claimEscalation.bind(this));
    this.getClaimedEscalations = catchAsync(this.getClaimedEscalations.bind(this));
  }

  async predict(req, res) {
    const startTime = Date.now();
    const { user_id } = req.body;
    
    const prediction = await this.retentionService.predictChurn(req.body);
    
    this.broadcast({
      type: 'CHURN_PREDICTION',
      payload: prediction
    });

    logger.info('Prediction completed successfully', {
      user_id,
      duration: Date.now() - startTime
    });

    res.json(prediction);
  }

  async runAgent(req, res) {
    const { user_id } = req.body;
    const result = await this.retentionService.runAgent(req.body);
    res.json(result);
  }

  async simulate(req, res) {
    const { user_id } = req.body;
    const result = await this.retentionService.simulate(req.body);
    this.broadcast({ type: 'SIMULATION_EVENT', payload: result });
    res.json(result);
  }

  async getMemory(req, res) {
    const { userId } = req.params;
    const memory = await this.retentionService.getMemory(userId);
    res.json(memory);
  }

  async getAuditLogs(req, res) {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await this.retentionService.getAuditLogs(limit);
    res.json(logs);
  }

  async claimEscalation(req, res) {
    const result = await this.retentionService.claimEscalation(req.body);
    this.broadcast({ type: 'ESCALATION_CLAIMED', payload: { ...req.body, ...result } });
    res.json(result);
  }

  async getClaimedEscalations(req, res) {
    const { specialist_id } = req.query;
    const result = await this.retentionService.getClaimedEscalations(specialist_id);
    res.json(result);
  }

  async getKpis(req, res) {
    const kpis = await this.retentionService.getKpis();
    res.json(kpis);
  }
}

module.exports = RetentionController;
