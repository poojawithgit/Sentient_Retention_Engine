const initRedis = require('./redis');
const initSimulation = require('./simulation');
const RetentionRepository = require('../repositories/retentionRepository');
const RetentionService = require('../services/retentionService');
const RetentionController = require('../controllers/retentionController');
const CacheManager = require('../utils/cache');

const init = async (app, config) => {
  const cache = new CacheManager(config.redisUrl);
  const { broadcast } = await initRedis(app, config);
  
  const retentionRepository = new RetentionRepository();
  const simulationService = initSimulation(broadcast, retentionRepository);
  
  const retentionService = new RetentionService(cache, retentionRepository);
  retentionService.broadcast = broadcast;
  const retentionController = new RetentionController(retentionService, broadcast);

  return { retentionController, simulationService };
};

module.exports = init;
