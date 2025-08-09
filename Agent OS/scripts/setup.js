#!/usr/bin/env node

/**
 * Agent OS Setup Script
 * Simplified developer interface for Agent OS initialization and management
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AgentOSSetup {
  constructor() {
    this.agentOsRoot = path.join(__dirname, '..');
    this.projectRoot = path.join(__dirname, '../../..');
  }

  displayBanner() {
    console.log('');
    console.log('🤖 Agent OS - Development Framework Setup');
    console.log('==========================================');
    console.log('Based on Builder Methods Agent OS standards');
    console.log('https://buildermethods.com/agent-os');
    console.log('');
  }

  displayMenu() {
    console.log('Available Commands:');
    console.log('');
    console.log('🚀 Quick Actions:');
    console.log('  1. quick-start     - Initialize Agent OS with real-time integration');
    console.log('  2. validate        - Run comprehensive validation suite');
    console.log('  3. status          - Check Agent OS status and health');
    console.log('');
    console.log('🛠️  Tools:');
    console.log('  4. tools           - Show available development tools');
    console.log('  5. cursor          - Cursor IDE integration tools');
    console.log('  6. lessons         - Lessons learned management');
    console.log('');
    console.log('📊 Analysis:');
    console.log('  7. analysis        - Code and documentation analysis');
    console.log('  8. compliance      - Standards compliance checking');
    console.log('  9. refactoring     - Refactoring validation');
    console.log('');
    console.log('ℹ️  Information:');
    console.log('  10. help           - Show detailed help');
    console.log('  11. docs           - Open documentation');
    console.log('  12. exit           - Exit setup');
    console.log('');
  }

  async runCommand(command) {
    try {
      switch(command) {
        case '1':
        case 'quick-start':
          await this.runQuickStart();
          break;
        case '2':
        case 'validate':
          await this.runValidation();
          break;
        case '3':
        case 'status':
          await this.checkStatus();
          break;
        case '4':
        case 'tools':
          this.showTools();
          break;
        case '5':
        case 'cursor':
          this.showCursorTools();
          break;
        case '6':
        case 'lessons':
          this.showLessonsTools();
          break;
        case '7':
        case 'analysis':
          this.showAnalysisTools();
          break;
        case '8':
        case 'compliance':
          await this.runCompliance();
          break;
        case '9':
        case 'refactoring':
          await this.runRefactoring();
          break;
        case '10':
        case 'help':
          this.showHelp();
          break;
        case '11':
        case 'docs':
          this.openDocs();
          break;
        case '12':
        case 'exit':
          console.log('👋 Goodbye!');
          process.exit(0);
          break;
        default:
          console.log('❌ Unknown command. Type "help" for available commands.');
      }
    } catch (error) {
      console.error('❌ Error executing command:', error.message);
    }
  }

  async runQuickStart() {
    console.log('🚀 Running Agent OS Quick Start...');
    try {
      const quickStartPath = path.join(this.projectRoot, '.agent-os/scripts/quick-start.js');
      console.log(`Running: node ${quickStartPath}`);
      execSync(`node "${quickStartPath}"`, { stdio: 'inherit', cwd: this.projectRoot });
    } catch (error) {
      console.error('❌ Quick start failed:', error.message);
    }
  }

  async runValidation() {
    console.log('🔍 Running validation suite...');
    try {
      execSync('node .agent-os/tools/validation-suite.js', { stdio: 'inherit', cwd: this.projectRoot });
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
    }
  }

  async checkStatus() {
    console.log('📊 Checking Agent OS status...');
    try {
      execSync('node .agent-os/tools/agent-os-cli.js status', { stdio: 'inherit', cwd: this.projectRoot });
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
    }
  }

  showTools() {
    console.log('🛠️  Available Development Tools:');
    console.log('');
    console.log('Main Tools:');
    console.log('  agent-os-cli.js         - Main CLI interface');
    console.log('  compliance-checker.js   - Standards compliance verification');
    console.log('  refactoring-validator.js - Refactoring quality validation');
    console.log('  validation-suite.js     - Comprehensive validation suite');
    console.log('');
    console.log('Categorized Tools:');
    console.log('  tools/cursor/          - Cursor IDE integration tools');
    console.log('  tools/lessons/         - Lessons learned management');
    console.log('  tools/analysis/        - Code and documentation analysis');
    console.log('  tools/markdown/        - Markdown processing tools');
    console.log('');
  }

  showCursorTools() {
    console.log('🎯 Cursor IDE Integration Tools:');
    console.log('');
    console.log('  cursor-analytics.js     - Analytics for Cursor usage');
    console.log('  cursor-init.js          - Initialize Cursor integration');
    console.log('  cursor-rule-optimizer.js - Optimize cursor rules');
    console.log('');
    console.log('Usage: node .agent-os/tools/cursor/[tool-name]');
    console.log('');
  }

  showLessonsTools() {
    console.log('📚 Lessons Learned Management Tools:');
    console.log('');
    console.log('  lesson-categorizer.js      - Categorize lessons learned');
    console.log('  lesson-impact-tracker.js  - Track impact of lessons');
    console.log('  lesson-quality-validator.js - Validate lesson quality');
    console.log('  lesson-template-generator.js - Generate lesson templates');
    console.log('');
    console.log('Usage: node .agent-os/tools/lessons/[tool-name]');
    console.log('');
  }

  showAnalysisTools() {
    console.log('📊 Analysis Tools:');
    console.log('');
    console.log('  documentation-analyzer.js - Analyze documentation quality');
    console.log('  statistical-analysis.js   - Statistical analysis of codebase');
    console.log('');
    console.log('Markdown Tools:');
    console.log('  hybrid-md-processor.js    - Process hybrid markdown files');
    console.log('  md-executor.js           - Execute markdown-based commands');
    console.log('');
    console.log('Usage: node .agent-os/tools/analysis/[tool-name]');
    console.log('       node .agent-os/tools/markdown/[tool-name]');
    console.log('');
  }

  async runCompliance() {
    console.log('✅ Running standards compliance check...');
    try {
      execSync('node .agent-os/tools/compliance-checker.js', { stdio: 'inherit', cwd: this.projectRoot });
    } catch (error) {
      console.error('❌ Compliance check failed:', error.message);
    }
  }

  async runRefactoring() {
    console.log('🔧 Running refactoring validation...');
    try {
      execSync('node .agent-os/tools/refactoring-validator.js --phase=1 --validate', { stdio: 'inherit', cwd: this.projectRoot });
    } catch (error) {
      console.error('❌ Refactoring validation failed:', error.message);
    }
  }

  showHelp() {
    console.log('📖 Agent OS Help');
    console.log('================');
    console.log('');
    console.log('Agent OS is a development framework that provides:');
    console.log('- Standards compliance checking');
    console.log('- Automated refactoring validation');
    console.log('- Lessons learned management');
    console.log('- Real-time development guidance');
    console.log('');
    console.log('Directory Structure:');
    console.log('  .agent-os/');
    console.log('  ├── scripts/           # Simple developer interface');
    console.log('  ├── tools/             # Development tools (categorized)');
    console.log('  ├── utils/             # Utility libraries');
    console.log('  ├── standards/         # Standards documentation');
    console.log('  ├── workflows/         # Automated workflows');
    console.log('  └── ide/              # IDE integrations');
    console.log('');
    console.log('Quick Commands:');
    console.log('  node .agent-os/scripts/setup.js           # This menu');
    console.log('  node .agent-os/scripts/quick-start.js     # Quick setup');
    console.log('  node .agent-os/tools/agent-os-cli.js      # Main CLI');
    console.log('');
    console.log('Documentation: https://buildermethods.com/agent-os');
    console.log('');
  }

  openDocs() {
    console.log('📖 Opening Agent OS Documentation...');
    console.log('');
    console.log('Builder Methods Agent OS: https://buildermethods.com/agent-os');
    console.log('Local Documentation: .agent-os/README.md');
    console.log('Quick Start Guide: .agent-os/QUICK-START-GUIDE.md');
    console.log('');
  }

  async run() {
    this.displayBanner();
    
    const args = process.argv.slice(2);
    if (args.length > 0) {
      await this.runCommand(args[0]);
      return;
    }

    // Interactive mode
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    while (true) {
      this.displayMenu();
      const answer = await new Promise(resolve => {
        rl.question('Enter command (number or name): ', resolve);
      });

      if (answer === '12' || answer === 'exit') {
        rl.close();
        break;
      }

      await this.runCommand(answer.trim());
      console.log('');
    }
  }
}

// Run the setup if called directly
const setup = new AgentOSSetup();
setup.run().catch(console.error);

export default AgentOSSetup;