const express = require('express');
const router = express.Router();

const { validate, retentionSchemas } = require('../middleware/validator');

module.exports = (controller) => {
  router.post('/predict', controller.predict);
  router.post('/agent', controller.runAgent);
  router.post('/simulate', validate(retentionSchemas.simulate), controller.simulate);
  router.get('/memory/:userId', controller.getMemory);
  router.get('/audit-logs', controller.getAuditLogs);
  router.get('/kpis', controller.getKpis);
  
  // Escalations
  router.post('/escalations/claim', validate(retentionSchemas.claimEscalation), controller.claimEscalation);
  router.get('/escalations/claimed', controller.getClaimedEscalations);
  
  return router;
};
