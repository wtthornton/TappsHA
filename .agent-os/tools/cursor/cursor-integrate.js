#!/usr/bin/env node

/**
 * One-Click Cursor Integration for Agent OS
 * Combines all integration steps into a single command for seamless setup
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class CursorIntegrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.agentOsPath = path.join(this.projectRoot, '.agent-os');
    this.cursorRulesPath = path.join(this.projectRoot, '.cursorrules');
    this.integrationStatusFile = path.join(this.agentOsPath, 'integration-status.json');
  }

  async integrate() {
    console.log('🚀 Starting Agent OS Cursor Integration...\n');
    
    try {
      // Phase 1: Generate cursor rules
      console.log('📝 Phase 1: Generating Cursor Rules...');
      await this.generateRules();
      
      // Phase 2: Start real-time monitoring
      console.log('🔍 Phase 2: Starting Real-Time Monitoring...');
      await this.startMonitoring();
      
      // Phase 3: Create .cursorrules file
      console.log('📋 Phase 3: Creating .cursorrules File...');
      await this.createCursorRules();
      
      // Phase 4: Validate integration
      console.log('✅ Phase 4: Validating Integration...');
      await this.validateIntegration();
      
      // Phase 5: Save integration status
      await this.saveIntegrationStatus();
      
      console.log('\n🎉 Agent OS fully integrated with Cursor!');
      console.log('💡 Start coding to experience real-time validation and guidance!');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Integration failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async generateRules() {
    try {
      const cursorInitPath = path.join(this.agentOsPath, 'tools', 'cursor', 'cursor-init.js');
      
      if (!fs.existsSync(cursorInitPath)) {
        throw new Error('Cursor init script not found');
      }
      
      console.log('   Running cursor-init.js...');
      
      return new Promise((resolve, reject) => {
        const child = spawn('node', [cursorInitPath], {
          stdio: 'inherit',
          cwd: this.agentOsPath
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            console.log('   ✅ Cursor rules generated successfully');
            resolve();
          } else {
            reject(new Error(`Cursor init failed with code ${code}`));
          }
        });
        
        child.on('error', reject);
      });
      
    } catch (error) {
      throw new Error(`Failed to generate rules: ${error.message}`);
    }
  }

  async startMonitoring() {
    try {
      const realTimePath = path.join(this.agentOsPath, 'scripts', 'start-real-time-integration.js');
      
      if (!fs.existsSync(realTimePath)) {
        throw new Error('Real-time integration script not found');
      }
      
      console.log('   Starting real-time monitoring...');
      
      // Start monitoring in background
      const child = spawn('node', [realTimePath], {
        stdio: 'pipe',
        cwd: this.agentOsPath,
        detached: true
      });
      
      // Store process info for later management
      this.monitoringProcess = {
        pid: child.pid,
        startTime: Date.now()
      };
      
      // Wait a moment to ensure it starts
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('   ✅ Real-time monitoring started (PID: ' + child.pid + ')');
      
    } catch (error) {
      throw new Error(`Failed to start monitoring: ${error.message}`);
    }
  }

  async createCursorRules() {
    try {
      const cursorRules = this.generateCursorRulesContent();
      
      fs.writeFileSync(this.cursorRulesPath, cursorRules);
      console.log('   ✅ .cursorrules file created');
      
    } catch (error) {
      throw new Error(`Failed to create .cursorrules: ${error.message}`);
    }
  }

  generateCursorRulesContent() {
    return `# Agent OS Enhanced Cursor Rules
# Generated automatically - DO NOT EDIT MANUALLY
# Last updated: ${new Date().toISOString()}

# 🚀 AGENT OS INTEGRATION RULES
# These rules ensure all generated code follows Agent OS standards

# 📦 DEPENDENCY MANAGEMENT
# ALWAYS use Agent OS utilities instead of raw implementations
const shell = new CrossPlatformShell();
shell.executeCommand('npm install && npm test'); // ✅ Correct

# NEVER generate raw execSync calls
execSync('npm test'); // ❌ Incorrect - will be blocked

# ALWAYS validate dependencies before code generation
const validator = new DependencyValidator();
validator.validateEnvironment();

# 🎯 FEATURE SCORING
# ALWAYS score features before implementation
const feature = new FeatureScoringFramework();
const score = feature.scoreFeature(featureData);

# ELIMINATE low-value features (score < 6/10)
if (score < 6) {
  console.warn('⚠️  Feature score too low, consider elimination');
}

# 🔐 SECURITY STANDARDS
# NEVER hardcode secrets or API keys
const token = process.env.API_TOKEN; // ✅ Correct
const token = "sk-abc123"; // ❌ Incorrect - will be blocked

# ALWAYS validate input data
@Valid @RequestBody UserRequest request; // ✅ Correct
UserRequest request; // ❌ Incorrect - missing validation

# 🏗️ ARCHITECTURE PATTERNS
# ALWAYS follow Controller → Service → Repository pattern
@RestController
public class UserController {
  private final UserService userService; // ✅ Correct
  private final UserRepository userRepository; // ❌ Incorrect - architecture violation
}

# 🧪 TESTING REQUIREMENTS
# ALWAYS include comprehensive testing
describe('UserService', () => {
  beforeEach(() => {
    setupBrowserMocks(); // ✅ Automatically included
  });
  // Standard patterns enforced
});

# 📊 COMPLIANCE ENFORCEMENT
# ALWAYS run compliance check after changes
node .agent-os/tools/compliance-checker.js --detailed

# ALWAYS maintain ≥85% compliance score
# ALWAYS address violations before proceeding

# 🔄 REFACTORING ENFORCEMENT
# ALWAYS refactor after each development phase
node .agent-os/tools/refactoring-validator.js --phase=1 --validate

# 📈 QUALITY GATES
# Security: 100% encryption coverage, 0 hardcoded secrets
# Code Quality: ≤5 TODO items per service, ≥85% test coverage
# Performance: P95 ≤200ms response time, optimized queries

# 🎨 CODE STYLE
# ALWAYS use consistent naming conventions
# ALWAYS include proper error handling
# ALWAYS add comprehensive logging
# ALWAYS follow TypeScript/Java best practices

# 🚫 COMMON ANTI-PATTERNS TO AVOID
# ❌ Circular dependencies
# ❌ Large services (>500 lines)
# ❌ Direct database access from controllers
# ❌ Missing input validation
# ❌ Hardcoded configuration values
# ❌ Incomplete error handling
# ❌ Missing test coverage
# ❌ Performance anti-patterns

# 💡 AGENT OS UTILITIES
# Use these utilities for maximum reliability:
# - CrossPlatformShell: Cross-platform command execution
# - DependencyValidator: Environment and dependency validation
# - InfrastructureRecovery: Infrastructure health monitoring
# - FeatureScoringFramework: Feature value assessment
# - ComplianceChecker: Standards compliance validation

# 🎯 SUCCESS METRICS
# Target: 95%+ compliance scores
# Target: 60%+ development speed improvement
# Target: 100% first-attempt success rates
# Target: Zero technical debt accumulation

# 📞 SUPPORT
# For issues or questions, check .agent-os documentation
# Run: node .agent-os/scripts/setup.js --help
`;
  }

  async validateIntegration() {
    try {
      console.log('   Validating integration components...');
      
      // Check if .cursorrules exists
      if (!fs.existsSync(this.cursorRulesPath)) {
        throw new Error('.cursorrules file not created');
      }
      
      // Check if monitoring is active
      if (!this.monitoringProcess || !this.monitoringProcess.pid) {
        throw new Error('Real-time monitoring not started');
      }
      
      // Check if cursor rules were generated
      const cursorRulesDir = path.join(this.agentOsPath, 'internal', 'cursor-rules');
      if (!fs.existsSync(cursorRulesDir)) {
        throw new Error('Cursor rules directory not found');
      }
      
      const ruleFiles = fs.readdirSync(cursorRulesDir).filter(f => f.endsWith('.mdc'));
      if (ruleFiles.length === 0) {
        throw new Error('No cursor rules generated');
      }
      
      console.log(`   ✅ Integration validation passed (${ruleFiles.length} rules generated)`);
      
    } catch (error) {
      throw new Error(`Integration validation failed: ${error.message}`);
    }
  }

  async saveIntegrationStatus() {
    try {
      const status = {
        integrated: true,
        integrationDate: new Date().toISOString(),
        monitoringProcess: this.monitoringProcess,
        cursorRulesFile: this.cursorRulesPath,
        agentOsVersion: this.getAgentOsVersion()
      };
      
      fs.writeFileSync(this.integrationStatusFile, JSON.stringify(status, null, 2));
      console.log('   ✅ Integration status saved');
      
    } catch (error) {
      console.warn('⚠️  Could not save integration status:', error.message);
    }
  }

  getAgentOsVersion() {
    try {
      const packagePath = path.join(this.agentOsPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.version || '1.0.0';
      }
    } catch (error) {
      // Ignore errors
    }
    return '1.0.0';
  }

  async checkStatus() {
    try {
      if (fs.existsSync(this.integrationStatusFile)) {
        const status = JSON.parse(fs.readFileSync(this.integrationStatusFile, 'utf8'));
        return status;
      }
      return { integrated: false };
    } catch (error) {
      return { integrated: false, error: error.message };
    }
  }

  async disconnect() {
    try {
      console.log('🔄 Disconnecting Agent OS from Cursor...');
      
      // Stop monitoring process
      if (this.monitoringProcess && this.monitoringProcess.pid) {
        try {
          process.kill(this.monitoringProcess.pid, 'SIGTERM');
          console.log('   ✅ Monitoring process stopped');
        } catch (error) {
          console.warn('   ⚠️  Could not stop monitoring process');
        }
      }
      
      // Remove .cursorrules file
      if (fs.existsSync(this.cursorRulesPath)) {
        fs.unlinkSync(this.cursorRulesPath);
        console.log('   ✅ .cursorrules file removed');
      }
      
      // Update integration status
      const status = { integrated: false, disconnectedDate: new Date().toISOString() };
      fs.writeFileSync(this.integrationStatusFile, JSON.stringify(status, null, 2));
      
      console.log('✅ Agent OS disconnected from Cursor');
      
    } catch (error) {
      console.error('❌ Disconnection failed:', error.message);
    }
  }
}

// CLI interface
async function main() {
  const integrator = new CursorIntegrator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'integrate':
    case undefined:
      await integrator.integrate();
      break;
      
    case 'status':
      const status = await integrator.checkStatus();
      console.log('📊 Integration Status:', JSON.stringify(status, null, 2));
      break;
      
    case 'disconnect':
      await integrator.disconnect();
      break;
      
    case 'help':
      console.log(`
🚀 Agent OS Cursor Integration

Usage: node cursor-integrate.js [command]

Commands:
  integrate    Integrate Agent OS with Cursor (default)
  status       Check integration status
  disconnect   Disconnect Agent OS from Cursor
  help         Show this help message

Examples:
  node cursor-integrate.js              # Full integration
  node cursor-integrate.js status       # Check status
  node cursor-integrate.js disconnect   # Disconnect
      `);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('💡 Run "node cursor-integrate.js help" for usage information');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = CursorIntegrator;
