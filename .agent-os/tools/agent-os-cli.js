#!/usr/bin/env node

/**
 * Agent OS CLI - Main entry point for all Agent OS tools
 * 
 * Provides a unified interface for developers to interact with Agent OS tools
 * including compliance checking, standards validation, and lessons learned tracking.
 */

import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import tool modules
import ComplianceChecker from './compliance-checker.js';

class AgentOSCLI {
  constructor() {
    this.setupCommands();
  }

  setupCommands() {
    program
      .name('agent-os')
      .description('Agent OS Development Framework CLI')
      .version('1.0.0');

    // Compliance checking commands
    program
      .command('check')
      .description('Run full compliance check against Agent OS standards')
      .option('-f, --file <path>', 'Check specific file')
      .option('-r, --report', 'Generate detailed compliance report')
      .option('-v, --verbose', 'Verbose output')
      .action(async (options) => {
        try {
          const checker = new ComplianceChecker();
          await checker.runCheck(options);
        } catch (error) {
          console.error('❌ Compliance check failed:', error.message);
          process.exit(1);
        }
      });

    // Real-time validation
    program
      .command('watch')
      .description('Start real-time validation and compliance monitoring')
      .option('-d, --dashboard', 'Open compliance dashboard')
      .action(async (options) => {
        try {
          const integration = new CursorIntegration();
          await integration.startWatch(options);
        } catch (error) {
          console.error('❌ Watch mode failed:', error.message);
          process.exit(1);
        }
      });

    // Standards validation
    program
      .command('validate')
      .description('Validate project against Agent OS standards')
      .option('-s, --standard <name>', 'Validate specific standard')
      .option('-a, --all', 'Validate all standards')
      .action(async (options) => {
        try {
          const checker = new ComplianceChecker();
          await checker.runCheck(options);
        } catch (error) {
          console.error('❌ Standards validation failed:', error.message);
          process.exit(1);
        }
      });

    // Lessons learned tracking
    program
      .command('lessons')
      .description('Manage lessons learned and insights')
      .option('-c, --capture', 'Capture new lesson learned')
      .option('-l, --list', 'List all lessons learned')
      .option('-a, --apply', 'Apply lessons learned to current project')
      .action(async (options) => {
        try {
          console.log('📚 Lessons learned tracking - Coming soon');
          console.log('This feature will be implemented in a future update');
        } catch (error) {
          console.error('❌ Lessons tracking failed:', error.message);
          process.exit(1);
        }
      });

    // Quick status check
    program
      .command('status')
      .description('Show current Agent OS status and compliance score')
      .action(async () => {
        try {
          await this.showStatus();
        } catch (error) {
          console.error('❌ Status check failed:', error.message);
          process.exit(1);
        }
      });

    // Help command
    program
      .command('help')
      .description('Show detailed help information')
      .action(() => {
        this.showHelp();
      });
  }

  async showStatus() {
    console.log('🔍 Agent OS Status Check...\n');
    
    // Check if standards exist
    const standardsPath = path.join(__dirname, '../standards');
    if (fs.existsSync(standardsPath)) {
      console.log('✅ Standards directory found');
    } else {
      console.log('❌ Standards directory missing');
    }

    // Check if tools are available
    const toolsPath = path.join(__dirname);
    if (fs.existsSync(toolsPath)) {
      console.log('✅ Tools directory found');
    } else {
      console.log('❌ Tools directory missing');
    }

    // Run quick compliance check
    try {
      const checker = new ComplianceChecker();
      const result = await checker.quickCheck();
      console.log(`📊 Quick Compliance Score: ${result.score}%`);
      console.log(`⚠️  Violations: ${result.violations.length}`);
    } catch (error) {
      console.log('❌ Compliance check failed');
    }

    console.log('\n🎯 Agent OS is ready for development!');
  }

  showHelp() {
    console.log(`
🤖 Agent OS CLI - Development Framework

USAGE:
  node .agent-os/tools/agent-os-cli.js <command> [options]

COMMANDS:
  check     Run full compliance check against Agent OS standards
  watch     Start real-time validation and compliance monitoring
  validate  Validate project against Agent OS standards
  lessons   Manage lessons learned and insights
  status    Show current Agent OS status and compliance score
  help      Show this help information

EXAMPLES:
  # Run full compliance check
  node .agent-os/tools/agent-os-cli.js check

  # Start real-time monitoring
  node .agent-os/tools/agent-os-cli.js watch

  # Validate specific standard
  node .agent-os/tools/agent-os-cli.js validate --standard security

  # Capture new lesson learned
  node .agent-os/tools/agent-os-cli.js lessons --capture

  # Check current status
  node .agent-os/tools/agent-os-cli.js status

STANDARDS:
  Agent OS enforces standards for:
  - Technology Stack (Spring Boot 3.3+, React 19, PostgreSQL 17)
  - Code Style (TypeScript 5, 2 spaces, 100 chars max)
  - Security (OAuth 2.1, input validation, no hardcoded secrets)
  - Architecture (Controller → Service → Repository pattern)
  - Testing (≥85% branch coverage)
  - Performance (TTI ≤ 2s, P95 ≤ 200ms)

COMPLIANCE:
  - Critical violations: 0 (blocking)
  - Overall compliance: ≥85%
  - Security compliance: 100%
  - Test coverage: ≥85%

For more information, see .agent-os/AGENT-OS-FUNDAMENTALS.md
    `);
  }

  run() {
    program.parse();
  }
}

// Run the CLI
const cli = new AgentOSCLI();
cli.run(); 