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
    this.getPendingEscalations = catchAsync(this.getPendingEscalations.bind(this));
    this.updateSettings = catchAsync(this.updateSettings.bind(this));
    this.addSpecialist = catchAsync(this.addSpecialist.bind(this));
    this.getSpecialists = catchAsync(this.getSpecialists.bind(this));
    this.executeAction = catchAsync(this.executeAction.bind(this));
    this.addCaseNote = catchAsync(this.addCaseNote.bind(this));
    this.getSystemHealth = catchAsync(this.getSystemHealth.bind(this));
    this.getApprovalRequests = catchAsync(this.getApprovalRequests.bind(this));
    this.updateApprovalStatus = catchAsync(this.updateApprovalStatus.bind(this));
    this.getGovernanceLogs = catchAsync(this.getGovernanceLogs.bind(this));
    this.getGovernancePolicies = catchAsync(this.getGovernancePolicies.bind(this));
    this.getAgentTrustLevels = catchAsync(this.getAgentTrustLevels.bind(this));
    this.updateAgentTrustLevel = catchAsync(this.updateAgentTrustLevel.bind(this));
    this.updateAgentStatus = catchAsync(this.updateAgentStatus.bind(this));
    this.getAgentScopes = catchAsync(this.getAgentScopes.bind(this));
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
    const specialistId = req.user.username;
    const result = await this.retentionService.claimEscalation({
      ...req.body,
      specialist_id: specialistId
    });
    this.broadcast({ type: 'ESCALATION_CLAIMED', payload: { ...req.body, specialist_id: specialistId, ...result } });
    res.json(result);
  }

  async getClaimedEscalations(req, res) {
    const specialistId = req.user.username;
    const result = await this.retentionService.getClaimedEscalations(specialistId);
    res.json(result);
  }

  async getPendingEscalations(req, res) {
    const result = await this.retentionService.getPendingEscalations();
    res.json(result);
  }

  async getKpis(req, res) {
    const kpis = await this.retentionService.getKpis();
    res.json(kpis);
  }

  async updateSettings(req, res) {
    const adminId = req.user.username;
    const result = await this.retentionService.updateAdminSettings(req.body, adminId);
    res.json(result);
  }

  async addSpecialist(req, res) {
    const adminId = req.user.username;
    const result = await this.retentionService.addSpecialist(req.body, adminId);
    res.json(result);
  }

  async getSpecialists(req, res) {
    const result = await this.retentionService.getSpecialists();
    res.json(result);
  }

  async executeAction(req, res) {
    const specialistId = req.user.username;
    const result = await this.retentionService.executeAction({
      ...req.body,
      specialist_id: specialistId
    });
    this.broadcast({ 
      type: 'SPECIALIST_ACTION_EXECUTED', 
      payload: { ...result, escalation_id: req.body.escalation_id } 
    });
    res.json(result);
  }

  async addCaseNote(req, res) {
    const specialistId = req.user.username;
    const result = await this.retentionService.addCaseNote({
      ...req.body,
      specialist_id: specialistId
    });
    res.json(result);
  }

  async getSystemHealth(req, res) {
    const result = await this.retentionService.getSystemHealth();
    res.json(result);
  }

  async getApprovalRequests(req, res) {
    const result = await this.retentionService.getApprovalRequests();
    res.json(result);
  }

  async updateApprovalStatus(req, res) {
    const reviewerId = req.user.username;
    const { requestId, status, notes } = req.body;
    const result = await this.retentionService.updateApprovalStatus(requestId, status, reviewerId, notes);
    
    this.broadcast({
      type: 'GOVERNANCE_UPDATE',
      payload: { requestId, status, reviewerId }
    });
    
    res.json(result);
  }

  async getGovernanceLogs(req, res) {
    const limit = parseInt(req.query.limit) || 100;
    const result = await this.retentionService.getGovernanceLogs(limit);
    res.json(result);
  }

  async getGovernancePolicies(req, res) {
    const result = await this.retentionService.getGovernancePolicies();
    res.json(result);
  }

  async getAgentTrustLevels(req, res) {
    const result = await this.retentionService.getAgentTrustLevels();
    res.json(result);
  }

  async updateAgentTrustLevel(req, res) {
    const { agentId, trustLevel } = req.body;
    const result = await this.retentionService.updateAgentTrustLevel(agentId, trustLevel);
    
    this.broadcast({
      type: 'GOVERNANCE_TRUST_UPDATE',
      payload: { agentId, trustLevel }
    });
    
    res.json(result);
  }

  async updateAgentStatus(req, res) {
    const { agentId, isActive } = req.body;
    const result = await this.retentionService.updateAgentStatus(agentId, isActive);
    
    this.broadcast({
      type: 'GOVERNANCE_AGENT_STATUS_UPDATE',
      payload: { agentId, isActive }
    });
    
    res.json(result);
  }

  async getAgentScopes(req, res) {
    const result = await this.retentionService.getAgentScopes();
    res.json(result);
  }
}

module.exports = RetentionController;
