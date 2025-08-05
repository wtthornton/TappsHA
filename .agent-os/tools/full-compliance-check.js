#!/usr/bin/env node

/**
 * Full Compliance Check Tool
 * Comprehensive validation against all .agent-os standards
 * 
 * Usage: node .agent-os/tools/full-compliance-check.js
 */

const fs = require('fs');
const path = require('path');
const ComplianceChecker = require('./compliance-checker');

class FullComplianceCheck {
  constructor() {
    this.checker = new ComplianceChecker();
    this.results = {
      overall: {
        score: 0,
        status: 'unknown',
        criticalViolations: 0,
        warnings: 0,
        passed: 0,
        total: 0
      },
      categories: {
        technologyStack: { score: 0, violations: [], status: 'unknown' },
        codeStyle: { score: 0, violations: [], status: 'unknown' },
        security: { score: 0, violations: [], status: 'unknown' },
        architecture: { score: 0, violations: [], status: 'unknown' },
        testing: { score: 0, violations: [], status: 'unknown' },
        performance: { score: 0, violations: [], status: 'unknown' }
      },
      recommendations: [],
      timestamp: new Date().toISOString()
    };
  }

  async run() {
    console.log('🔍 Starting Full Compliance Check...\n');
    
    try {
      // Run comprehensive compliance check
      await this.checker.validateCodebase('.');
      
      // Generate detailed report
      const report = this.checker.generateReport();
      
      // Parse and structure results
      this.parseResults(report);
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Display results
      this.displayResults();
      
      // Save results
      this.saveResults();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Compliance check failed:', error.message);
      this.results.overall.status = 'error';
      this.results.overall.score = 0;
      return this.results;
    }
  }

  parseResults(report) {
    // Parse the compliance checker results
    if (report && report.violations) {
      this.results.overall.total = report.totalChecks || 0;
      this.results.overall.passed = report.passedChecks || 0;
      this.results.overall.criticalViolations = report.violations.filter(v => v.type === 'CRITICAL').length;
      this.results.overall.warnings = report.violations.filter(v => v.type === 'WARNING').length;
      
      // Calculate overall score
      if (this.results.overall.total > 0) {
        this.results.overall.score = Math.round((this.results.overall.passed / this.results.overall.total) * 100);
      }
      
      // Determine overall status
      if (this.results.overall.criticalViolations > 0) {
        this.results.overall.status = 'critical';
      } else if (this.results.overall.score >= 85) {
        this.results.overall.status = 'pass';
      } else if (this.results.overall.score >= 70) {
        this.results.overall.status = 'warning';
      } else {
        this.results.overall.status = 'fail';
      }
      
      // Categorize violations
      this.categorizeViolations(report.violations);
    }
  }

  categorizeViolations(violations) {
    violations.forEach(violation => {
      const category = this.determineCategory(violation);
      if (category && this.results.categories[category]) {
        this.results.categories[category].violations.push(violation);
      }
    });
    
    // Calculate category scores
    Object.keys(this.results.categories).forEach(category => {
      const cat = this.results.categories[category];
      const totalChecks = cat.violations.length + (this.results.overall.passed / 6); // Rough estimate
      if (totalChecks > 0) {
        cat.score = Math.round(((totalChecks - cat.violations.length) / totalChecks) * 100);
      }
      
      // Determine category status
      const criticalViolations = cat.violations.filter(v => v.type === 'CRITICAL').length;
      if (criticalViolations > 0) {
        cat.status = 'critical';
      } else if (cat.score >= 85) {
        cat.status = 'pass';
      } else if (cat.score >= 70) {
        cat.status = 'warning';
      } else {
        cat.status = 'fail';
      }
    });
  }

