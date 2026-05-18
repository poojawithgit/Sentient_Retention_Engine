const SimulationService = require('../services/simulationService');

const initSimulation = (broadcast, retentionRepository) => {
  const simulationService = new SimulationService(broadcast, retentionRepository);
  simulationService.start();
  return simulationService;
};

module.exports = initSimulation;
