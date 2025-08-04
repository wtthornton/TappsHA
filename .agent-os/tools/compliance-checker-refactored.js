#!/usr/bin/env node

/**
 * Refactored Compliance Checker
 * Uses modular components for better maintainability and separation of concerns
 * 
 * Usage: node .agent-os/tools/compliance-checker-refactored.js [file-path]
 */

const fs = require('fs');
const path = require('path');

// Import modular components
const CodeValidator = require('./modules/CodeValidator');
const AnalyticsModule = require('./modules/AnalyticsModule');
const FileProcessor = require('./modules/FileProcessor');

class ComplianceCheckerRefactored {
  constructor() {
    this.standards = this.loadStandards();
    this.violations = [];
    this.complianceScore = 100;
    this.totalChecks = 0;
    this.passedChecks = 0;
    
    // Initialize modular components
    this.codeValidator = new CodeValidator();
    this.analytics = new AnalyticsModule();
    this.fileProcessor = new FileProcessor();
    
    // Set standards for validator
    this.codeValidator.setStandards(this.standards);
  }

  /**
   * Load standards from files
   * @returns {Object} Standards object
   */
  loadStandards() {
    const standardsPath = path.join(__dirname, '../standards');
    const standards = {};

    const standardFiles = [
      'tech-stack.md',
      'code-style.md',
      'best-practices.md',
      'security-compliance.md',
      'ci-cd-strategy.md',
      'testing-strategy.md',
      'enforcement.md'
    ];

    standardFiles.forEach(file => {
      const filePath = path.join(standardsPath, file);
      if (fs.existsSync(filePath)) {
        standards[file.replace('.md', '')] = fs.readFileSync(filePath, 'utf8');
      }
    });

    return standards;
  }

  /**
   * Validate a single file
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   * @returns {Array} Array of violations
   */
  validateFile(filePath, content) {
    const startTime = Date.now();
    
    try {
      // Use the code validator module
      const violations = this.codeValidator.validateCode(filePath, content);
      
      // Track validation execution time
      const executionTime = Date.now() - startTime;
      this.analytics.trackValidationExecution('codeValidation', executionTime);
      
      // Track violations by category
      violations.forEach(violation => {
        this.analytics.trackViolationCategory(violation.category, violation.type);
        this.analytics.trackStandardsEffectiveness(violation.standard, true);
      });
      
      return violations;
    } catch (error) {
      console.warn(`⚠️  Error validating file ${filePath}:`, error.message);
      return [{
        file: filePath,
        line: 0,
        type: 'ERROR',
        category: 'VALIDATION_ERROR',
        message: `Validation error: ${error.message}`,
        standard: 'GENERAL',
        severity: 'CRITICAL'
      }];
    }
  }

