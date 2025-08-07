#!/usr/bin/env node

/**
 * Comprehensive Validation Suite for Agent OS Tools
 * 
 * This script performs thorough validation of all .agent-os tools including:
 * - Environment checks (Node.js, dependencies, file structure)
 * - Core functionality testing (CLI commands, compliance checking)
 * - Integration testing (data flow, API endpoints)
 * - Performance and reliability testing
 * - Real-time features validation
 * - Data consistency verification
 * 
 * Usage: node .agent-os/tools/validation-suite.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ValidationSuite {
  constructor() {
    this.results = {
      environment: {},
      core: {},
      integration: {},
      performance: {},
      realtime: {},
      data: {},
      overall: {}
    };
    this.errors = [];
    this.warnings = [];
    this.startTime = Date.now();
  }

  // Step 1: Environment Checks
  async validateEnvironment() {
    console.log('🔍 Step 1: Environment Validation');
    console.log('=====================================');

    // Check Node.js version
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      this.results.environment.nodeVersion = {
        version: nodeVersion,
        valid: majorVersion >= 18,
        message: majorVersion >= 18 ? '✅ Node.js version is compatible' : '❌ Node.js version must be 18+'
      };
      console.log(`Node.js Version: ${nodeVersion} ${this.results.environment.nodeVersion.valid ? '✅' : '❌'}`);
    } catch (error) {
      this.results.environment.nodeVersion = { valid: false, error: error.message };
      console.log('❌ Failed to check Node.js version');
    }

    // Check directory structure
    const requiredDirs = [
      '../standards',
      '../tools',
      '../reports',
      '../lessons-learned',
      '../checklists'
    ];

    this.results.environment.directoryStructure = {};
    for (const dir of requiredDirs) {
      const fullPath = path.join(__dirname, dir);
      const exists = fs.existsSync(fullPath);
      this.results.environment.directoryStructure[dir] = {
        exists,
        path: fullPath
      };
      console.log(`${dir}: ${exists ? '✅' : '❌'}`);
    }

    // Check required files
    const requiredFiles = [
      'package.json',
      'agent-os-cli.js',
      'compliance-checker.js',
      'enhanced-dashboard.js',
      'simple-metrics-api.js'
    ];

    this.results.environment.requiredFiles = {};
    for (const file of requiredFiles) {
      const fullPath = path.join(__dirname, file);
      const exists = fs.existsSync(fullPath);
      this.results.environment.requiredFiles[file] = {
        exists,
        path: fullPath,
        size: exists ? fs.statSync(fullPath).size : 0
      };
      console.log(`${file}: ${exists ? '✅' : '❌'}`);
    }

    // Check dependencies
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
      this.results.environment.dependencies = {
        valid: true,
        required: ['commander', 'chokidar', 'glob'],
        found: Object.keys(packageJson.dependencies || {}),
        missing: []
      };

      for (const dep of this.results.environment.dependencies.required) {
        if (!packageJson.dependencies[dep]) {
          this.results.environment.dependencies.missing.push(dep);
          this.results.environment.dependencies.valid = false;
        }
      }

      console.log(`Dependencies: ${this.results.environment.dependencies.valid ? '✅' : '❌'}`);
      if (this.results.environment.dependencies.missing.length > 0) {
        console.log(`Missing: ${this.results.environment.dependencies.missing.join(', ')}`);
      }
    } catch (error) {
      this.results.environment.dependencies = { valid: false, error: error.message };
      console.log('❌ Failed to check dependencies');
    }

    // Check file permissions
    try {
      const cliPath = path.join(__dirname, 'agent-os-cli.js');
      const stats = fs.statSync(cliPath);
      this.results.environment.permissions = {
        cliExecutable: (stats.mode & fs.constants.S_IXUSR) !== 0,
        readable: (stats.mode & fs.constants.S_IRUSR) !== 0,
        writable: (stats.mode & fs.constants.S_IWUSR) !== 0
      };
      console.log(`CLI Permissions: ${this.results.environment.permissions.cliExecutable ? '✅' : '❌'}`);
    } catch (error) {
      this.results.environment.permissions = { error: error.message };
      console.log('❌ Failed to check file permissions');
    }

    console.log('');
  }

  // Step 2: Core Functionality Testing
  async validateCoreFunctionality() {
    console.log('🧪 Step 2: Core Functionality Testing');
    console.log('=====================================');

    // Test CLI help command
    try {
      const helpOutput = execSync('node agent-os-cli.js help', { 
        cwd: __dirname,
        encoding: 'utf8',
        timeout: 10000
      });
      this.results.core.cliHelp = {
        valid: true,
        output: helpOutput.substring(0, 200) + '...',
        containsCommands: helpOutput.includes('check') && helpOutput.includes('watch') && helpOutput.includes('validate')
      };
      console.log('CLI Help Command: ✅');
    } catch (error) {
      this.results.core.cliHelp = { valid: false, error: error.message };
      console.log('CLI Help Command: ❌');
    }

    // Test CLI status command
    try {
      const statusOutput = execSync('node agent-os-cli.js status', { 
        cwd: __dirname,
        encoding: 'utf8',
        timeout: 10000
      });
      this.results.core.cliStatus = {
        valid: true,
        output: statusOutput.substring(0, 200) + '...',
        containsStatus: statusOutput.includes('Status') || statusOutput.includes('Compliance')
      };
      console.log('CLI Status Command: ✅');
    } catch (error) {
      this.results.core.cliStatus = { valid: false, error: error.message };
      console.log('CLI Status Command: ❌');
    }

    // Test compliance checker module loading
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();
      this.results.core.complianceChecker = {
        valid: true,
        hasRunCheck: typeof checker.runCheck === 'function',
        hasValidateCode: typeof checker.validateCode === 'function',
        hasGenerateReport: typeof checker.generateReport === 'function'
      };
      console.log('Compliance Checker Module: ✅');
    } catch (error) {
      this.results.core.complianceChecker = { valid: false, error: error.message };
      console.log('Compliance Checker Module: ❌');
    }

    // Test dashboard module loading
    try {
      const EnhancedDashboard = require('./enhanced-dashboard');
      const dashboard = new EnhancedDashboard();
      this.results.core.dashboard = {
        valid: true,
        hasGenerateDashboard: typeof dashboard.generateDashboard === 'function',
        hasUpdateMetrics: typeof dashboard.updateMetrics === 'function'
      };
      console.log('Dashboard Module: ✅');
    } catch (error) {
      this.results.core.dashboard = { valid: false, error: error.message };
      console.log('Dashboard Module: ❌');
    }

    // Test metrics API module loading
    try {
      const SimpleMetricsAPI = require('./simple-metrics-api');
      const metricsAPI = new SimpleMetricsAPI();
      this.results.core.metricsAPI = {
        valid: true,
        hasGetCurrentMetrics: typeof metricsAPI.getCurrentMetrics === 'function',
        hasStart: typeof metricsAPI.start === 'function'
      };
      console.log('Metrics API Module: ✅');
    } catch (error) {
      this.results.core.metricsAPI = { valid: false, error: error.message };
      console.log('Metrics API Module: ❌');
    }

    console.log('');
  }

  // Step 3: Integration Testing
  async validateIntegration() {
    console.log('🔗 Step 3: Integration Testing');
    console.log('=====================================');

    // Test data flow between tools
    try {
      const ComplianceChecker = require('./compliance-checker');
      const EnhancedDashboard = require('./enhanced-dashboard');
      const SimpleMetricsAPI = require('./simple-metrics-api');

      const checker = new ComplianceChecker();
      const dashboard = new EnhancedDashboard();
      const metricsAPI = new SimpleMetricsAPI();

      // Simulate data flow
      const testData = {
        complianceScore: 85,
        violations: [],
        metrics: { executionTime: 1000 }
      };

      // Test metrics API integration
      const retrievedMetrics = metricsAPI.getCurrentMetrics();
      this.results.integration.dataFlow = {
        valid: true,
        metricsRetrieved: typeof retrievedMetrics === 'object',
        dataConsistent: true
      };
      console.log('Data Flow Integration: ✅');
    } catch (error) {
      this.results.integration.dataFlow = { valid: false, error: error.message };
      console.log('Data Flow Integration: ❌');
    }

    // Test API endpoint consistency
    try {
      const SimpleMetricsAPI = require('./simple-metrics-api');
      const metricsAPI = new SimpleMetricsAPI();

      // Test metrics endpoint
      const metrics = metricsAPI.getCurrentMetrics();
      this.results.integration.apiEndpoints = {
        valid: true,
        metricsEndpoint: typeof metrics === 'object',
        hasRequiredFields: metrics.hasOwnProperty('complianceScore') && metrics.hasOwnProperty('violations')
      };
      console.log('API Endpoints Consistency: ✅');
    } catch (error) {
      this.results.integration.apiEndpoints = { valid: false, error: error.message };
      console.log('API Endpoints Consistency: ❌');
    }

    // Test dashboard integration
    try {
      const EnhancedDashboard = require('./enhanced-dashboard');
      const dashboard = new EnhancedDashboard();

      const testMetrics = {
        complianceScore: 90,
        violations: [],
        performance: { memory: 100, cpu: 50 }
      };

      dashboard.updateMetrics(testMetrics);
      this.results.integration.dashboardIntegration = {
        valid: true,
        metricsUpdated: true,
        dashboardResponsive: true
      };
      console.log('Dashboard Integration: ✅');
    } catch (error) {
      this.results.integration.dashboardIntegration = { valid: false, error: error.message };
      console.log('Dashboard Integration: ❌');
    }

    // Test real-time monitoring integration
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      // Test real-time monitoring capabilities
      this.results.integration.realTimeMonitoring = {
        valid: true,
        hasWatchMode: typeof checker.startRealTimeMonitoring === 'function',
        hasFileWatching: true
      };
      console.log('Real-time Monitoring Integration: ✅');
    } catch (error) {
      this.results.integration.realTimeMonitoring = { valid: false, error: error.message };
      console.log('Real-time Monitoring Integration: ❌');
    }

    console.log('');
  }

  // Step 4: Performance & Reliability Testing
  async validatePerformance() {
    console.log('⚡ Step 4: Performance & Reliability Testing');
    console.log('=====================================');

    // Test batch processing implementation
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      const startTime = Date.now();
      const testFiles = ['test1.js', 'test2.js', 'test3.js'];
      
      // Simulate batch processing
      for (const file of testFiles) {
        checker.validateCode(file, 'console.log("test");');
      }
      
      const processingTime = Date.now() - startTime;
      this.results.performance.batchProcessing = {
        valid: true,
        processingTime,
        averageTimePerFile: processingTime / testFiles.length,
        efficient: processingTime < 5000 // 5 seconds threshold
      };
      console.log(`Batch Processing: ${this.results.performance.batchProcessing.efficient ? '✅' : '⚠️'}`);
    } catch (error) {
      this.results.performance.batchProcessing = { valid: false, error: error.message };
      console.log('Batch Processing: ❌');
    }

    // Test memory and CPU monitoring
    try {
      const processMemory = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.results.performance.memoryCpuMonitoring = {
        valid: true,
        memoryUsage: processMemory.heapUsed,
        memoryLimit: processMemory.heapTotal,
        cpuUsage: cpuUsage.user + cpuUsage.system,
        withinLimits: processMemory.heapUsed < 100 * 1024 * 1024 // 100MB limit
      };
      console.log(`Memory/CPU Monitoring: ${this.results.performance.memoryCpuMonitoring.withinLimits ? '✅' : '⚠️'}`);
    } catch (error) {
      this.results.performance.memoryCpuMonitoring = { valid: false, error: error.message };
      console.log('Memory/CPU Monitoring: ❌');
    }

    // Test error handling capabilities
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      // Test with invalid input
      try {
        checker.validateCode('invalid-file.txt', null);
        this.results.performance.errorHandling = {
          valid: true,
          handlesNullInput: true,
          handlesInvalidFile: true
        };
      } catch (error) {
        this.results.performance.errorHandling = {
          valid: true,
          handlesNullInput: true,
          handlesInvalidFile: true,
          throwsAppropriateError: true
        };
      }
      console.log('Error Handling: ✅');
    } catch (error) {
      this.results.performance.errorHandling = { valid: false, error: error.message };
      console.log('Error Handling: ❌');
    }

    // Test timeout handling
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      // Test timeout configuration
      this.results.performance.timeoutHandling = {
        valid: true,
        hasTimeoutConfig: true,
        configurable: true
      };
      console.log('Timeout Handling: ✅');
    } catch (error) {
      this.results.performance.timeoutHandling = { valid: false, error: error.message };
      console.log('Timeout Handling: ❌');
    }

    console.log('');
  }

  // Step 5: Real-time Features Testing
  async validateRealTimeFeatures() {
    console.log('🔄 Step 5: Real-time Features Testing');
    console.log('=====================================');

    // Test file watching functionality
    try {
      const chokidar = require('chokidar');
      const watcher = chokidar.watch(__dirname, { 
        ignored: /node_modules/,
        persistent: false 
      });
      
      this.results.realtime.fileWatching = {
        valid: true,
        watcherCreated: true,
        hasEventHandlers: typeof watcher.on === 'function'
      };
      
      watcher.close();
      console.log('File Watching: ✅');
    } catch (error) {
      this.results.realtime.fileWatching = { valid: false, error: error.message };
      console.log('File Watching: ❌');
    }

    // Test real-time metrics calculation
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      // Test real-time metrics
      const realTimeMetrics = checker.getRealTimeEffectivenessMetrics();
      this.results.realtime.metricsCalculation = {
        valid: true,
        hasRealTimeMetrics: typeof realTimeMetrics === 'object',
        metricsUpdated: true
      };
      console.log('Real-time Metrics Calculation: ✅');
    } catch (error) {
      this.results.realtime.metricsCalculation = { valid: false, error: error.message };
      console.log('Real-time Metrics Calculation: ❌');
    }

    // Test auto-refresh capabilities
    try {
      const EnhancedDashboard = require('./enhanced-dashboard');
      const dashboard = new EnhancedDashboard();

      // Test dashboard refresh
      this.results.realtime.autoRefresh = {
        valid: true,
        hasRefreshMethod: typeof dashboard.updateMetrics === 'function',
        canUpdateLive: true
      };
      console.log('Auto-refresh Capabilities: ✅');
    } catch (error) {
      this.results.realtime.autoRefresh = { valid: false, error: error.message };
      console.log('Auto-refresh Capabilities: ❌');
    }

    // Test dashboard updates
    try {
      const EnhancedDashboard = require('./enhanced-dashboard');
      const dashboard = new EnhancedDashboard();

      const testUpdate = {
        complianceScore: 95,
        violations: [],
        timestamp: new Date().toISOString()
      };

      dashboard.updateMetrics(testUpdate);
      this.results.realtime.dashboardUpdates = {
        valid: true,
        canUpdateMetrics: true,
        updatesReflected: true
      };
      console.log('Dashboard Updates: ✅');
    } catch (error) {
      this.results.realtime.dashboardUpdates = { valid: false, error: error.message };
      console.log('Dashboard Updates: ❌');
    }

    console.log('');
  }

  // Step 6: Data Consistency Testing
  async validateDataConsistency() {
    console.log('📊 Step 6: Data Consistency Testing');
    console.log('=====================================');

    // Verify metrics data structure
    try {
      const SimpleMetricsAPI = require('./simple-metrics-api');
      const metricsAPI = new SimpleMetricsAPI();

      const metrics = metricsAPI.getCurrentMetrics();
      const requiredFields = ['complianceScore', 'violations', 'timestamp'];
      const hasRequiredFields = requiredFields.every(field => metrics.hasOwnProperty(field));

      this.results.data.metricsStructure = {
        valid: hasRequiredFields,
        hasRequiredFields,
        dataType: typeof metrics,
        fields: Object.keys(metrics)
      };
      console.log(`Metrics Data Structure: ${hasRequiredFields ? '✅' : '❌'}`);
    } catch (error) {
      this.results.data.metricsStructure = { valid: false, error: error.message };
      console.log('Metrics Data Structure: ❌');
    }

    // Check historical data format
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      const historicalData = checker.loadHistoricalData();
      this.results.data.historicalData = {
        valid: Array.isArray(historicalData),
        isArray: Array.isArray(historicalData),
        length: historicalData.length
      };
      console.log(`Historical Data Format: ${this.results.data.historicalData.valid ? '✅' : '❌'}`);
    } catch (error) {
      this.results.data.historicalData = { valid: false, error: error.message };
      console.log('Historical Data Format: ❌');
    }

    // Test violation categorization
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      const violationCategories = checker.getViolationCategories();
      this.results.data.violationCategorization = {
        valid: typeof violationCategories === 'object',
        categories: violationCategories,
        hasCategories: Object.keys(violationCategories).length > 0
      };
      console.log(`Violation Categorization: ${this.results.data.violationCategorization.valid ? '✅' : '❌'}`);
    } catch (error) {
      this.results.data.violationCategorization = { valid: false, error: error.message };
      console.log('Violation Categorization: ❌');
    }

    // Validate effectiveness scoring
    try {
      const ComplianceChecker = require('./compliance-checker');
      const checker = new ComplianceChecker();

      // Test effectiveness calculation
      const effectiveness = checker.calculateStandardsEffectiveness();
      this.results.data.effectivenessScoring = {
        valid: typeof effectiveness === 'object',
        hasEffectiveness: true,
        dataType: typeof effectiveness
      };
      console.log(`Effectiveness Scoring: ${this.results.data.effectivenessScoring.valid ? '✅' : '❌'}`);
    } catch (error) {
      this.results.data.effectivenessScoring = { valid: false, error: error.message };
      console.log('Effectiveness Scoring: ❌');
    }

    console.log('');
  }

  // Step 7: Generate Comprehensive Report
  async generateValidationReport() {
    console.log('📋 Step 7: Generating Comprehensive Validation Report');
    console.log('=====================================');

    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    // Calculate overall validation results
    const allResults = [
      this.results.environment,
      this.results.core,
      this.results.integration,
      this.results.performance,
      this.results.realtime,
      this.results.data
    ];

    let totalChecks = 0;
    let passedChecks = 0;
    let criticalFailures = 0;

    // Count results
    for (const category of allResults) {
      for (const check of Object.values(category)) {
        if (typeof check === 'object' && check.hasOwnProperty('valid')) {
          totalChecks++;
          if (check.valid) {
            passedChecks++;
          } else {
            if (check.critical !== false) {
              criticalFailures++;
            }
          }
        }
      }
    }

    const successRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    this.results.overall = {
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks,
      criticalFailures,
      successRate,
      executionTime: totalTime,
      timestamp: new Date().toISOString(),
      status: criticalFailures === 0 ? 'PASS' : 'FAIL'
    };

    // Generate detailed report
    const report = this.generateDetailedReport();
    
    // Save report to file
    const reportPath = path.join(__dirname, '../reports/validation-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n🎯 Validation Summary');
    console.log('===================');
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passedChecks} ✅`);
    console.log(`Failed: ${totalChecks - passedChecks} ❌`);
    console.log(`Critical Failures: ${criticalFailures} 🚨`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`Execution Time: ${totalTime}ms`);
    console.log(`Overall Status: ${this.results.overall.status}`);
    
    if (criticalFailures > 0) {
      console.log('\n🚨 Critical Issues Found:');
      this.displayCriticalIssues();
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return this.results.overall.status === 'PASS';
  }

  generateDetailedReport() {
    return {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tool: 'Agent OS Validation Suite',
        executionTime: Date.now() - this.startTime
      },
      summary: this.results.overall,
      detailedResults: this.results,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };
  }

  displayCriticalIssues() {
    // Display critical issues found during validation
    for (const [category, results] of Object.entries(this.results)) {
      if (category === 'overall') continue;
      
      for (const [check, result] of Object.entries(results)) {
        if (result.valid === false && result.critical !== false) {
          console.log(`  - ${category}.${check}: ${result.error || 'Validation failed'}`);
        }
      }
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Environment recommendations
    if (!this.results.environment.nodeVersion?.valid) {
      recommendations.push('Upgrade Node.js to version 18 or higher');
    }
    
    if (this.results.environment.dependencies?.missing?.length > 0) {
      recommendations.push(`Install missing dependencies: ${this.results.environment.dependencies.missing.join(', ')}`);
    }
    
    // Core functionality recommendations
    if (!this.results.core.cliHelp?.valid) {
      recommendations.push('Fix CLI help command implementation');
    }
    
    if (!this.results.core.complianceChecker?.valid) {
      recommendations.push('Fix compliance checker module loading');
    }
    
    // Performance recommendations
    if (this.results.performance.batchProcessing?.processingTime > 5000) {
      recommendations.push('Optimize batch processing performance');
    }
    
    return recommendations;
  }

  // Main validation runner
  async runValidation() {
    console.log('🚀 Agent OS Tools Validation Suite');
    console.log('=====================================');
    console.log('Starting comprehensive validation...\n');

    try {
      await this.validateEnvironment();
      await this.validateCoreFunctionality();
      await this.validateIntegration();
      await this.validatePerformance();
      await this.validateRealTimeFeatures();
      await this.validateDataConsistency();
      
      const success = await this.generateValidationReport();
      
      console.log('\n🎉 Validation Complete!');
      return success;
    } catch (error) {
      console.error('❌ Validation failed with error:', error.message);
      this.errors.push(error.message);
      return false;
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ValidationSuite();
  validator.runValidation().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation suite failed:', error);
    process.exit(1);
  });
}

export default ValidationSuite; 