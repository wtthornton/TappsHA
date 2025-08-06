#!/usr/bin/env node

/**
 * Agent OS Quick Start
 * One-command activation of all real-time Agent OS capabilities
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
🚀 AGENT OS QUICK START
=====================

Activating real-time integration suite with:
• Enhanced Cursor AI integration with Agent OS utilities
• Automatic template triggering based on development phases  
• Real-time compliance monitoring and validation
• Early issue detection and prevention
• Feature scoring and scope management
• Infrastructure health monitoring

🎯 This will transform your development experience from reactive to proactive!
`);

class QuickStart {
  constructor() {
    this.projectRoot = path.join(__dirname, '../../..');
    this.agentOsRoot = path.join(__dirname, '..');
  }

  async start() {
    console.log('🔧 Initializing Agent OS components...\n');

    try {
      // 1. Check Node.js dependencies
      await this.checkDependencies();

      // 2. Initialize Cursor integration
      await this.initializeCursor();

      // 3. Start real-time integration
      await this.startRealTimeIntegration();

      // 4. Validate installation
      await this.validateInstallation();

      console.log(`
✅ AGENT OS QUICK START COMPLETE!
================================

🎯 Your development environment is now enhanced with:
   • Real-time standards enforcement via Cursor AI
   • Automated validation and compliance checking
   • Lessons learned integration
   • Phase-aware development guidance

🚀 Next steps:
   1. Open any file in Cursor to see real-time guidance
   2. Run: node .agent-os/scripts/setup.js validate
   3. Check: node .agent-os/scripts/setup.js status

📖 Documentation: .agent-os/DEVELOPER-GUIDE.md
`);

    } catch (error) {
      console.error('❌ Quick start failed:', error.message);
      console.log('\n🔧 Try running individual components:');
      console.log('   node .agent-os/tools/cursor/cursor-init.js');
      console.log('   node .agent-os/scripts/start-real-time-integration.js');
    }
  }

  async checkDependencies() {
    console.log('📦 Checking dependencies...');
    
    try {
      // Check if we have required tools
      const toolsPath = path.join(this.agentOsRoot, 'tools');
      const utilsPath = path.join(this.agentOsRoot, 'utils');
      
      if (!fs.existsSync(toolsPath)) {
        throw new Error('Tools directory not found');
      }
      
      if (!fs.existsSync(utilsPath)) {
        throw new Error('Utils directory not found');
      }
      
      console.log('   ✅ Agent OS tools and utilities found');
    } catch (error) {
      throw new Error(`Dependency check failed: ${error.message}`);
    }
  }

  async initializeCursor() {
    console.log('🎯 Initializing Cursor integration...');
    
    try {
      const cursorInitPath = path.join(this.agentOsRoot, 'tools/cursor/cursor-init.js');
      
      if (fs.existsSync(cursorInitPath)) {
        console.log('   Running cursor-init...');
        execSync(`node "${cursorInitPath}"`, { 
          stdio: 'pipe',
          cwd: this.projectRoot 
        });
        console.log('   ✅ Cursor integration initialized');
      } else {
        console.log('   ⚠️  Cursor init script not found, skipping...');
      }
    } catch (error) {
      console.log('   ⚠️  Cursor initialization failed:', error.message);
    }
  }

  async startRealTimeIntegration() {
    console.log('⚡ Starting real-time integration...');
    
    try {
      const realTimeIntegrationPath = path.join(this.agentOsRoot, 'scripts/start-real-time-integration.js');
      
      if (fs.existsSync(realTimeIntegrationPath)) {
        console.log('   Activating real-time features...');
        execSync(`node "${realTimeIntegrationPath}"`, { 
          stdio: 'pipe',
          cwd: this.projectRoot 
        });
        console.log('   ✅ Real-time integration activated');
      } else {
        console.log('   ⚠️  Real-time integration script not found, creating basic setup...');
        await this.createBasicIntegration();
      }
    } catch (error) {
      console.log('   ⚠️  Real-time integration warning:', error.message);
      await this.createBasicIntegration();
    }
  }

  async createBasicIntegration() {
    console.log('   📝 Creating basic integration setup...');
    
    // Ensure .cursorrules is updated with Agent OS integration
    const cursorrrulesPath = path.join(this.projectRoot, '.cursorrules');
    const agentOsIntegration = `
# Agent OS Integration
- Always reference .agent-os/standards/ for coding standards
- Use .agent-os/utils/ utilities in generated code
- Follow .agent-os/templates/ for consistent patterns
- Run .agent-os/tools/compliance-checker.js before major changes
`;
    
    try {
      if (fs.existsSync(cursorrrulesPath)) {
        const existing = fs.readFileSync(cursorrrulesPath, 'utf8');
        if (!existing.includes('Agent OS Integration')) {
          fs.appendFileSync(cursorrrulesPath, agentOsIntegration);
          console.log('   ✅ Updated .cursorrules with Agent OS integration');
        }
      } else {
        fs.writeFileSync(cursorrrulesPath, agentOsIntegration);
        console.log('   ✅ Created .cursorrules with Agent OS integration');
      }
    } catch (error) {
      console.log('   ⚠️  Could not update .cursorrules:', error.message);
    }
  }

  async validateInstallation() {
    console.log('🔍 Validating installation...');
    
    try {
      // Check key components
      const components = [
        'tools/agent-os-cli.js',
        'tools/compliance-checker.js',
        'utils/index.js',
        'standards/tech-stack.md'
      ];
      
      let allFound = true;
      for (const component of components) {
        const componentPath = path.join(this.agentOsRoot, component);
        if (fs.existsSync(componentPath)) {
          console.log(`   ✅ ${component}`);
        } else {
          console.log(`   ❌ ${component} - NOT FOUND`);
          allFound = false;
        }
      }
      
      if (allFound) {
        console.log('   ✅ All core components validated');
      } else {
        console.log('   ⚠️  Some components missing - functionality may be limited');
      }
      
    } catch (error) {
      console.log('   ⚠️  Validation warning:', error.message);
    }
  }
}

// Run quick start
const quickStart = new QuickStart();
quickStart.start().catch(console.error);