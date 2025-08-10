#!/usr/bin/env node

/**
 * Enhanced Cursor Integration Start Script
 * Combines all three phases: One-click integration, real-time monitoring, and template automation
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class EnhancedCursorIntegration {
  constructor() {
    this.projectRoot = process.cwd();
    this.agentOsPath = path.join(this.projectRoot, '.agent-os');
    this.integrationStatusFile = path.join(this.agentOsPath, 'enhanced-integration-status.json');
    
    // Integration components
    this.cursorIntegrator = null;
    this.realTimeEnhancement = null;
    this.templateAutomation = null;
    
    // Status tracking
    this.integrationStatus = {
      phase1: { status: 'pending', startTime: null, endTime: null, error: null },
      phase2: { status: 'pending', startTime: null, endTime: null, error: null },
      phase3: { status: 'pending', startTime: null, endTime: null, error: null },
      overall: { status: 'pending', startTime: null, endTime: null }
    };
  }

  async start() {
    console.log('🚀 Starting Enhanced Cursor Integration...\n');
    
    try {
      this.integrationStatus.overall.startTime = new Date().toISOString();
      
      // Phase 1: One-click Cursor Integration
      await this.runPhase1();
      
      // Phase 2: Real-time Monitoring
      await this.runPhase2();
      
      // Phase 3: Template Automation
      await this.runPhase3();
      
      // Final validation
      await this.validateAllPhases();
      
      this.integrationStatus.overall.status = 'completed';
      this.integrationStatus.overall.endTime = new Date().toISOString();
      
      await this.saveIntegrationStatus();
      
      console.log('\n🎉 Enhanced Cursor Integration Complete!');
      console.log('💡 All three phases are now active:');
      console.log('   📝 Phase 1: Cursor rules and .cursorrules file');
      console.log('   🔍 Phase 2: Real-time monitoring and validation');
      console.log('   🤖 Phase 3: Template automation and checklists');
      console.log('\n🚀 Start coding to experience the full Agent OS integration!');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Enhanced integration failed:', error.message);
      
      this.integrationStatus.overall.status = 'failed';
      this.integrationStatus.overall.endTime = new Date().toISOString();
      this.integrationStatus.overall.error = error.message;
      
      await this.saveIntegrationStatus();
      
      return { success: false, error: error.message };
    }
  }

  async runPhase1() {
    console.log('📝 Phase 1: One-Click Cursor Integration');
    this.integrationStatus.phase1.startTime = new Date().toISOString();
    
    try {
      const cursorIntegratePath = path.join(this.agentOsPath, 'tools', 'cursor', 'cursor-integrate.js');
      
      if (!fs.existsSync(cursorIntegratePath)) {
        throw new Error('Cursor integration script not found');
      }
      
      console.log('   Running cursor integration...');
      
      const result = await this.runScript(cursorIntegratePath, ['integrate']);
      
      if (result.success) {
        this.integrationStatus.phase1.status = 'completed';
        this.integrationStatus.phase1.endTime = new Date().toISOString();
        console.log('   ✅ Phase 1 completed successfully');
      } else {
        throw new Error(`Cursor integration failed: ${result.error}`);
      }
      
    } catch (error) {
      this.integrationStatus.phase1.status = 'failed';
      this.integrationStatus.phase1.endTime = new Date().toISOString();
      this.integrationStatus.phase1.error = error.message;
      throw error;
    }
  }

  async runPhase2() {
    console.log('🔍 Phase 2: Real-Time Monitoring & Validation');
    this.integrationStatus.phase2.startTime = new Date().toISOString();
    
    try {
      const realTimePath = path.join(this.agentOsPath, 'ide', 'real-time-cursor-enhancement.js');
      
      if (!fs.existsSync(realTimePath)) {
        throw new Error('Real-time enhancement script not found');
      }
      
      console.log('   Starting real-time monitoring...');
      
      // Start real-time enhancement in background
      const child = spawn('node', [realTimePath, 'start'], {
        stdio: 'pipe',
        cwd: this.agentOsPath,
        detached: true
      });
      
      // Store process info
      this.realTimeProcess = {
        pid: child.pid,
        startTime: Date.now()
      };
      
      // Wait for startup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if process is still running
      try {
        process.kill(child.pid, 0);
        this.integrationStatus.phase2.status = 'completed';
        this.integrationStatus.phase2.endTime = new Date().toISOString();
        console.log('   ✅ Phase 2 completed successfully (PID: ' + child.pid + ')');
      } catch (error) {
        throw new Error('Real-time monitoring process failed to start');
      }
      
    } catch (error) {
      this.integrationStatus.phase2.status = 'failed';
      this.integrationStatus.phase2.endTime = new Date().toISOString();
      this.integrationStatus.phase2.error = error.message;
      throw error;
    }
  }

  async runPhase3() {
    console.log('🤖 Phase 3: Template Automation & Checklists');
    this.integrationStatus.phase3.startTime = new Date().toISOString();
    
    try {
      const templatePath = path.join(this.agentOsPath, 'workflows', 'template-trigger-automation.js');
      
      if (!fs.existsSync(templatePath)) {
        throw new Error('Template automation script not found');
      }
      
      console.log('   Initializing template automation...');
      
      // Test template automation
      const result = await this.runScript(templatePath, ['status']);
      
      if (result.success) {
        this.integrationStatus.phase3.status = 'completed';
        this.integrationStatus.phase3.endTime = new Date().toISOString();
        console.log('   ✅ Phase 3 completed successfully');
      } else {
        throw new Error(`Template automation failed: ${result.error}`);
      }
      
    } catch (error) {
      this.integrationStatus.phase3.status = 'failed';
      this.integrationStatus.phase3.endTime = new Date().toISOString();
      this.integrationStatus.phase3.error = error.message;
      throw error;
    }
  }

  async validateAllPhases() {
    console.log('✅ Validating all integration phases...');
    
    try {
      // Validate Phase 1: Check .cursorrules file
      const cursorRulesPath = path.join(this.projectRoot, '.cursorrules');
      if (!fs.existsSync(cursorRulesPath)) {
        throw new Error('Phase 1 validation failed: .cursorrules file not found');
      }
      console.log('   ✅ Phase 1 validation passed');
      
      // Validate Phase 2: Check real-time monitoring
      if (!this.realTimeProcess || !this.realTimeProcess.pid) {
        throw new Error('Phase 2 validation failed: Real-time monitoring not active');
      }
      
      try {
        process.kill(this.realTimeProcess.pid, 0);
        console.log('   ✅ Phase 2 validation passed');
      } catch (error) {
        throw new Error('Phase 2 validation failed: Real-time monitoring process not running');
      }
      
      // Validate Phase 3: Check template automation
      const templatePath = path.join(this.agentOsPath, 'workflows', 'template-trigger-automation.js');
      if (!fs.existsSync(templatePath)) {
        throw new Error('Phase 3 validation failed: Template automation not available');
      }
      console.log('   ✅ Phase 3 validation passed');
      
      console.log('   ✅ All phases validated successfully');
      
    } catch (error) {
      throw new Error(`Integration validation failed: ${error.message}`);
    }
  }

  async runScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath, ...args], {
        stdio: 'pipe',
        cwd: this.agentOsPath
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, stdout, stderr });
        } else {
          resolve({ success: false, error: stderr || `Script failed with code ${code}` });
        }
      });
      
      child.on('error', reject);
    });
  }

  async saveIntegrationStatus() {
    try {
      const statusDir = path.dirname(this.integrationStatusFile);
      if (!fs.existsSync(statusDir)) {
        fs.mkdirSync(statusDir, { recursive: true });
      }
      
      fs.writeFileSync(this.integrationStatusFile, JSON.stringify(this.integrationStatus, null, 2));
      
    } catch (error) {
      console.warn('⚠️  Could not save integration status:', error.message);
    }
  }

  async checkStatus() {
    try {
      if (fs.existsSync(this.integrationStatusFile)) {
        const status = JSON.parse(fs.readFileSync(this.integrationStatusFile, 'utf8'));
        return status;
      }
      return { overall: { status: 'not_started' } };
    } catch (error) {
      return { overall: { status: 'error', error: error.message } };
    }
  }

  async stop() {
    console.log('🔄 Stopping Enhanced Cursor Integration...');
    
    try {
      // Stop real-time monitoring
      if (this.realTimeProcess && this.realTimeProcess.pid) {
        try {
          process.kill(this.realTimeProcess.pid, 'SIGTERM');
          console.log('   ✅ Real-time monitoring stopped');
        } catch (error) {
          console.warn('   ⚠️  Could not stop real-time monitoring');
        }
      }
      
      // Update status
      this.integrationStatus.overall.status = 'stopped';
      this.integrationStatus.overall.endTime = new Date().toISOString();
      await this.saveIntegrationStatus();
      
      console.log('✅ Enhanced integration stopped');
      
    } catch (error) {
      console.error('❌ Error stopping integration:', error.message);
    }
  }

  async restart() {
    console.log('🔄 Restarting Enhanced Cursor Integration...');
    
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for cleanup
    await this.start();
  }

  getIntegrationInfo() {
    return {
      projectRoot: this.projectRoot,
      agentOsPath: this.agentOsPath,
      realTimeProcess: this.realTimeProcess,
      integrationStatus: this.integrationStatus
    };
  }
}

// CLI interface
async function main() {
  const integration = new EnhancedCursorIntegration();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      await integration.start();
      break;
      
    case 'stop':
      await integration.stop();
      break;
      
    case 'restart':
      await integration.restart();
      break;
      
    case 'status':
      const status = await integration.checkStatus();
      console.log('📊 Enhanced Integration Status:', JSON.stringify(status, null, 2));
      break;
      
    case 'info':
      const info = integration.getIntegrationInfo();
      console.log('📋 Integration Information:', JSON.stringify(info, null, 2));
      break;
      
    case 'help':
      console.log(`
🚀 Enhanced Cursor Integration

Usage: node start-enhanced-integration.js [command]

Commands:
  start     Start all three phases of integration (default)
  stop      Stop all integration components
  restart   Restart all integration components
  status    Check integration status
  info      Show integration information
  help      Show this help message

Examples:
  node start-enhanced-integration.js              # Start all phases
  node start-enhanced-integration.js status      # Check status
  node start-enhanced-integration.js restart     # Restart integration
      `);
      break;
      
    default:
      await integration.start();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = EnhancedCursorIntegration;
