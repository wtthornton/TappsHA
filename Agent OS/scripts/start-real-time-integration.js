#!/usr/bin/env node

/**
 * Start Real-Time Agent OS Integration
 * Activates all real-time monitoring, validation, and early issue detection systems
 */

const { spawn } = require('child_process');
const path = require('path');

// Import all integration components
const EnhancedCursorIntegration = require('../integration/real-time-cursor-enhancement.js');
const TemplateTriggerAutomation = require('../automation/template-trigger-automation.js');
const { DependencyValidator } = require('../utils/dependency-validator.js');

class RealTimeIntegrationStarter {
  constructor() {
    this.activeProcesses = [];
    this.integrations = {};
  }

  /**
   * Start all real-time integrations
   */
  async start() {
    console.log('🚀 Starting Real-Time Agent OS Integration Suite...\n');

    try {
      // 1. Initial environment validation
      await this.runInitialValidation();

      // 2. Start enhanced Cursor integration
      await this.startCursorIntegration();

      // 3. Start template trigger automation
      await this.startTemplateAutomation();

      // 4. Start compliance monitoring
      await this.startComplianceMonitoring();

      // 5. Setup process monitoring
      this.setupProcessMonitoring();

      console.log('\n✅ Real-Time Agent OS Integration Suite ACTIVE');
      console.log('🎯 All systems monitoring for early issue detection');
      console.log('📋 Templates will trigger automatically based on development activities');
      console.log('🔍 Cursor AI enhanced with Agent OS utilities and standards');
      console.log('\n💡 Start coding to experience real-time validation and guidance!\n');

    } catch (error) {
      console.error('❌ Failed to start real-time integration:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run initial environment validation
   */
  async runInitialValidation() {
    console.log('🔍 Running initial environment validation...');
    
    const validator = new DependencyValidator();
    const result = validator.validateEnvironment({
      minNodeVersion: 18,
      checkPackageJson: true
    });

    if (!result.overall) {
      console.log('⚠️  Environment validation issues detected:');
      if (result.nodeVersion && !result.nodeVersion.passed) {
        console.log(`   • Node.js version: ${result.nodeVersion.current} (required: ≥18)`);
      }
      if (result.dependencies && !result.dependencies.passed) {
        console.log(`   • Missing dependencies: ${result.dependencies.missingModules.join(', ')}`);
      }
      console.log('💡 Fix these issues for optimal real-time integration\n');
    } else {
      console.log('✅ Environment validation passed\n');
    }
  }

  /**
   * Start enhanced Cursor integration
   */
  async startCursorIntegration() {
    console.log('🖱️  Starting Enhanced Cursor Integration...');
    
    try {
      this.integrations.cursor = new EnhancedCursorIntegration();
      this.integrations.cursor.start();
      console.log('✅ Enhanced Cursor Integration active\n');
    } catch (error) {
      console.warn('⚠️  Could not start Cursor integration:', error.message);
    }
  }

  /**
   * Start template trigger automation
   */
  async startTemplateAutomation() {
    console.log('📋 Starting Template Trigger Automation...');
    
    try {
      this.integrations.templates = new TemplateTriggerAutomation();
      this.integrations.templates.start();
      console.log('✅ Template Trigger Automation active\n');
    } catch (error) {
      console.warn('⚠️  Could not start template automation:', error.message);
    }
  }

  /**
   * Start compliance monitoring
   */
  async startComplianceMonitoring() {
    console.log('📊 Starting Compliance Monitoring...');
    
    try {
      // Start compliance checker in watch mode
      const complianceProcess = spawn('node', [
        path.join(__dirname, '../tools/compliance-checker.js'),
        '--watch'
      ], {
        stdio: 'inherit',
        detached: false
      });

      this.activeProcesses.push({
        name: 'Compliance Checker',
        process: complianceProcess
      });

      console.log('✅ Compliance Monitoring active\n');
    } catch (error) {
      console.warn('⚠️  Could not start compliance monitoring:', error.message);
    }
  }

  /**
   * Setup process monitoring and cleanup
   */
  setupProcessMonitoring() {
    console.log('🔧 Setting up process monitoring...');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down Real-Time Integration Suite...');
      this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down Real-Time Integration Suite...');
      this.cleanup();
      process.exit(0);
    });

    // Monitor child processes
    this.activeProcesses.forEach(({ name, process }) => {
      process.on('error', (error) => {
        console.warn(`⚠️  ${name} error:`, error.message);
      });

      process.on('exit', (code) => {
        if (code !== 0) {
          console.warn(`⚠️  ${name} exited with code ${code}`);
        }
      });
    });

    console.log('✅ Process monitoring setup complete\n');
  }

  /**
   * Cleanup all processes and resources
   */
  cleanup() {
    console.log('🧹 Cleaning up processes...');

    this.activeProcesses.forEach(({ name, process }) => {
      try {
        if (!process.killed) {
          process.kill('SIGTERM');
          console.log(`   ✅ ${name} stopped`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Could not stop ${name}:`, error.message);
      }
    });

    // Cleanup integrations
    if (this.integrations.cursor && this.integrations.cursor.cleanup) {
      this.integrations.cursor.cleanup();
    }

    console.log('✅ Cleanup complete');
  }

  /**
   * Display status of all integrations
   */
  displayStatus() {
    console.log('\n📊 REAL-TIME INTEGRATION STATUS:');
    console.log('=' * 50);
    
    // Cursor Integration Status
    console.log(`🖱️  Enhanced Cursor Integration: ${this.integrations.cursor ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    
    // Template Automation Status
    console.log(`📋 Template Trigger Automation: ${this.integrations.templates ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    
    // Compliance Monitoring Status
    const complianceActive = this.activeProcesses.some(p => p.name === 'Compliance Checker');
    console.log(`📊 Compliance Monitoring: ${complianceActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    
    console.log('\n🎯 MONITORING CAPABILITIES:');
    console.log('   📦 Dependencies & Environment Changes');
    console.log('   🏗️  Infrastructure Configuration Changes');
    console.log('   💻 Code Changes & Real-time Compliance');
    console.log('   📋 Feature Planning & Automatic Scoring');
    console.log('   🔒 Security & Architecture Validation');
    console.log('   🧪 Testing Requirements & Coverage');
    console.log('   🎯 Phase-aware Template Triggering');
    
    console.log('\n💡 EARLY ISSUE DETECTION:');
    console.log('   • Security vulnerabilities (real-time)');
    console.log('   • Architecture violations (immediate)');
    console.log('   • Feature scope creep (automatic scoring)');
    console.log('   • Environment issues (proactive)');
    console.log('   • Testing gaps (immediate notification)');
    console.log('   • Infrastructure problems (health monitoring)');
  }
}

// CLI usage
if (require.main === module) {
  const starter = new RealTimeIntegrationStarter();
  
  // Check for status command
  if (process.argv.includes('--status')) {
    starter.displayStatus();
    process.exit(0);
  }
  
  // Start the integration suite
  starter.start().catch(error => {
    console.error('Failed to start real-time integration:', error);
    process.exit(1);
  });
}

module.exports = RealTimeIntegrationStarter;