const test = require('node:test');
const assert = require('assert');

// Mock logger to prevent cluttering test output
const { logger } = require('../utils/logger');
logger.info = () => {};
logger.error = () => {};
logger.warn = () => {};

// Define mock axios behavior
const mockAxios = {
  postCalls: [],
  post: async (url, data) => {
    mockAxios.postCalls.push({ url, data });
    
    // Prediction service mock
    if (url.includes('/predict')) {
      return {
        data: mockAxios.predictionResponse || { churn_risk: 0.85, risk_level: 'High' }
      };
    }
    
    // Agentic AI pipeline trigger mock
    if (url.includes('/run-pipeline')) {
      if (mockAxios.pipelineShouldFail) {
        throw new Error('Axios connection refused');
      }
      return {
        data: mockAxios.pipelineResponse || {
          risk_score: 0.85,
          risk_level: 'High',
          decision_reasoning: 'Risk of churn is high. Offsite strategy selected.',
          escalated_to_human: false,
          selected_strategy: 'Offsite discount',
          final_action: 'Send 20% discount code'
        }
      };
    }
    
    return { data: {} };
  }
};

// Insert mock axios into Node's require cache before loading the RetentionService
require.cache[require.resolve('axios')] = {
  id: require.resolve('axios'),
  filename: require.resolve('axios'),
  loaded: true,
  exports: mockAxios
};

// Load the service and app config
const RetentionService = require('../services/retentionService');