  /**
   * Process a single file with tracking
   * @param {string} filePath - Path to the file
   * @returns {Object} Processing result
   */
  processFile(filePath) {
    const startTime = Date.now();
    
    try {
      const content = this.fileProcessor.readFileContent(filePath);
      if (content === null) {
        return { filePath, violations: [], success: false };
      }
      
      const violations = this.validateFile(filePath, content);
      const processingTime = Date.now() - startTime;
      
      // Track file processing time
      this.analytics.trackFileProcessing(filePath, processingTime);
      
      return {
        filePath,
        violations,
        success: true,
        processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.warn(`⚠️  Error processing file ${filePath}:`, error.message);
      
      return {
        filePath,
        violations: [],
        success: false,
        processingTime,
        error: error.message
      };
    }
  }

  /**
   * Validate entire codebase
   * @param {string} codebasePath - Path to the codebase
   * @returns {Object} Validation results
   */
  async validateCodebase(codebasePath = '.') {
    console.log('🔍 Discovering files...');
    const allFiles = this.fileProcessor.getAllFiles(codebasePath);
    console.log(`📁 Found ${allFiles.length} files to process`);
    
    if (allFiles.length === 0) {
      console.log('⚠️  No files found to validate');
      return {
        violations: [],
        complianceScore: 100,
        totalChecks: 0,
        passedChecks: 0,
        filesProcessed: 0
      };
    }
    
    console.log('⚡ Processing files...');
    const startTime = Date.now();
    
    // Process files using the file processor module
    const results = await this.fileProcessor.processFilesParallel(
      allFiles,
      (filePath, content) => this.validateFile(filePath, content),
      4 // max concurrency
    );
    
    const totalTime = Date.now() - startTime;
    this.analytics.setExecutionTime(totalTime);
    
    // Aggregate results
    const allViolations = [];
    let totalChecks = 0;
    let passedChecks = 0;
    
    results.forEach(result => {
      if (result.success && result.result) {
        allViolations.push(...result.result);
        
        // Get statistics from code validator
        const stats = this.codeValidator.getStatistics();
        totalChecks += stats.totalChecks;
        passedChecks += stats.passedChecks;
      }
    });
    
    // Calculate compliance score
    this.totalChecks = totalChecks;
    this.passedChecks = passedChecks;
    this.violations = allViolations;
    this.complianceScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;
    
    // Save historical data
    this.analytics.saveHistoricalData({
      complianceScore: this.complianceScore,
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      violations: this.violations
    });
    
    return {
      violations: this.violations,
      complianceScore: this.complianceScore,
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      filesProcessed: results.length,
      processingTime: totalTime
    };
  }

  /**
   * Generate comprehensive report
   * @param {Object} validationResults - Validation results
   * @returns {Object} Comprehensive report
   */
  generateReport(validationResults) {
    const analyticsReport = this.analytics.generateAnalyticsReport(validationResults);
    
    const report = {
      summary: {
        complianceScore: validationResults.complianceScore,
        totalFiles: validationResults.filesProcessed,
        totalViolations: validationResults.violations.length,
        totalChecks: validationResults.totalChecks,
        passedChecks: validationResults.passedChecks,
        processingTime: validationResults.processingTime
      },
      violations: {
        total: validationResults.violations.length,
        bySeverity: this.analyzeViolationsBySeverity(validationResults.violations),
        byCategory: this.analyzeViolationsByCategory(validationResults.violations),
        byStandard: this.analyzeViolationsByStandard(validationResults.violations),
        list: validationResults.violations
      },
      analytics: analyticsReport,
      recommendations: this.generateRecommendations(validationResults)
    };
    
    return report;
  }

  /**
   * Analyze violations by severity
   * @param {Array} violations - Violations array
   * @returns {Object} Severity analysis
   */
  analyzeViolationsBySeverity(violations) {
    const analysis = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    violations.forEach(violation => {
      analysis[violation.severity] = (analysis[violation.severity] || 0) + 1;
    });
    return analysis;
  }

  /**
   * Analyze violations by category
   * @param {Array} violations - Violations array
   * @returns {Object} Category analysis
   */
  analyzeViolationsByCategory(violations) {
    const analysis = {};
    violations.forEach(violation => {
      const category = violation.category || 'UNKNOWN';
      analysis[category] = (analysis[category] || 0) + 1;
    });
    return analysis;
  }

  /**
   * Analyze violations by standard
   * @param {Array} violations - Violations array
   * @returns {Object} Standard analysis
   */
  analyzeViolationsByStandard(violations) {
    const analysis = {};
    violations.forEach(violation => {
      const standard = violation.standard || 'UNKNOWN';
      analysis[standard] = (analysis[standard] || 0) + 1;
    });
    return analysis;
  }

  /**
   * Generate recommendations
   * @param {Object} validationResults - Validation results
   * @returns {Array} Recommendations array
   */
  generateRecommendations(validationResults) {
    const recommendations = [];
    
    // Compliance score recommendations
    if (validationResults.complianceScore < 80) {
      recommendations.push({
        type: 'CRITICAL',
        category: 'COMPLIANCE',
        message: 'Compliance score is below 80%. Focus on addressing critical violations first.',
        priority: 'HIGH'
      });
    }
    
    // Performance recommendations
    if (validationResults.processingTime > 10000) {
      recommendations.push({
        type: 'WARNING',
        category: 'PERFORMANCE',
        message: 'Processing time is high. Consider optimizing validation algorithms.',
        priority: 'MEDIUM'
      });
    }
    
    // Violation-based recommendations
    const criticalViolations = validationResults.violations.filter(v => v.severity === 'CRITICAL');
    if (criticalViolations.length > 0) {
      recommendations.push({
        type: 'CRITICAL',
        category: 'SECURITY',
        message: `${criticalViolations.length} critical violations found. Address these immediately.`,
        priority: 'HIGH'
      });
    }
    
    return recommendations;
  }

  /**
   * Print report to console
   * @param {Object} report - Report object
   */
  printReport(report) {
    console.log('\n📊 COMPLIANCE CHECK REPORT');
    console.log('=' .repeat(50));
    
    // Summary
    console.log(`\n📈 Summary:`);
    console.log(`  Compliance Score: ${report.summary.complianceScore.toFixed(1)}%`);
    console.log(`  Files Processed: ${report.summary.totalFiles}`);
    console.log(`  Total Violations: ${report.summary.totalViolations}`);
    console.log(`  Processing Time: ${(report.summary.processingTime / 1000).toFixed(2)}s`);
    
    // Violations by severity
    console.log(`\n🚨 Violations by Severity:`);
    Object.entries(report.violations.bySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        console.log(`  ${severity}: ${count}`);
      }
    });
    
    // Violations by category
    console.log(`\n📂 Violations by Category:`);
    Object.entries(report.violations.byCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${category}: ${count}`);
      }
    });
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.type}] ${rec.message}`);
      });
    }
    
    console.log('\n' + '=' .repeat(50));
  }

  /**
   * Main execution method
   * @param {string} targetPath - Target path to validate
   */
  async run(targetPath = '.') {
    console.log('🚀 Starting compliance check...');
    console.log(`📁 Target: ${targetPath}`);
    
    try {
      const validationResults = await this.validateCodebase(targetPath);
      const report = this.generateReport(validationResults);
      
      this.printReport(report);
      
      // Save report to file
      this.saveReportToFile(report);
      
      return report;
    } catch (error) {
      console.error('❌ Error during compliance check:', error.message);
      throw error;
    }
  }

  /**
   * Save report to file
   * @param {Object} report - Report object
   */
  saveReportToFile(report) {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `compliance-report-${timestamp}.json`);
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`💾 Report saved to: ${reportPath}`);
    } catch (error) {
      console.warn('⚠️  Could not save report to file:', error.message);
    }
  }
}

// CLI execution
if (require.main === module) {
  const checker = new ComplianceCheckerRefactored();
  const targetPath = process.argv[2] || '.';
  
  checker.run(targetPath)
    .then(() => {
      console.log('✅ Compliance check completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Compliance check failed:', error.message);
      process.exit(1);
    });
}

module.exports = ComplianceCheckerRefactored; 