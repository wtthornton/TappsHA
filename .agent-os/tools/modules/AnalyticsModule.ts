/**
 * Analytics Module
 * Handles all analytics, reporting, and statistical analysis functionality
 * 
 * @module AnalyticsModule
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  Metrics, 
  HistoricalEntry, 
  PerformanceBaselines, 
  AnalyticsReport,
  Recommendation,
  ComplianceReport
} from '../types';
import { 
  errorHandler, 
  AnalyticsError, 
  ERROR_CODES, 
  ERROR_SEVERITY 
} from './ErrorHandler';

class AnalyticsModule {
  private metrics: Metrics;
  private statisticalAnalysis: any; // Will be properly typed when statistical-analysis is converted

  constructor() {
    this.metrics = {
      startTime: Date.now(),
      executionTime: 0,
      fileProcessingTimes: {},
      validationExecutionTimes: {},
      violationCategories: {},
      standardsEffectiveness: {},
      historicalData: this.loadHistoricalData(),
      performanceBaselines: this.loadPerformanceBaselines()
    };
    
    // Initialize statistical analysis (will be properly imported when converted)
    try {
      // this.statisticalAnalysis = new StatisticalAnalysis();
      // this.statisticalAnalysis.loadHistoricalData();
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'ANALYTICS_INIT',
        ERROR_SEVERITY.MEDIUM
      );
    }
  }

  /**
   * Load historical data for trend analysis
   * @returns Historical data array
   */
  loadHistoricalData(): HistoricalEntry[] {
    const historyPath = path.join(__dirname, '../../reports/compliance-history.json');
    
    try {
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf8');
        const parsedData = JSON.parse(data);
        
        // Validate data structure
        if (!Array.isArray(parsedData)) {
          throw errorHandler.createError(
            AnalyticsError,
            'Historical data is not an array',
            ERROR_CODES.DATA_CORRUPTION,
            { file: historyPath, category: 'ANALYTICS' }
          );
        }
        
        // Validate each entry
        const validatedData = parsedData.filter(entry => this.validateHistoryEntry(entry));
        
        if (validatedData.length !== parsedData.length) {
          console.warn(`⚠️  ${parsedData.length - validatedData.length} invalid entries removed from historical data`);
        }
        
        return validatedData;
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'HISTORICAL_DATA_LOAD',
        ERROR_SEVERITY.MEDIUM
      );
    }
    
    return [];
  }

  /**
   * Save historical data for trend analysis
   * @param complianceData - Current compliance data to save
   */
  saveHistoricalData(complianceData: {
    complianceScore: number;
    totalChecks: number;
    passedChecks: number;
    violations: any[];
  }): void {
    const historyPath = path.join(__dirname, '../../reports/compliance-history.json');
    
    try {
      const historyEntry: HistoricalEntry = {
        timestamp: new Date().toISOString(),
        runId: this.generateRunId(),
        complianceScore: complianceData.complianceScore,
        totalChecks: complianceData.totalChecks,
        passedChecks: complianceData.passedChecks,
        violations: complianceData.violations.length,
        criticalViolations: complianceData.violations.filter((v: any) => v.type === 'CRITICAL').length,
        warnings: complianceData.violations.filter((v: any) => v.type === 'WARNING').length,
        metrics: {
          executionTime: this.metrics.executionTime,
          averageFileProcessingTime: this.calculateAverageProcessingTime(),
          violationCategories: this.metrics.violationCategories,
          standardsEffectiveness: this.metrics.standardsEffectiveness,
          filesProcessed: Object.keys(this.metrics.fileProcessingTimes).length
        },
        dataIntegrity: {
          checksum: this.generateDataChecksum(complianceData),
          version: '1.0',
          validated: true
        }
      };

      if (!this.validateHistoryEntry(historyEntry)) {
        throw errorHandler.createError(
          AnalyticsError,
          'Data integrity check failed',
          ERROR_CODES.DATA_CORRUPTION,
          { category: 'ANALYTICS' }
        );
      }

      this.metrics.historicalData.push(historyEntry);
      
      // Keep last 30 entries
      if (this.metrics.historicalData.length > 30) {
        this.metrics.historicalData = this.metrics.historicalData.slice(-30);
      }

      const reportsDir = path.dirname(historyPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Use atomic write to prevent corruption
      const tempPath = historyPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.metrics.historicalData, null, 2));
      fs.renameSync(tempPath, historyPath);
      
      console.log('✅ Historical data saved successfully');
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'HISTORICAL_DATA_SAVE',
        ERROR_SEVERITY.MEDIUM
      );
    }
  }

  /**
   * Generate unique run ID
   * @returns Run ID string
   */
  private generateRunId(): string {
    try {
      return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'RUN_ID_GENERATION',
        ERROR_SEVERITY.LOW
      );
      return `run_${Date.now()}`;
    }
  }

  /**
   * Generate data checksum for integrity validation
   * @param complianceData - Compliance data to checksum
   * @returns Checksum string
   */
  private generateDataChecksum(complianceData: any): string {
    try {
      const dataString = JSON.stringify(complianceData);
      let checksum = 0;
      
      for (let i = 0; i < dataString.length; i++) {
        checksum = ((checksum << 5) - checksum + dataString.charCodeAt(i)) & 0xffffffff;
      }
      
      return checksum.toString(16);
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'CHECKSUM_GENERATION',
        ERROR_SEVERITY.LOW
      );
      return '0';
    }
  }

  /**
   * Validate history entry data integrity
   * @param entry - History entry to validate
   * @returns True if valid
   */
  private validateHistoryEntry(entry: any): boolean {
    try {
      const requiredFields = [
        'timestamp', 'runId', 'complianceScore', 'totalChecks', 
        'passedChecks', 'violations', 'criticalViolations', 'warnings'
      ];
      
      for (const field of requiredFields) {
        if (!entry.hasOwnProperty(field)) {
          console.warn(`⚠️  Missing required field: ${field}`);
          return false;
        }
      }
      
      // Validate compliance score
      if (typeof entry.complianceScore !== 'number' || 
          entry.complianceScore < 0 || entry.complianceScore > 100) {
        console.warn(`⚠️  Invalid compliance score: ${entry.complianceScore}`);
        return false;
      }
      
      // Validate check counts
      if (typeof entry.totalChecks !== 'number' || entry.totalChecks < 0) {
        console.warn(`⚠️  Invalid total checks: ${entry.totalChecks}`);
        return false;
      }
      
      if (typeof entry.passedChecks !== 'number' || entry.passedChecks < 0) {
        console.warn(`⚠️  Invalid passed checks: ${entry.passedChecks}`);
        return false;
      }
      
      // Validate timestamp format
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.timestamp)) {
        console.warn(`⚠️  Invalid timestamp format: ${entry.timestamp}`);
        return false;
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'HISTORY_VALIDATION',
        ERROR_SEVERITY.LOW
      );
      return false;
    }
  }

  /**
   * Load performance baselines
   * @returns Performance baselines object
   */
  loadPerformanceBaselines(): PerformanceBaselines {
    const baselinesPath = path.join(__dirname, '../../reports/performance-baselines.json');
    
    try {
      if (fs.existsSync(baselinesPath)) {
        const data = fs.readFileSync(baselinesPath, 'utf8');
        const baselines = JSON.parse(data);
        
        // Validate baselines structure
        if (!baselines || typeof baselines !== 'object') {
          throw errorHandler.createError(
            AnalyticsError,
            'Invalid baselines structure',
            ERROR_CODES.BASELINE_ERROR,
            { file: baselinesPath, category: 'ANALYTICS' }
          );
        }
        
        return baselines;
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'BASELINES_LOAD',
        ERROR_SEVERITY.MEDIUM
      );
    }
    
    return this.createDefaultBaselines();
  }

  /**
   * Create default performance baselines
   * @returns Default baselines object
   */
  private createDefaultBaselines(): PerformanceBaselines {
    try {
      return {
        fileProcessing: {
          small: { avg: 50, max: 100, min: 10 },
          medium: { avg: 200, max: 500, min: 100 },
          large: { avg: 1000, max: 2000, min: 500 }
        },
        validation: {
          codeStyle: { avg: 10, max: 50, min: 5 },
          security: { avg: 20, max: 100, min: 10 },
          architecture: { avg: 15, max: 75, min: 5 },
          testing: { avg: 25, max: 125, min: 10 }
        },
        overall: {
          executionTime: { avg: 5000, max: 15000, min: 1000 },
          memoryUsage: { avg: 50, max: 200, min: 10 }
        }
      };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'DEFAULT_BASELINES',
        ERROR_SEVERITY.MEDIUM
      );
      
      // Return minimal baselines
      return {
        fileProcessing: { small: { avg: 0, max: 0, min: 0 }, medium: { avg: 0, max: 0, min: 0 }, large: { avg: 0, max: 0, min: 0 } },
        validation: { codeStyle: { avg: 0, max: 0, min: 0 }, security: { avg: 0, max: 0, min: 0 }, architecture: { avg: 0, max: 0, min: 0 }, testing: { avg: 0, max: 0, min: 0 } },
        overall: { executionTime: { avg: 0, max: 0, min: 0 }, memoryUsage: { avg: 0, max: 0, min: 0 } }
      };
    }
  }

  /**
   * Save performance baselines
   */
  savePerformanceBaselines(): void {
    const baselinesPath = path.join(__dirname, '../../reports/performance-baselines.json');
    
    try {
      const reportsDir = path.dirname(baselinesPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Use atomic write
      const tempPath = baselinesPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.metrics.performanceBaselines, null, 2));
      fs.renameSync(tempPath, baselinesPath);
      
      console.log('✅ Performance baselines saved successfully');
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'BASELINES_SAVE',
        ERROR_SEVERITY.MEDIUM
      );
    }
  }

  /**
   * Track file processing time
   * @param filePath - Path to the file
   * @param processingTime - Processing time in milliseconds
   */
  trackFileProcessing(filePath: string, processingTime: number): void {
    try {
      if (processingTime < 0) {
        throw errorHandler.createError(
          AnalyticsError,
          `Invalid processing time: ${processingTime}`,
          ERROR_CODES.INVALID_METRICS,
          { file: filePath, category: 'ANALYTICS' }
        );
      }
      
      this.metrics.fileProcessingTimes[filePath] = {
        time: processingTime,
        size: this.getFileSize(filePath),
        timestamp: Date.now()
      };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'FILE_PROCESSING_TRACK',
        ERROR_SEVERITY.LOW
      );
    }
  }

  /**
   * Get file size in bytes
   * @param filePath - Path to the file
   * @returns File size in bytes
   */
  private getFileSize(filePath: string): number {
    try {
      if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).size;
      }
      return 0;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'FILE_SIZE',
        ERROR_SEVERITY.LOW
      );
      return 0;
    }
  }

  /**
   * Track validation execution time
   * @param validationType - Type of validation
   * @param executionTime - Execution time in milliseconds
   */
  trackValidationExecution(validationType: string, executionTime: number): void {
    try {
      if (executionTime < 0) {
        throw errorHandler.createError(
          AnalyticsError,
          `Invalid execution time: ${executionTime}`,
          ERROR_CODES.INVALID_METRICS,
          { category: 'ANALYTICS' }
        );
      }
      
      if (!this.metrics.validationExecutionTimes[validationType]) {
        this.metrics.validationExecutionTimes[validationType] = [];
      }
      
      this.metrics.validationExecutionTimes[validationType].push({
        time: executionTime,
        timestamp: Date.now()
      });
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'VALIDATION_TRACK',
        ERROR_SEVERITY.LOW
      );
    }
  }

  /**
   * Track violation category
   * @param category - Violation category
   * @param type - Violation type
   */
  trackViolationCategory(category: string, type: string): void {
    try {
      if (!this.metrics.violationCategories[category]) {
        this.metrics.violationCategories[category] = {
          CRITICAL: 0,
          WARNING: 0,
          ERROR: 0
        };
      }
      
      if (type in this.metrics.violationCategories[category]) {
        this.metrics.violationCategories[category][type as keyof typeof this.metrics.violationCategories[typeof category]]++;
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'VIOLATION_TRACK',
        ERROR_SEVERITY.LOW
      );
    }
  }

  /**
   * Track standards effectiveness
   * @param standardName - Name of the standard
   * @param hasViolations - Whether violations were found
   */
  trackStandardsEffectiveness(standardName: string, hasViolations: boolean): void {
    try {
      if (!this.metrics.standardsEffectiveness[standardName]) {
        this.metrics.standardsEffectiveness[standardName] = {
          totalChecks: 0,
          violations: 0,
          effectiveness: 0
        };
      }
      
      this.metrics.standardsEffectiveness[standardName].totalChecks++;
      
      if (hasViolations) {
        this.metrics.standardsEffectiveness[standardName].violations++;
      }
      
      // Calculate effectiveness
      const standard = this.metrics.standardsEffectiveness[standardName];
      standard.effectiveness = standard.totalChecks > 0 ? 
        ((standard.totalChecks - standard.violations) / standard.totalChecks) * 100 : 0;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'STANDARDS_TRACK',
        ERROR_SEVERITY.LOW
      );
    }
  }

  /**
   * Calculate average processing time
   * @returns Average processing time in milliseconds
   */
  calculateAverageProcessingTime(): number {
    try {
      const times = Object.values(this.metrics.fileProcessingTimes);
      if (times.length === 0) return 0;
      
      const totalTime = times.reduce((sum, entry) => sum + entry.time, 0);
      return totalTime / times.length;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'AVERAGE_TIME_CALC',
        ERROR_SEVERITY.LOW
      );
      return 0;
    }
  }

  /**
   * Generate analytics report
   * @param complianceData - Compliance data for report
   * @returns Analytics report object
   */
  generateAnalyticsReport(complianceData: any): AnalyticsReport {
    try {
      const violations = complianceData.violations || [];
      
      return {
        summary: {
          complianceScore: complianceData.complianceScore,
          totalFiles: Object.keys(this.metrics.fileProcessingTimes).length,
          totalViolations: violations.length,
          executionTime: this.metrics.executionTime,
          averageProcessingTime: this.calculateAverageProcessingTime()
        },
        violations: this.analyzeViolationsBySeverity(violations),
        performance: {
          fileProcessing: this.analyzeFileProcessingPerformance(),
          validation: this.analyzeValidationPerformance(),
          baselines: this.checkPerformanceBaselines()
        },
        trends: this.analyzeTrends(),
        recommendations: this.generateRecommendations(complianceData)
      };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'ANALYTICS_REPORT',
        ERROR_SEVERITY.MEDIUM
      );
      
      // Return minimal report
      return {
        summary: {
          complianceScore: 0,
          totalFiles: 0,
          totalViolations: 0,
          executionTime: 0,
          averageProcessingTime: 0
        },
        violations: { byCategory: {}, bySeverity: {}, byStandard: {} },
        performance: {
          fileProcessing: { averageTime: 0, maxTime: 0, minTime: 0, averageSize: 0, totalFiles: 0 },
          validation: {},
          baselines: {}
        },
        trends: { complianceScore: undefined, violations: undefined, message: 'Analysis failed' },
        recommendations: []
      };
    }
  }

  /**
   * Analyze violations by severity
   * @param violations - Array of violations
   * @returns Violation analysis
   */
  private analyzeViolationsBySeverity(violations: any[]): any {
    try {
      const analysis = {
        byCategory: {} as Record<string, any>,
        bySeverity: {} as Record<string, number>,
        byStandard: {} as Record<string, number>
      };
      
      violations.forEach(violation => {
        // By category
        if (!analysis.byCategory[violation.category]) {
          analysis.byCategory[violation.category] = {
            CRITICAL: 0,
            WARNING: 0,
            ERROR: 0
          };
        }
        analysis.byCategory[violation.category][violation.type]++;
        
        // By severity
        analysis.bySeverity[violation.severity] = (analysis.bySeverity[violation.severity] || 0) + 1;
        
        // By standard
        analysis.byStandard[violation.standard] = (analysis.byStandard[violation.standard] || 0) + 1;
      });
      
      return analysis;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'VIOLATION_ANALYSIS',
        ERROR_SEVERITY.MEDIUM
      );
      return { byCategory: {}, bySeverity: {}, byStandard: {} };
    }
  }

  /**
   * Analyze file processing performance
   * @returns File processing analysis
   */
  private analyzeFileProcessingPerformance(): any {
    try {
      const times = Object.values(this.metrics.fileProcessingTimes);
      const sizes = times.map(entry => entry.size);
      
      return {
        averageTime: times.length > 0 ? times.reduce((sum, entry) => sum + entry.time, 0) / times.length : 0,
        maxTime: times.length > 0 ? Math.max(...times.map(entry => entry.time)) : 0,
        minTime: times.length > 0 ? Math.min(...times.map(entry => entry.time)) : 0,
        averageSize: sizes.length > 0 ? sizes.reduce((sum, size) => sum + size, 0) / sizes.length : 0,
        totalFiles: times.length
      };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'PERFORMANCE_ANALYSIS',
        ERROR_SEVERITY.MEDIUM
      );
      return { averageTime: 0, maxTime: 0, minTime: 0, averageSize: 0, totalFiles: 0 };
    }
  }

  /**
   * Analyze validation performance
   * @returns Validation analysis
   */
  private analyzeValidationPerformance(): any {
    try {
      const analysis: Record<string, any> = {};
      
      Object.entries(this.metrics.validationExecutionTimes).forEach(([type, times]) => {
        if (times.length > 0) {
          analysis[type] = {
            averageTime: times.reduce((sum, entry) => sum + entry.time, 0) / times.length,
            maxTime: Math.max(...times.map(entry => entry.time)),
            minTime: Math.min(...times.map(entry => entry.time)),
            totalRuns: times.length
          };
        }
      });
      
      return analysis;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'VALIDATION_ANALYSIS',
        ERROR_SEVERITY.MEDIUM
      );
      return {};
    }
  }

  /**
   * Check performance against baselines
   * @returns Baseline comparison
   */
  private checkPerformanceBaselines(): any {
    try {
      const comparison: any = {};
      const avgProcessingTime = this.calculateAverageProcessingTime();
      
      if (avgProcessingTime > this.metrics.performanceBaselines.fileProcessing.large.avg) {
        comparison.fileProcessing = 'SLOW';
      } else if (avgProcessingTime < this.metrics.performanceBaselines.fileProcessing.small.avg) {
        comparison.fileProcessing = 'FAST';
      } else {
        comparison.fileProcessing = 'NORMAL';
      }
      
      return comparison;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'BASELINE_CHECK',
        ERROR_SEVERITY.MEDIUM
      );
      return {};
    }
  }

  /**
   * Analyze trends in historical data
   * @returns Trend analysis
   */
  private analyzeTrends(): any {
    try {
      if (this.metrics.historicalData.length < 2) {
        return { message: 'Insufficient data for trend analysis' };
      }
      
      const recentData = this.metrics.historicalData.slice(-5);
      const complianceScores = recentData.map(entry => entry.complianceScore);
      const violations = recentData.map(entry => entry.violations);
      
      return {
        complianceScore: this.calculateTrend(complianceScores),
        violations: this.calculateTrend(violations),
        message: 'Trend analysis completed'
      };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'TREND_ANALYSIS',
        ERROR_SEVERITY.MEDIUM
      );
      return { message: 'Trend analysis failed' };
    }
  }

  /**
   * Calculate trend from data points
   * @param data - Array of data points
   * @returns Trend information
   */
  private calculateTrend(data: number[]): any {
    try {
      if (data.length < 2) return { trend: 'STABLE', average: 0 };
      
      const n = data.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = data.reduce((sum, val) => sum + val, 0);
      const sumXY = data.reduce((sum, val, index) => sum + (index * val), 0);
      const sumX2 = data.reduce((sum, _, index) => sum + (index * index), 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const average = sumY / n;
      
      let trend: 'IMPROVING' | 'DECLINING' | 'STABLE' = 'STABLE';
      if (Math.abs(slope) > 0.1) {
        trend = slope > 0 ? 'IMPROVING' : 'DECLINING';
      }
      
      return { trend, average };
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'TREND_CALCULATION',
        ERROR_SEVERITY.LOW
      );
      return { trend: 'STABLE', average: 0 };
    }
  }

  /**
   * Generate recommendations based on analysis
   * @param complianceData - Compliance data
   * @returns Array of recommendations
   */
  private generateRecommendations(complianceData: any): Recommendation[] {
    try {
      const recommendations: Recommendation[] = [];
      const violations = complianceData.violations || [];
      
      // Critical violations recommendation
      const criticalViolations = violations.filter((v: any) => v.severity === 'CRITICAL');
      if (criticalViolations.length > 0) {
        recommendations.push({
          type: 'CRITICAL',
          category: 'SECURITY',
          message: `Address ${criticalViolations.length} critical violations immediately`,
          priority: 'HIGH'
        });
      }
      
      // Performance recommendations
      const avgProcessingTime = this.calculateAverageProcessingTime();
      if (avgProcessingTime > 1000) {
        recommendations.push({
          type: 'WARNING',
          category: 'PERFORMANCE',
          message: 'File processing is taking longer than expected',
          priority: 'MEDIUM'
        });
      }
      
      // Compliance score recommendations
      if (complianceData.complianceScore < 80) {
        recommendations.push({
          type: 'WARNING',
          category: 'COMPLIANCE',
          message: 'Compliance score is below target (80%)',
          priority: 'HIGH'
        });
      }
      
      return recommendations;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'RECOMMENDATIONS',
        ERROR_SEVERITY.MEDIUM
      );
      return [];
    }
  }

  /**
   * Get current metrics
   * @returns Current metrics object
   */
  getMetrics(): Metrics {
    return this.metrics;
  }

  /**
   * Set execution time
   * @param executionTime - Execution time in milliseconds
   */
  setExecutionTime(executionTime: number): void {
    try {
      if (executionTime < 0) {
        throw errorHandler.createError(
          AnalyticsError,
          `Invalid execution time: ${executionTime}`,
          ERROR_CODES.INVALID_METRICS,
          { category: 'ANALYTICS' }
        );
      }
      
      this.metrics.executionTime = executionTime;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'EXECUTION_TIME_SET',
        ERROR_SEVERITY.LOW
      );
    }
  }
}

export default AnalyticsModule; 