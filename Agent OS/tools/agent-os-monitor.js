#!/usr/bin/env node

/**
 * Agent-OS Monitor CLI
 * Simple one-command monitoring start for Agent-OS real-time metrics
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AgentOSMonitor {
  constructor() {
    this.dashboardProcess = null;
    this.apiProcess = null;
    this.complianceProcess = null;
    this.isRunning = false;
  }

  /**
   * Start all monitoring services
   */
  start() {
    console.log('🚀 Starting Agent-OS Real-Time Monitoring...');
    console.log('📊 This will start:');
    console.log('   - Enhanced Dashboard (http://localhost:3001)');
    console.log('   - Simple Metrics API (http://localhost:3002)');
    console.log('   - Real-time Compliance Monitoring');
    console.log('');
    
    this.startDashboard();
    this.startAPI();
    this.startComplianceMonitoring();
    
    this.isRunning = true;
    
    console.log('✅ All services started!');
    console.log('📊 Dashboard: http://localhost:3001');
    console.log('📈 API: http://localhost:3002/metrics');
    console.log('🛑 Press Ctrl+C to stop all services');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });
  }

  /**
   * Start the enhanced dashboard
   */
  startDashboard() {
    console.log('📊 Starting Enhanced Dashboard...');
    
    const dashboardPath = path.join(__dirname, 'enhanced-dashboard.js');
    this.dashboardProcess = spawn('node', [dashboardPath], {
      stdio: 'pipe',
      detached: false
    });

    this.dashboardProcess.stdout.on('data', (data) => {
      console.log(`📊 Dashboard: ${data.toString().trim()}`);
    });

    this.dashboardProcess.stderr.on('data', (data) => {
      console.error(`📊 Dashboard Error: ${data.toString().trim()}`);
    });

    this.dashboardProcess.on('close', (code) => {
      if (this.isRunning) {
        console.log(`📊 Dashboard stopped with code ${code}`);
      }
    });
  }

  /**
   * Start the simple metrics API
   */
  startAPI() {
    console.log('📈 Starting Simple Metrics API...');
    
    const apiPath = path.join(__dirname, 'simple-metrics-api.js');
    this.apiProcess = spawn('node', [apiPath], {
      stdio: 'pipe',
      detached: false
    });

    this.apiProcess.stdout.on('data', (data) => {
      console.log(`📈 API: ${data.toString().trim()}`);
    });

    this.apiProcess.stderr.on('data', (data) => {
      console.error(`📈 API Error: ${data.toString().trim()}`);
    });

    this.apiProcess.on('close', (code) => {
      if (this.isRunning) {
        console.log(`📈 API stopped with code ${code}`);
      }
    });
  }

  /**
   * Start real-time compliance monitoring
   */
  startComplianceMonitoring() {
    console.log('🔍 Starting Real-time Compliance Monitoring...');
    
    const compliancePath = path.join(__dirname, 'compliance-checker.js');
    this.complianceProcess = spawn('node', [compliancePath, 'monitor'], {
      stdio: 'pipe',
      detached: false
    });

    this.complianceProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output.includes('File') || output.includes('violation')) {
        console.log(`🔍 Compliance: ${output}`);
      }
    });

    this.complianceProcess.stderr.on('data', (data) => {
      console.error(`🔍 Compliance Error: ${data.toString().trim()}`);
    });

    this.complianceProcess.on('close', (code) => {
      if (this.isRunning) {
        console.log(`🔍 Compliance monitoring stopped with code ${code}`);
      }
    });
  }

  /**
   * Stop all monitoring services
   */
  stop() {
    console.log('\n🛑 Stopping Agent-OS monitoring services...');
    this.isRunning = false;

    if (this.dashboardProcess) {
      this.dashboardProcess.kill('SIGINT');
      console.log('📊 Dashboard stopped');
    }

    if (this.apiProcess) {
      this.apiProcess.kill('SIGINT');
      console.log('📈 API stopped');
    }

    if (this.complianceProcess) {
      this.complianceProcess.kill('SIGINT');
      console.log('🔍 Compliance monitoring stopped');
    }

    console.log('✅ All services stopped');
    process.exit(0);
  }

  /**
   * Get status of all services
   */
  getStatus() {
    const status = {
      dashboard: this.dashboardProcess ? 'running' : 'stopped',
      api: this.apiProcess ? 'running' : 'stopped',
      compliance: this.complianceProcess ? 'running' : 'stopped',
      overall: this.isRunning ? 'running' : 'stopped'
    };

    console.log('📊 Agent-OS Monitoring Status:');
    console.log(`   Dashboard: ${status.dashboard}`);
    console.log(`   API: ${status.api}`);
    console.log(`   Compliance: ${status.compliance}`);
    console.log(`   Overall: ${status.overall}`);

    return status;
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log('🚀 Agent-OS Monitor CLI');
    console.log('');
    console.log('Usage:');
    console.log('  node agent-os-monitor.js start    - Start all monitoring services');
    console.log('  node agent-os-monitor.js status   - Show service status');
    console.log('  node agent-os-monitor.js help     - Show this help');
    console.log('');
    console.log('Services:');
    console.log('  📊 Enhanced Dashboard - http://localhost:3001');
    console.log('  📈 Simple Metrics API - http://localhost:3002');
    console.log('  🔍 Real-time Compliance Monitoring');
    console.log('');
    console.log('API Endpoints:');
    console.log('  GET /metrics           - Current compliance metrics');
    console.log('  GET /metrics/history   - Historical data');
    console.log('  GET /metrics/trends    - Trend analysis');
    console.log('  GET /metrics/effectiveness - Effectiveness metrics');
    console.log('  GET /metrics/health    - API health check');
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new AgentOSMonitor();
  const command = process.argv[2] || 'start';

  switch (command) {
    case 'start':
      monitor.start();
      break;
    case 'status':
      monitor.getStatus();
      break;
    case 'help':
      monitor.showHelp();
      break;
    default:
      console.log(`❌ Unknown command: ${command}`);
      monitor.showHelp();
      process.exit(1);
  }
}

module.exports = AgentOSMonitor; 