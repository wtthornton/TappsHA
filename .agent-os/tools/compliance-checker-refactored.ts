#!/usr/bin/env node

/**
 * Refactored Compliance Checker
 * Uses modular components for better maintainability and separation of concerns
 * 
 * Usage: node .agent-os/tools/compliance-checker-refactored.js [file-path]
 */

import * as fs from 'fs';
import * as path from 'path';

// Import modular components
import CodeValidator from './modules/CodeValidator';
import AnalyticsModule from './modules/AnalyticsModule';
import FileProcessor from './modules/FileProcessor';
import { Violation, ComplianceReport, Standards } from './types';
import { 
  errorHandler, 
  ConfigurationError, 
  StandardsError, 
  ERROR_CODES, 
  ERROR_SEVERITY 
} from './modules/ErrorHandler';

class ComplianceCheckerRefactored {
  private standards: Standards = {};
  private violations: Violation[] = [];
  private complianceScore: number = 100;
  private totalChecks: number = 0;
  private passedChecks: number = 0;
  
  // Initialize modular components
  private codeValidator: CodeValidator;
  private analytics: AnalyticsModule;
  private fileProcessor: FileProcessor;

  constructor() {
    try {
      // Initialize error handler
      errorHandler.initialize('./reports/error-log.json');
      
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
      
      console.log('✅ Compliance checker initialized successfully');
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'COMPLIANCE_CHECKER_INIT',
        ERROR_SEVERITY.CRITICAL
      );
      throw error;
    }
  }

  /**
   * Load standards from files
   * @returns Standards object
   */
  private loadStandards(): Standards {
    const standardsPath = path.join(__dirname, '../standards');
    const standards: Standards = {};

    try {
      if (!fs.existsSync(standardsPath)) {
        throw errorHandler.createError(
          StandardsError,
          `Standards directory not found: ${standardsPath}`,
          ERROR_CODES.STANDARDS_NOT_FOUND,
          { file: standardsPath, category: 'STANDARDS' }
        );
      }

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
        try {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            standards[file.replace('.md', '')] = content;
          } else {
            console.warn(`⚠️  Standards file not found: ${file}`);
          }
        } catch (error) {
          errorHandler.handleError(
            error as Error,
            'STANDARD_FILE_LOAD',
            ERROR_SEVERITY.MEDIUM
          );
        }
      });

      if (Object.keys(standards).length === 0) {
        throw errorHandler.createError(
          StandardsError,
          'No standards files could be loaded',
          ERROR_CODES.STANDARDS_NOT_FOUND,
          { category: 'STANDARDS' }
        );
      }

      console.log(`✅ Loaded ${Object.keys(standards).length} standards files`);
      return standards;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'STANDARDS_LOAD',
        ERROR_SEVERITY.HIGH
      );
      return {};
    }
  }

  /**
   * Validate a single file
   * @param filePath - Path to the file
   * @param content - File content
   * @returns Array of violations
   */
  validateFile(filePath: string, content: string): Violation[] {
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
      errorHandler.handleError(
        error as Error,
        'FILE_VALIDATION',
        ERROR_SEVERITY.MEDIUM
      );
      
      return [{
        file: filePath,
        line: 0,
        type: 'ERROR',
        category: 'VALIDATION_ERROR',
        message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        standard: 'GENERAL',
        severity: 'CRITICAL'
      }];
    }
  }

  /**
   * Process a single file with tracking
   * @param filePath - Path to the file
   * @returns Processing result
   */
  processFile(filePath: string): {
    filePath: string;
    violations: Violation[];
    success: boolean;
    processingTime?: number;
    error?: string;
  } {
    const startTime = Date.now();
    
    try {
      const content = this.fileProcessor.readFileContent(filePath);
      if (content === null) {
        return { 
          filePath, 
          violations: [], 
          success: false,
          error: 'Failed to read file content'
        };
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
      
      errorHandler.handleError(
        error as Error,
        'FILE_PROCESSING',
        ERROR_SEVERITY.MEDIUM
      );
      
      return {
        filePath,
        violations: [],
        success: false,
        processingTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate entire codebase
   * @param codebasePath - Path to the codebase
   * @returns Validation results
   */
  async validateCodebase(codebasePath: string = '.'): Promise<{
    violations: Violation[];
    complianceScore: number;
    totalChecks: number;
    passedChecks: number;
    processingStats: any;
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Scanning codebase: ${codebasePath}`);
      
      // Get all files to process
      const allFiles = this.fileProcessor.getAllFiles(codebasePath);
      console.log(`📁 Found ${allFiles.length} files to process`);
      
      if (allFiles.length === 0) {
        throw errorHandler.createError(
          ConfigurationError,
          'No files found to process',
          ERROR_CODES.MISSING_CONFIG,
          { category: 'VALIDATION' }
        );
      }
      
      // Process files in parallel
      const results = await this.fileProcessor.processFilesParallel(
        allFiles,
        (filePath: string, content: string) => this.validateFile(filePath, content),
        4 // max concurrency
      );
      
      // Collect all violations
      const allViolations: Violation[] = [];
      let successfulFiles = 0;
      let failedFiles = 0;
      
      results.forEach(result => {
        if (result.success && result.result) {
          allViolations.push(...result.result);
          successfulFiles++;
        } else {
          failedFiles++;
        }
      });
      
      // Calculate statistics
      const stats = this.codeValidator.getStatistics();
      const processingStats = this.fileProcessor.getProcessingStatistics(results);
      
      // Calculate compliance score
      const totalChecks = stats.totalChecks;
      const passedChecks = stats.passedChecks;
      const complianceScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;
      
      const executionTime = Date.now() - startTime;
      this.analytics.setExecutionTime(executionTime);
      
      console.log(`✅ Validation completed in ${executionTime}ms`);
      console.log(`📊 Results: ${successfulFiles} successful, ${failedFiles} failed`);
      console.log(`🎯 Compliance Score: ${complianceScore.toFixed(1)}%`);
      
      return {
        violations: allViolations,
        complianceScore,
        totalChecks,
        passedChecks,
        processingStats
      };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'CODEBASE_VALIDATION',
        ERROR_SEVERITY.HIGH
      );
      
      return {
        violations: [],
        complianceScore: 0,
        totalChecks: 0,
        passedChecks: 0,
        processingStats: { totalFiles: 0, successfulFiles: 0, failedFiles: 0 }
      };
    }
  }

  /**
   * Generate comprehensive report
   * @param validationResults - Validation results
   * @returns Compliance report
   */
  generateReport(validationResults: {
    violations: Violation[];
    complianceScore: number;
    totalChecks: number;
    passedChecks: number;
    processingStats: any;
  }): ComplianceReport {
    try {
      const { violations, complianceScore, totalChecks, passedChecks, processingStats } = validationResults;
      
      // Generate analytics report
      const analyticsReport = this.analytics.generateAnalyticsReport({
        violations,
        complianceScore,
        totalChecks,
        passedChecks
      });
      
      // Create comprehensive report
      const report: ComplianceReport = {
        summary: {
          complianceScore,
          totalFiles: processingStats.totalFiles,
          totalViolations: violations.length,
          totalChecks,
          passedChecks,
          processingTime: this.analytics.getMetrics().executionTime
        },
        violations: {
          total: violations.length,
          bySeverity: this.analyzeViolationsBySeverity(violations),
          byCategory: this.analyzeViolationsByCategory(violations),
          byStandard: this.analyzeViolationsByStandard(violations),
          list: violations
        },
        analytics: analyticsReport,
        recommendations: this.generateRecommendations(validationResults)
      };
      
      return report;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'REPORT_GENERATION',
        ERROR_SEVERITY.MEDIUM
      );
      
      // Return minimal report
      return {
        summary: {
          complianceScore: 0,
          totalFiles: 0,
          totalViolations: 0,
          totalChecks: 0,
          passedChecks: 0,
          processingTime: 0
        },
        violations: {
          total: 0,
          bySeverity: {},
          byCategory: {},
          byStandard: {},
          list: []
        },
        analytics: {
          summary: { complianceScore: 0, totalFiles: 0, totalViolations: 0, executionTime: 0, averageProcessingTime: 0 },
          violations: { byCategory: {}, bySeverity: {}, byStandard: {} },
          performance: { fileProcessing: { averageTime: 0, maxTime: 0, minTime: 0, averageSize: 0, totalFiles: 0 }, validation: {}, baselines: {} },
          trends: { message: 'Analysis failed' },
          recommendations: []
        },
        recommendations: []
      };
    }
  }

  /**
   * Analyze violations by severity
   * @param violations - Array of violations
   * @returns Violation counts by severity
   */
  private analyzeViolationsBySeverity(violations: Violation[]): Record<string, number> {
    try {
      const counts: Record<string, number> = {};
      
      violations.forEach(violation => {
        counts[violation.severity] = (counts[violation.severity] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'VIOLATION_ANALYSIS',
        ERROR_SEVERITY.LOW
      );
      return {};
    }
  }

  /**
   * Analyze violations by category
   * @param violations - Array of violations
   * @returns Violation counts by category
   */
  private analyzeViolationsByCategory(violations: Violation[]): Record<string, number> {
    try {
      const counts: Record<string, number> = {};
      
      violations.forEach(violation => {
        counts[violation.category] = (counts[violation.category] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'VIOLATION_ANALYSIS',
        ERROR_SEVERITY.LOW
      );
      return {};
    }
  }

  /**
   * Analyze violations by standard
   * @param violations - Array of violations
   * @returns Violation counts by standard
   */
  private analyzeViolationsByStandard(violations: Violation[]): Record<string, number> {
    try {
      const counts: Record<string, number> = {};
      
      violations.forEach(violation => {
        counts[violation.standard] = (counts[violation.standard] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'VIOLATION_ANALYSIS',
        ERROR_SEVERITY.LOW
      );
      return {};
    }
  }

  /**
   * Generate recommendations based on validation results
   * @param validationResults - Validation results
   * @returns Array of recommendations
   */
  private generateRecommendations(validationResults: {
    violations: Violation[];
    complianceScore: number;
    totalChecks: number;
    passedChecks: number;
    processingStats: any;
  }): any[] {
    try {
      const recommendations: any[] = [];
      const { violations, complianceScore } = validationResults;
      
      // Critical violations
      const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
      if (criticalViolations.length > 0) {
        recommendations.push({
          type: 'CRITICAL',
          category: 'SECURITY',
          message: `Address ${criticalViolations.length} critical violations immediately`,
          priority: 'HIGH'
        });
      }
      
      // Compliance score
      if (complianceScore < 80) {
        recommendations.push({
          type: 'WARNING',
          category: 'COMPLIANCE',
          message: `Compliance score (${complianceScore.toFixed(1)}%) is below target (80%)`,
          priority: 'HIGH'
        });
      }
      
      // Performance
      const avgProcessingTime = this.analytics.calculateAverageProcessingTime();
      if (avgProcessingTime > 1000) {
        recommendations.push({
          type: 'WARNING',
          category: 'PERFORMANCE',
          message: 'File processing is taking longer than expected',
          priority: 'MEDIUM'
        });
      }
      
      return recommendations;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'RECOMMENDATIONS',
        ERROR_SEVERITY.LOW
      );
      return [];
    }
  }

  /**
   * Print report to console
   * @param report - Compliance report
   */
  printReport(report: ComplianceReport): void {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📋 COMPLIANCE CHECKER REPORT');
      console.log('='.repeat(60));
      
      // Summary
      console.log(`\n📊 SUMMARY:`);
      console.log(`   Compliance Score: ${report.summary.complianceScore.toFixed(1)}%`);
      console.log(`   Total Files: ${report.summary.totalFiles}`);
      console.log(`   Total Violations: ${report.summary.totalViolations}`);
      console.log(`   Total Checks: ${report.summary.totalChecks}`);
      console.log(`   Passed Checks: ${report.summary.passedChecks}`);
      console.log(`   Processing Time: ${report.summary.processingTime}ms`);
      
      // Violations by severity
      console.log(`\n🚨 VIOLATIONS BY SEVERITY:`);
      Object.entries(report.violations.bySeverity).forEach(([severity, count]) => {
        const icon = severity === 'CRITICAL' ? '💥' : severity === 'HIGH' ? '🚨' : '⚠️';
        console.log(`   ${icon} ${severity}: ${count}`);
      });
      
      // Violations by category
      console.log(`\n📂 VIOLATIONS BY CATEGORY:`);
      Object.entries(report.violations.byCategory).forEach(([category, count]) => {
        console.log(`   📁 ${category}: ${count}`);
      });
      
      // Recommendations
      if (report.recommendations.length > 0) {
        console.log(`\n💡 RECOMMENDATIONS:`);
        report.recommendations.forEach((rec, index) => {
          const icon = rec.type === 'CRITICAL' ? '💥' : '⚠️';
          console.log(`   ${index + 1}. ${icon} ${rec.message} (${rec.priority} priority)`);
        });
      }
      
      console.log('\n' + '='.repeat(60));
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'REPORT_PRINT',
        ERROR_SEVERITY.LOW
      );
    }
  }

  /**
   * Main run method
   * @param targetPath - Target path to validate
   */
  async run(targetPath: string = '.'): Promise<void> {
    try {
      console.log('🚀 Starting compliance check...');
      
      // Validate codebase
      const validationResults = await this.validateCodebase(targetPath);
      
      // Generate report
      const report = this.generateReport(validationResults);
      
      // Print report
      this.printReport(report);
      
      // Save report to file
      this.saveReportToFile(report);
      
      // Save historical data
      this.analytics.saveHistoricalData({
        complianceScore: validationResults.complianceScore,
        totalChecks: validationResults.totalChecks,
        passedChecks: validationResults.passedChecks,
        violations: validationResults.violations
      });
      
      console.log('✅ Compliance check completed successfully');
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'COMPLIANCE_CHECK_RUN',
        ERROR_SEVERITY.CRITICAL
      );
      
      console.error('❌ Compliance check failed');
      process.exit(1);
    }
  }

  /**
   * Save report to file
   * @param report - Compliance report
   */
  private saveReportToFile(report: ComplianceReport): void {
    try {
      const reportsDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const reportPath = path.join(reportsDir, `compliance-report-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      console.log(`📄 Report saved to: ${reportPath}`);
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'REPORT_SAVE',
        ERROR_SEVERITY.MEDIUM
      );
    }
  }
}

// CLI execution
if (require.main === module) {
  const checker = new ComplianceCheckerRefactored();
  const targetPath = process.argv[2] || '.';
  
  checker.run(targetPath).catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}

export default ComplianceCheckerRefactored; 