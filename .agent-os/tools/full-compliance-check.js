#!/usr/bin/env node

/**
 * Full Compliance Check Tool
 * Comprehensive validation against all .agent-os standards
 * 
 * Usage: node .agent-os/tools/full-compliance-check.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class FullComplianceCheck {
  constructor() {
    this.standards = this.loadStandards();
    this.violations = [];
    this.complianceScore = 100;
    this.totalChecks = 0;
    this.passedChecks = 0;
    
    // Enhanced metrics collection
    this.metrics = {
      startTime: Date.now(),
      executionTime: 0,
      fileProcessingTimes: {},
      violationCategories: {},
      standardsEffectiveness: {},
      historicalData: this.loadHistoricalData(),
    };
  }

  loadStandards() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const standardsPath = path.join(__dirname, '../standards');
    const standards = {};

    // Load all standards files
    const standardFiles = [
      'tech-stack.md',
      'code-style.md',
      'best-practices.md',
      'security-compliance.md',
      'ci-cd-strategy.md',
      'testing-strategy.md',
      'enforcement.md',
    ];

    standardFiles.forEach(file => {
      const filePath = path.join(standardsPath, file);
      if (fs.existsSync(filePath)) {
        standards[file.replace('.md', '')] = fs.readFileSync(filePath, 'utf8');
      }
    });

    return standards;
  }

  loadHistoricalData() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const historyPath = path.join(__dirname, '../reports/compliance-history.json');
    try {
      if (fs.existsSync(historyPath)) {
        return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load historical data:', error.message);
    }
    return [];
  }

  saveHistoricalData() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const historyPath = path.join(__dirname, '../reports/compliance-history.json');
    
    const historyEntry = {
      timestamp: new Date().toISOString(),
      runId: this.generateRunId(),
      complianceScore: this.complianceScore,
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      violations: this.violations.length,
      criticalViolations: this.violations.filter(v => v.type === 'CRITICAL').length,
      warnings: this.violations.filter(v => v.type === 'WARNING').length,
      metrics: {
        executionTime: this.metrics.executionTime,
        filesProcessed: Object.keys(this.metrics.fileProcessingTimes).length,
      },
    };

    this.metrics.historicalData.push(historyEntry);
    
    // Keep last 30 entries
    if (this.metrics.historicalData.length > 30) {
      this.metrics.historicalData = this.metrics.historicalData.slice(-30);
    }

    const reportsDir = path.dirname(historyPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    try {
      fs.writeFileSync(historyPath, JSON.stringify(this.metrics.historicalData, null, 2));
      console.log('✅ Historical data saved successfully');
    } catch (error) {
      console.warn('⚠️  Could not save historical data:', error.message);
    }
  }

  generateRunId() {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackViolationCategory(category, type) {
    if (!this.metrics.violationCategories[category]) {
      this.metrics.violationCategories[category] = { 
        CRITICAL: 0, 
        WARNING: 0,
        INFO: 0,
        SUGGESTION: 0,
        total: 0
      };
    }
    this.metrics.violationCategories[category][type]++;
    this.metrics.violationCategories[category].total++;
  }

  trackStandardsEffectiveness(standardName, hasViolations) {
    if (!this.metrics.standardsEffectiveness[standardName]) {
      this.metrics.standardsEffectiveness[standardName] = { 
        violations: 0, 
        checks: 0,
        violationRate: 0,
        lastViolation: null,
      };
    }
    
    this.metrics.standardsEffectiveness[standardName].checks++;
    
    if (hasViolations) {
      this.metrics.standardsEffectiveness[standardName].violations++;
      this.metrics.standardsEffectiveness[standardName].lastViolation = new Date().toISOString();
    }
    
    const standard = this.metrics.standardsEffectiveness[standardName];
    standard.violationRate = (standard.violations / standard.checks) * 100;
  }

  trackFileProcessing(filePath, processingTime) {
    this.metrics.fileProcessingTimes[filePath] = {
      processingTime,
      timestamp: new Date().toISOString(),
    };
  }

  validateCode(filePath, content) {
    const startTime = Date.now();
    const violations = [];
    
    // Technology Stack Validation
    const techStackViolations = this.validateTechnologyStack(filePath, content);
    violations.push(...techStackViolations);
    this.trackStandardsEffectiveness('tech-stack', techStackViolations.length > 0);
    
    // Code Style Validation
    const codeStyleViolations = this.validateCodeStyle(filePath, content);
    violations.push(...codeStyleViolations);
    this.trackStandardsEffectiveness('code-style', codeStyleViolations.length > 0);
    
    // Security Validation
    const securityViolations = this.validateSecurity(filePath, content);
    violations.push(...securityViolations);
    this.trackStandardsEffectiveness('security-compliance', securityViolations.length > 0);
    
    // Architecture Validation
    const architectureViolations = this.validateArchitecture(filePath, content);
    violations.push(...architectureViolations);
    this.trackStandardsEffectiveness('best-practices', architectureViolations.length > 0);
    
    // Testing Validation
    const testingViolations = this.validateTesting(filePath, content);
    violations.push(...testingViolations);
    this.trackStandardsEffectiveness('testing-strategy', testingViolations.length > 0);

    // Track processing time
    const processingTime = Date.now() - startTime;
    this.trackFileProcessing(filePath, processingTime);

    // Track violation categories
    violations.forEach(violation => {
      this.trackViolationCategory(violation.category, violation.type);
      violation.timestamp = new Date().toISOString();
    });

    return violations;
  }

  validateTechnologyStack(filePath, content) {
    const violations = [];
    
    // Check for Spring Boot 3.3+ usage
    if (filePath.includes('pom.xml') || filePath.includes('build.gradle')) {
      if (!content.includes('spring-boot-starter-parent') && !content.includes('spring-boot')) {
        violations.push({
          type: 'CRITICAL',
          category: 'Technology Stack',
          message: 'Missing Spring Boot 3.3+ dependency',
          file: filePath,
          line: 1,
        });
      }
    }

    // Check for React 19 usage in frontend
    if (filePath.includes('package.json')) {
      if (content.includes('"react"') && !content.includes('"react": "^19')) {
        violations.push({
          type: 'WARNING',
          category: 'Technology Stack',
          message: 'React version should be 19.x',
          file: filePath,
          line: 1,
        });
      }
    }

    return violations;
  }

  validateCodeStyle(filePath, content) {
    const violations = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for tabs instead of spaces
      if (line.startsWith('\t')) {
        violations.push({
          type: 'WARNING',
          category: 'Code Style',
          message: 'Use spaces instead of tabs for indentation',
          file: filePath,
          line: lineNumber,
          suggestion: 'Replace tabs with 2 spaces for consistent indentation',
        });
      }
      
      // Check line length (100 chars max)
      if (line.length > 100) {
        violations.push({
          type: 'WARNING',
          category: 'Code Style',
          message: 'Line exceeds 100 character limit',
          file: filePath,
          line: lineNumber,
          suggestion: 'Split long line into multiple lines or use line continuation',
        });
      }
    });

    return violations;
  }

  validateSecurity(filePath, content) {
    const violations = [];
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /password\s*=\s*['"][^'"]+['"]/i,
      /api_key\s*=\s*['"][^'"]+['"]/i,
      /secret\s*=\s*['"][^'"]+['"]/i,
      /token\s*=\s*['"][^'"]+['"]/i,
    ];
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      secretPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          violations.push({
            type: 'CRITICAL',
            category: 'Security',
            message: 'Hardcoded secret detected - use environment variables',
            file: filePath,
            line: index + 1,
            suggestion: 'Replace hardcoded value with environment variable: ${process.env.VARIABLE_NAME}',
          });
        }
      });
    });

    return violations;
  }

  validateArchitecture(filePath, content) {
    const violations = [];
    
    // Check for proper Spring Boot annotations
    if (filePath.includes('.java')) {
      if (content.includes('@RestController') && !content.includes('@RequestMapping')) {
        violations.push({
          type: 'WARNING',
          category: 'Architecture',
          message: 'RestController should have RequestMapping annotation',
          file: filePath,
          line: 1,
          suggestion: 'Add @RequestMapping annotation to define API endpoints',
        });
      }
    }
    
    // Check for proper React component structure
    if (filePath.includes('.tsx') || filePath.includes('.jsx')) {
      if (content.includes('React.FC') && !content.includes('interface')) {
        violations.push({
          type: 'WARNING',
          category: 'Architecture',
          message: 'React component should have proper TypeScript interface',
          file: filePath,
          line: 1,
          suggestion: 'Define TypeScript interface for component props',
        });
      }
    }

    return violations;
  }

  validateTesting(filePath, content) {
    const violations = [];
    
    // Check for test files
    if (filePath.includes('Test.java') || filePath.includes('.test.') || filePath.includes('.spec.')) {
      if (!content.includes('@Test') && !content.includes('describe(') && !content.includes('it(')) {
        violations.push({
          type: 'WARNING',
          category: 'Testing',
          message: 'Test file should contain actual test methods',
          file: filePath,
          line: 1,
          suggestion: 'Add @Test annotations or test methods to validate functionality',
        });
      }
    }

    return violations;
  }

  async validateCodebase(codebasePath = '.') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    console.log('🔍 Running comprehensive compliance check...');
    
    const patterns = [
      '**/*.java',
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.xml',
      '**/*.json',
      '**/*.yml',
      '**/*.yaml',
    ];

    let totalFiles = 0;
    let totalViolations = 0;

    for (const pattern of patterns) {
      const ignorePatterns = [
        'node_modules/**', 
        'target/**', 
        'dist/**', 
        '.agent-os/**',
        'frontend/node_modules/**',
        'backend/target/**',
        '**/node_modules/**',
        '**/target/**',
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**',
        '**/.nyc_output/**'
      ];
      
      try {
        const glob = await import('glob');
        const files = glob.globSync(pattern, { cwd: codebasePath, ignore: ignorePatterns });
        
        for (const file of files) {
          const fullPath = path.join(codebasePath, file);
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const violations = this.validateCode(file, content);
            
            if (violations.length > 0) {
              this.violations.push(...violations);
              totalViolations += violations.length;
            }
            
            totalFiles++;
            this.totalChecks++;
          } catch (error) {
            console.warn(`⚠️  Could not read file: ${file}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not process pattern: ${pattern}`, error.message);
      }
    }

    // Calculate compliance based on files with violations vs total files
    const filesWithViolations = this.violations.reduce((acc, violation) => {
      if (!acc.includes(violation.file)) {
        acc.push(violation.file);
      }
      return acc;
    }, []).length;
    
    this.passedChecks = this.totalChecks - filesWithViolations;
    this.complianceScore = Math.max(0, Math.round((this.passedChecks / this.totalChecks) * 100));

    // Calculate execution time
    this.metrics.executionTime = Date.now() - this.metrics.startTime;

    // Save historical data
    this.saveHistoricalData();

    return {
      totalFiles,
      totalViolations,
      complianceScore: this.complianceScore,
      violations: this.violations,
      metrics: this.metrics,
    };
  }

  generateReport() {
    return {
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      violations: this.violations,
      complianceScore: this.complianceScore,
      metrics: this.metrics,
    };
  }

  async run() {
    console.log('🔍 Starting Full Compliance Check...\n');
    
    try {
      // Run comprehensive compliance check
      await this.validateCodebase('.');
      
      // Generate detailed report
      const report = this.generateReport();
      
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
      this.results = {
        overall: {
          score: 0,
          status: 'error',
          criticalViolations: 0,
          warnings: 0,
          passed: 0,
          total: 0
        },
        categories: {
          technologyStack: { score: 0, violations: [], status: 'error' },
          codeStyle: { score: 0, violations: [], status: 'error' },
          security: { score: 0, violations: [], status: 'error' },
          architecture: { score: 0, violations: [], status: 'error' },
          testing: { score: 0, violations: [], status: 'error' },
          performance: { score: 0, violations: [], status: 'error' }
        },
        recommendations: [],
        timestamp: new Date().toISOString()
      };
      return this.results;
    }
  }

  parseResults(report) {
    this.results = {
      overall: {
        score: report.complianceScore || 0,
        status: 'unknown',
        criticalViolations: 0,
        warnings: 0,
        passed: report.passedChecks || 0,
        total: report.totalChecks || 0
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
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new FullComplianceCheck();
  checker.run().catch(error => {
    console.error('❌ Full compliance check failed:', error);
    process.exit(1);
  });
}

export default FullComplianceCheck; 