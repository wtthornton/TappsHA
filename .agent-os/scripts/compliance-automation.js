#!/usr/bin/env node

/**
 * Agent OS Compliance Automation Script
 * 
 * This script automatically runs compliance checks after task completion
 * and integrates with the task tracking system.
 * 
 * Usage:
 *   node compliance-automation.js --task-complete
 *   node compliance-automation.js --check-only
 *   node compliance-automation.js --update-task-file
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComplianceAutomation {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.toolsDir = path.join(this.projectRoot, '.agent-os/tools');
    this.reportsDir = path.join(this.projectRoot, '.agent-os/reports');
    this.tasksFile = path.join(this.projectRoot, 'tasks.md');
  }

  /**
   * Run compliance check and return results
   */
  async runComplianceCheck() {
    try {
      console.log('🔍 Running compliance check...');
      
      // Change to tools directory
      process.chdir(this.toolsDir);
      
      // Run compliance checker
      const output = execSync('node compliance-checker.js --detailed', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Compliance check completed');
      return this.parseComplianceOutput(output);
    } catch (error) {
      console.error('❌ Compliance check failed:', error.message);
      return {
        success: false,
        error: error.message,
        score: 0,
        violations: []
      };
    }
  }

  /**
   * Parse compliance checker output
   */
  parseComplianceOutput(output) {
    try {
      // Extract compliance score
      const scoreMatch = output.match(/Compliance Score:\s*(\d+)%/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      
      // Extract violations
      const violations = [];
      const violationLines = output.split('\n').filter(line => 
        line.includes('VIOLATION') || line.includes('violation')
      );
      
      violationLines.forEach(line => {
        const match = line.match(/([^:]+):\s*(.+)/);
        if (match) {
          violations.push({
            file: match[1].trim(),
            description: match[2].trim()
          });
        }
      });
      
      return {
        success: true,
        score,
        violations,
        output,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to parse compliance output:', error.message);
      return {
        success: false,
        error: 'Failed to parse compliance output',
        score: 0,
        violations: []
      };
    }
  }

  /**
   * Update task file with compliance results
   */
  async updateTaskFile(complianceResults) {
    try {
      if (!fs.existsSync(this.tasksFile)) {
        console.log('⚠️ No tasks.md file found, skipping task update');
        return;
      }

      let taskContent = fs.readFileSync(this.tasksFile, 'utf8');
      
      // Find the last completed task and add compliance info
      const lines = taskContent.split('\n');
      let updated = false;
      
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('[x]') && !lines[i].includes('Compliance Check')) {
          // Add compliance check info after the completed task
          const complianceLine = `  - **Compliance Check**: ${complianceResults.success ? '✅' : '❌'} Score ${complianceResults.score}% - ${complianceResults.violations.length > 0 ? `${complianceResults.violations.length} violations detected` : 'No violations detected'}`;
          lines.splice(i + 1, 0, complianceLine);
          updated = true;
          break;
        }
      }
      
      if (updated) {
        fs.writeFileSync(this.tasksFile, lines.join('\n'));
        console.log('✅ Task file updated with compliance results');
      } else {
        console.log('⚠️ No completed tasks found to update');
      }
    } catch (error) {
      console.error('❌ Failed to update task file:', error.message);
    }
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      compliance: {
        score: results.score,
        status: results.score >= 85 ? 'Compliant' : 'Non-Compliant',
        target: 85,
        violations: results.violations.length
      },
      details: {
        success: results.success,
        violations: results.violations,
        output: results.output
      }
    };
    
    // Save report
    const reportFile = path.join(this.reportsDir, `compliance-automation-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📊 Compliance report saved: ${reportFile}`);
    return report;
  }

  /**
   * Main automation workflow
   */
  async runAutomation() {
    console.log('🚀 Starting Agent OS Compliance Automation...');
    
    // Run compliance check
    const results = await this.runComplianceCheck();
    
    // Generate report
    const report = this.generateComplianceReport(results);
    
    // Update task file
    await this.updateTaskFile(results);
    
    // Display results
    console.log('\n📊 Compliance Results:');
    console.log(`   Score: ${results.score}% (Target: ≥85%)`);
    console.log(`   Status: ${results.score >= 85 ? '✅ Compliant' : '❌ Non-Compliant'}`);
    console.log(`   Violations: ${results.violations.length}`);
    
    if (results.violations.length > 0) {
      console.log('\n⚠️ Violations Detected:');
      results.violations.forEach((violation, index) => {
        console.log(`   ${index + 1}. ${violation.file}: ${violation.description}`);
      });
    }
    
    // Return appropriate exit code
    process.exit(results.score >= 85 ? 0 : 1);
  }

  /**
   * Check only mode
   */
  async checkOnly() {
    console.log('🔍 Running compliance check only...');
    const results = await this.runComplianceCheck();
    
    console.log('\n📊 Compliance Results:');
    console.log(`   Score: ${results.score}%`);
    console.log(`   Violations: ${results.violations.length}`);
    
    if (results.violations.length > 0) {
      console.log('\n⚠️ Violations:');
      results.violations.forEach((violation, index) => {
        console.log(`   ${index + 1}. ${violation.file}: ${violation.description}`);
      });
    }
    
    process.exit(results.score >= 85 ? 0 : 1);
  }
}

// CLI execution
const automation = new ComplianceAutomation();

if (process.argv.includes('--check-only')) {
  automation.checkOnly();
} else if (process.argv.includes('--task-complete')) {
  automation.runAutomation();
} else {
  console.log('Agent OS Compliance Automation');
  console.log('');
  console.log('Usage:');
  console.log('  node compliance-automation.js --task-complete  # Run after task completion');
  console.log('  node compliance-automation.js --check-only     # Run compliance check only');
  console.log('');
  console.log('This script automatically:');
  console.log('  - Runs compliance checker with --detailed flag');
  console.log('  - Updates tasks.md with compliance results');
  console.log('  - Generates compliance reports');
  console.log('  - Ensures ≥85% compliance score');
} 