test.describe('RetentionService - predictChurn Automated Pipeline Execution', () => {
  let cacheMock;
  let repoMock;
  let broadcastCalls;

  test.beforeEach(() => {
    mockAxios.postCalls = [];
    mockAxios.predictionResponse = null;
    mockAxios.pipelineResponse = null;
    mockAxios.pipelineShouldFail = false;
    broadcastCalls = [];

    cacheMock = {
      del: async () => {},
      invalidatePattern: async () => {}
    };

    repoMock = {
      createChurnPrediction: async () => ({}),
      getActiveRetentionAction: async () => null,
      createRetentionAction: async () => ({ id: 456, executed_at: new Date() }),
      createAgentMemory: async () => ({})
    };
  });

  test('should trigger the automated pipeline in the background when risk level is High/Critical', async () => {
    mockAxios.predictionResponse = { churn_risk: 0.85, risk_level: 'High' };
    
    const service = new RetentionService(cacheMock, repoMock);
    
    // Arrange promise to resolve inside the broadcast callback
    let pipelineTriggeredPromise = new Promise((resolve) => {
      service.broadcast = (msg) => {
        broadcastCalls.push(msg);
        resolve();
      };
    });

    const userData = {
      user_id: 'user_123',
      usage: 12.5,
      complaints: 2,
      payment_delay: 1,
      plan_tier: 'Gold',
      network_drops: 1,
      payment_status: 'Paid'
    };

    // Act
    const result = await service.predictChurn(userData);

    // Assert fast prediction response first
    assert.strictEqual(result.user_id, 'user_123');
    assert.strictEqual(result.churn_risk, 0.85);
    assert.strictEqual(result.risk_level, 'High');

    // Wait for the background IIFE to fully execute the pipeline post and broadcast the result
    await pipelineTriggeredPromise;

    // Verify both Axios calls were made (/predict and /run-pipeline)
    assert.strictEqual(mockAxios.postCalls.length, 2);
    assert.strictEqual(mockAxios.postCalls[0].url.endsWith('/predict'), true);
    assert.strictEqual(mockAxios.postCalls[1].url.endsWith('/run-pipeline'), true);

    // Check payload passed to agentic-ai
    const pipelinePayload = mockAxios.postCalls[1].data;
    assert.strictEqual(pipelinePayload.userId, 'user_123');
    assert.strictEqual(pipelinePayload.plan_tier, 'Gold');
    assert.strictEqual(pipelinePayload.usage_score, 12.5);
    assert.strictEqual(pipelinePayload.complaints_count, 2);
    assert.strictEqual(pipelinePayload.network_drops, 1);
    assert.strictEqual(pipelinePayload.payment_status, 'Paid');

    // Verify WebSocket notification was broadcasted
    assert.strictEqual(broadcastCalls.length, 1);
    assert.strictEqual(broadcastCalls[0].type, 'AGENT_DECISION');
    assert.strictEqual(broadcastCalls[0].payload.user_id, 'user_123');
    assert.strictEqual(broadcastCalls[0].payload.selected_strategy, 'Offsite discount');
  });

  test('should skip automatic trigger when an active retention action already exists (deduplication check)', async () => {
    // Arrange
    let deduplicationCheckedPromise = new Promise((resolve) => {
      repoMock.getActiveRetentionAction = async (userId) => {
        resolve(); // Let the test know we reached this check
        return { id: 789, status: 'pending' };
      };
    });

    mockAxios.predictionResponse = { churn_risk: 0.95, risk_level: 'Critical' };
    
    const service = new RetentionService(cacheMock, repoMock);
    service.broadcast = (msg) => broadcastCalls.push(msg);

    const userData = {
      user_id: 'user_456',
      usage: 10.0,
      complaints: 5,
      payment_delay: 3
    };

    // Act
    const result = await service.predictChurn(userData);

    // Assert fast response
    assert.strictEqual(result.risk_level, 'Critical');

    // Wait for the background IIFE to check the active status
    await deduplicationCheckedPromise;

    // Wait a brief tick to ensure background execution would have completed early
    await new Promise(r => setTimeout(r, 10));

    // Verify the pipeline was NOT triggered
    const runPipelineCalls = mockAxios.postCalls.filter(c => c.url.includes('/run-pipeline'));
    assert.strictEqual(runPipelineCalls.length, 0);
    assert.strictEqual(broadcastCalls.length, 0);
  });

  test('should handle axios failure on LangGraph route gracefully (Option A degradation fallback)', async () => {
    mockAxios.predictionResponse = { churn_risk: 0.90, risk_level: 'High' };
    mockAxios.pipelineShouldFail = true; // Force /run-pipeline call to fail
    
    let createdRetentionAction = null;
    repoMock.createRetentionAction = async (userId, actionType, status) => {
      createdRetentionAction = { userId, actionType, status };
      return { id: 999, executed_at: new Date() };
    };

    const service = new RetentionService(cacheMock, repoMock);
    
    // Arrange promise to resolve inside the broadcast callback for trigger failure
    let fallbackCompletedPromise = new Promise((resolve) => {
      service.broadcast = (msg) => {
        broadcastCalls.push(msg);
        resolve();
      };
    });

    const userData = {
      user_id: 'user_789',
      usage: 8.0,
      complaints: 3,
      payment_delay: 2
    };

    // Act
    const result = await service.predictChurn(userData);

    // Assert fast response
    assert.strictEqual(result.risk_level, 'High');

    // Wait for the background IIFE to fail, complete database/memory logging, and broadcast
    await fallbackCompletedPromise;

    // Assert fallback records were created in repository
    assert.ok(createdRetentionAction);
    assert.strictEqual(createdRetentionAction.userId, 'user_789');
    assert.strictEqual(createdRetentionAction.actionType, 'FAILED_AUTO_TRIGGER');
    assert.strictEqual(createdRetentionAction.status, 'pending');

    // Assert WebSocket broadcast notifying about fallback is sent
    assert.strictEqual(broadcastCalls.length, 1);
    assert.strictEqual(broadcastCalls[0].type, 'PIPELINE_TRIGGER_FAILED');
    assert.strictEqual(broadcastCalls[0].payload.user_id, 'user_789');
    assert.strictEqual(broadcastCalls[0].payload.action_id, 999);
  });
});