  determineCategory(violation) {
    const message = violation.message.toLowerCase();
    const file = violation.file ? violation.file.toLowerCase() : '';
    
    // Technology Stack violations
    if (message.includes('spring boot') || message.includes('react') || 
        message.includes('typescript') || message.includes('postgresql') ||
        message.includes('docker') || message.includes('kafka')) {
      return 'technologyStack';
    }
    
    // Code Style violations
    if (message.includes('naming') || message.includes('formatting') ||
        message.includes('indentation') || message.includes('convention')) {
      return 'codeStyle';
    }
    
    // Security violations
    if (message.includes('security') || message.includes('vulnerability') ||
        message.includes('authentication') || message.includes('authorization') ||
        message.includes('encryption') || message.includes('owasp')) {
      return 'security';
    }
    
    // Architecture violations
    if (message.includes('architecture') || message.includes('pattern') ||
        message.includes('controller') || message.includes('service') ||
        message.includes('repository') || message.includes('layered')) {
      return 'architecture';
    }
    
    // Testing violations
    if (message.includes('test') || message.includes('coverage') ||
        message.includes('unit') || message.includes('integration')) {
      return 'testing';
    }
    
    // Performance violations
    if (message.includes('performance') || message.includes('slow') ||
        message.includes('optimization') || message.includes('memory') ||
        message.includes('cpu')) {
      return 'performance';
    }
    
    return 'codeStyle'; // Default category
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Overall score recommendations
    if (this.results.overall.score < 85) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        message: `Overall compliance score is ${this.results.overall.score}% - target is 85%`,
        action: 'Review and fix violations to improve compliance score'
      });
    }
    
    // Critical violations
    if (this.results.overall.criticalViolations > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'critical',
        message: `${this.results.overall.criticalViolations} critical violations detected`,
        action: 'Fix critical violations immediately - they block development'
      });
    }
    
    // Category-specific recommendations
    Object.entries(this.results.categories).forEach(([category, data]) => {
      if (data.status === 'critical') {
        recommendations.push({
          priority: 'critical',
          category,
          message: `${category} has critical violations`,
          action: `Fix critical ${category} violations immediately`
        });
      } else if (data.status === 'fail') {
        recommendations.push({
          priority: 'high',
          category,
          message: `${category} compliance is failing (${data.score}%)`,
          action: `Improve ${category} compliance to reach 85% target`
        });
      } else if (data.status === 'warning') {
        recommendations.push({
          priority: 'medium',
          category,
          message: `${category} compliance needs improvement (${data.score}%)`,
          action: `Address ${category} violations to reach 85% target`
        });
      }
    });
    
    this.results.recommendations = recommendations;
  }

  displayResults() {
    console.log('\n📊 Full Compliance Check Results\n');
    console.log('=' .repeat(50));
    
    // Overall status
    const statusEmoji = {
      'pass': '✅',
      'warning': '⚠️',
      'fail': '❌',
      'critical': '🚨',
      'error': '💥'
    };
    
    console.log(`${statusEmoji[this.results.overall.status]} Overall Status: ${this.results.overall.status.toUpperCase()}`);
    console.log(`📈 Compliance Score: ${this.results.overall.score}%`);
    console.log(`🔍 Total Checks: ${this.results.overall.total}`);
    console.log(`✅ Passed: ${this.results.overall.passed}`);
    console.log(`🚨 Critical Violations: ${this.results.overall.criticalViolations}`);
    console.log(`⚠️  Warnings: ${this.results.overall.warnings}`);
    
    console.log('\n📋 Category Breakdown:');
    console.log('-'.repeat(30));
    
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const emoji = statusEmoji[data.status] || '❓';
      console.log(`${emoji} ${category}: ${data.score}% (${data.violations.length} violations)`);
    });
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      console.log('-'.repeat(30));
      
      this.results.recommendations.forEach((rec, index) => {
        const priorityEmoji = {
          'critical': '🚨',
          'high': '🔴',
          'medium': '🟡',
          'low': '🟢'
        };
        
        console.log(`${index + 1}. ${priorityEmoji[rec.priority]} ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Final verdict
    if (this.results.overall.status === 'pass') {
      console.log('🎉 Compliance check PASSED! Your project meets standards.');
    } else if (this.results.overall.status === 'critical') {
      console.log('🚨 CRITICAL: Fix violations immediately before continuing development.');
    } else {
      console.log('⚠️  Compliance check needs attention. Review recommendations above.');
    }
  }

  saveResults() {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `compliance-report-${timestamp}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the compliance check if this file is executed directly
if (require.main === module) {
  const checker = new FullComplianceCheck();
  checker.run().catch(error => {
    console.error('❌ Full compliance check failed:', error);
    process.exit(1);
  });
}

module.exports = FullComplianceCheck; 