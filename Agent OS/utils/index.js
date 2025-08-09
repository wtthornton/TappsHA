/**
 * Agent OS Utilities Index
 * Central export point for all Agent OS development utilities
 */

const { DependencyValidator, CircularDependencyDetector } = require('./dependency-validator.js');
const CrossPlatformShell = require('./cross-platform-shell.js');
const InfrastructureRecovery = require('./infrastructure-recovery.js');
const FeatureScoringFramework = require('./feature-scoring.js');

module.exports = {
  // Dependency management
  DependencyValidator,
  CircularDependencyDetector,
  
  // Shell execution
  CrossPlatformShell,
  
  // Infrastructure monitoring
  InfrastructureRecovery,
  
  // Feature scoring
  FeatureScoringFramework,
  
  // Quick access functions
  validateEnvironment: (options = {}) => {
    const validator = new DependencyValidator();
    return validator.validateEnvironment(options);
  },
  
  executeCommand: (command, options = {}) => {
    const shell = new CrossPlatformShell();
    return shell.executeCommand(command, options);
  },
  
  checkInfrastructure: async (options = {}) => {
    const recovery = new InfrastructureRecovery();
    return await recovery.assessInfrastructureHealth(options);
  },
  
  scoreFeatures: (features) => {
    const framework = new FeatureScoringFramework();
    return framework.scoreFeatures(features);
  }
};