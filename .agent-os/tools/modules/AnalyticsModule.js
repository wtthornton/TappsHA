/**
 * Analytics Module
 * Handles all analytics, reporting, and statistical analysis functionality
 * 
 * @module AnalyticsModule
 */

const fs = require('fs');
const path = require('path');
const StatisticalAnalysis = require('../statistical-analysis');

class AnalyticsModule {
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
    
    this.statisticalAnalysis = new StatisticalAnalysis();
    this.statisticalAnalysis.loadHistoricalData();
  }

  /**
   * Load historical data for trend analysis
   * @returns {Array} Historical data array
   */
  loadHistoricalData() {
    const historyPath = path.join(__dirname, '../../reports/compliance-history.json');
    try {
      if (fs.existsSync(historyPath)) {
        return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load historical data:', error.message);
    }
    return [];
  }

  /**
   * Save historical data for trend analysis
   * @param {Object} complianceData - Current compliance data to save
   */
  saveHistoricalData(complianceData) {
    const historyPath = path.join(__dirname, '../../reports/compliance-history.json');
    
    const historyEntry = {
      timestamp: new Date().toISOString(),
      runId: this.generateRunId(),
      complianceScore: complianceData.complianceScore,
      totalChecks: complianceData.totalChecks,
      passedChecks: complianceData.passedChecks,
      violations: complianceData.violations.length,
      criticalViolations: complianceData.violations.filter(v => v.type === 'CRITICAL').length,
      warnings: complianceData.violations.filter(v => v.type === 'WARNING').length,
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
      console.warn('⚠️  Data integrity check failed, skipping history save');
      return;
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

    try {
      const tempPath = historyPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.metrics.historicalData, null, 2));
      fs.renameSync(tempPath, historyPath);
      console.log('✅ Historical data saved successfully');
    } catch (error) {
      console.warn('⚠️  Could not save historical data:', error.message);
    }
  }

  /**
   * Generate unique run ID
   * @returns {string} Unique run ID
   */
  generateRunId() {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate data checksum for integrity validation
   * @param {Object} complianceData - Compliance data to checksum
   * @returns {string} Checksum string
   */
  generateDataChecksum(complianceData) {
    const data = JSON.stringify({
      complianceScore: complianceData.complianceScore,
      totalChecks: complianceData.totalChecks,
      violations: complianceData.violations.length
    });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Validate history entry data integrity
   * @param {Object} entry - History entry to validate
   * @returns {boolean} Validation result
   */
  validateHistoryEntry(entry) {
    const requiredFields = ['timestamp', 'runId', 'complianceScore', 'totalChecks', 'passedChecks'];
    for (const field of requiredFields) {
      if (!entry.hasOwnProperty(field)) {
        console.warn(`⚠️  Missing required field: ${field}`);
        return false;
      }
    }

    if (typeof entry.complianceScore !== 'number' || entry.complianceScore < 0 || entry.complianceScore > 100) {
      console.warn('⚠️  Invalid compliance score');
      return false;
    }

    if (typeof entry.totalChecks !== 'number' || entry.totalChecks < 0) {
      console.warn('⚠️  Invalid total checks count');
      return false;
    }

    if (typeof entry.passedChecks !== 'number' || entry.passedChecks < 0) {
      console.warn('⚠️  Invalid passed checks count');
      return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.timestamp)) {
      console.warn('⚠️  Invalid timestamp format');
      return false;
    }

    return true;
  }

  /**
   * Load performance baselines
   * @returns {Object} Performance baselines
   */
  loadPerformanceBaselines() {
    const baselinesPath = path.join(__dirname, '../../reports/performance-baselines.json');
    try {
      if (fs.existsSync(baselinesPath)) {
        return JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load performance baselines:', error.message);
    }
    return this.createDefaultBaselines();
  }

  /**
   * Create default performance baselines
   * @returns {Object} Default baselines
   */
  createDefaultBaselines() {
    return {
      fileProcessing: {
        small: { avg: 50, max: 100, min: 10 },
        medium: { avg: 200, max: 500, min: 100 },
        large: { avg: 1000, max: 3000, min: 500 }
      },
      validation: {
        codeStyle: { avg: 20, max: 50, min: 5 },
        security: { avg: 30, max: 80, min: 10 },
        architecture: { avg: 25, max: 60, min: 8 },
        testing: { avg: 15, max: 40, min: 3 }
      },
      overall: {
        executionTime: { avg: 5000, max: 15000, min: 1000 },
        memoryUsage: { avg: 50, max: 200, min: 10 }
      }
    };
  }

  /**
   * Save performance baselines
   */
  savePerformanceBaselines() {
    const baselinesPath = path.join(__dirname, '../../reports/performance-baselines.json');
    const reportsDir = path.dirname(baselinesPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    try {
      fs.writeFileSync(baselinesPath, JSON.stringify(this.metrics.performanceBaselines, null, 2));
    } catch (error) {
      console.warn('⚠️  Could not save performance baselines:', error.message);
    }
  }

  /**
   * Track file processing time
   * @param {string} filePath - File path
   * @param {number} processingTime - Processing time in milliseconds
   */
  trackFileProcessing(filePath, processingTime) {
    this.metrics.fileProcessingTimes[filePath] = {
      time: processingTime,
      size: this.getFileSize(filePath),
      timestamp: Date.now()
    };
  }

  /**
   * Get file size in bytes
   * @param {string} filePath - File path
   * @returns {number} File size in bytes
   */
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Track validation execution time
   * @param {string} validationType - Type of validation
   * @param {number} executionTime - Execution time in milliseconds
   */
  trackValidationExecution(validationType, executionTime) {
    if (!this.metrics.validationExecutionTimes[validationType]) {
      this.metrics.validationExecutionTimes[validationType] = [];
    }
    this.metrics.validationExecutionTimes[validationType].push({
      time: executionTime,
      timestamp: Date.now()
    });
  }

  /**
   * Track violation category
   * @param {string} category - Violation category
   * @param {string} type - Violation type
   */
  trackViolationCategory(category, type) {
    if (!this.metrics.violationCategories[category]) {
      this.metrics.violationCategories[category] = { CRITICAL: 0, WARNING: 0, ERROR: 0 };
    }
    this.metrics.violationCategories[category][type]++;
  }

  /**
   * Track standards effectiveness
   * @param {string} standardName - Standard name
   * @param {boolean} hasViolations - Whether violations were found
   */
  trackStandardsEffectiveness(standardName, hasViolations) {
    if (!this.metrics.standardsEffectiveness[standardName]) {
      this.metrics.standardsEffectiveness[standardName] = {
        totalChecks: 0,
        violations: 0,
        effectiveness: 100
      };
    }
    
    this.metrics.standardsEffectiveness[standardName].totalChecks++;
    if (hasViolations) {
      this.metrics.standardsEffectiveness[standardName].violations++;
    }
    
    const standard = this.metrics.standardsEffectiveness[standardName];
    standard.effectiveness = ((standard.totalChecks - standard.violations) / standard.totalChecks) * 100;
  }

  /**
   * Calculate average processing time
   * @returns {number} Average processing time
   */
  calculateAverageProcessingTime() {
    const times = Object.values(this.metrics.fileProcessingTimes).map(item => item.time);
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Generate analytics report
   * @param {Object} complianceData - Compliance data
   * @returns {Object} Analytics report
   */
  generateAnalyticsReport(complianceData) {
    const report = {
      summary: {
        complianceScore: complianceData.complianceScore,
        totalFiles: Object.keys(this.metrics.fileProcessingTimes).length,
        totalViolations: complianceData.violations.length,
        executionTime: this.metrics.executionTime,
        averageProcessingTime: this.calculateAverageProcessingTime()
      },
      violations: {
        byCategory: this.metrics.violationCategories,
        bySeverity: this.analyzeViolationsBySeverity(complianceData.violations),
        byStandard: this.analyzeViolationsByStandard(complianceData.violations)
      },
      performance: {
        fileProcessing: this.analyzeFileProcessingPerformance(),
        validation: this.analyzeValidationPerformance(),
        baselines: this.checkPerformanceBaselines()
      },
      trends: this.analyzeTrends(),
      recommendations: this.generateRecommendations(complianceData)
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
   * Analyze file processing performance
   * @returns {Object} Performance analysis
   */
  analyzeFileProcessingPerformance() {
    const times = Object.values(this.metrics.fileProcessingTimes).map(item => item.time);
    const sizes = Object.values(this.metrics.fileProcessingTimes).map(item => item.size);
    
    return {
      averageTime: times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0,
      maxTime: Math.max(...times, 0),
      minTime: Math.min(...times, Infinity),
      averageSize: sizes.length > 0 ? sizes.reduce((sum, size) => sum + size, 0) / sizes.length : 0,
      totalFiles: times.length
    };
  }

  /**
   * Analyze validation performance
   * @returns {Object} Validation performance analysis
   */
  analyzeValidationPerformance() {
    const analysis = {};
    Object.keys(this.metrics.validationExecutionTimes).forEach(type => {
      const times = this.metrics.validationExecutionTimes[type].map(item => item.time);
      analysis[type] = {
        averageTime: times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0,
        maxTime: Math.max(...times, 0),
        minTime: Math.min(...times, Infinity),
        totalRuns: times.length
      };
    });
    return analysis;
  }

  /**
   * Check performance against baselines
   * @returns {Object} Baseline comparison
   */
  checkPerformanceBaselines() {
    const comparison = {};
    const fileProcessing = this.analyzeFileProcessingPerformance();
    
    // Compare file processing times
    if (fileProcessing.averageTime > this.metrics.performanceBaselines.fileProcessing.medium.max) {
      comparison.fileProcessing = 'SLOW';
    } else if (fileProcessing.averageTime < this.metrics.performanceBaselines.fileProcessing.medium.min) {
      comparison.fileProcessing = 'FAST';
    } else {
      comparison.fileProcessing = 'NORMAL';
    }
    
    return comparison;
  }

  /**
   * Analyze trends from historical data
   * @returns {Object} Trend analysis
   */
  analyzeTrends() {
    if (this.metrics.historicalData.length < 2) {
      return { message: 'Insufficient data for trend analysis' };
    }

    const recentData = this.metrics.historicalData.slice(-10);
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const violationCounts = recentData.map(entry => entry.violations);

    return {
      complianceScore: {
        trend: this.calculateTrend(complianceScores),
        average: complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length
      },
      violations: {
        trend: this.calculateTrend(violationCounts),
        average: violationCounts.reduce((sum, count) => sum + count, 0) / violationCounts.length
      }
    };
  }

  /**
   * Calculate trend from data points
   * @param {Array} data - Data points
   * @returns {string} Trend direction
   */
  calculateTrend(data) {
    if (data.length < 2) return 'STABLE';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    const threshold = Math.max(...data) * 0.1; // 10% threshold
    
    if (difference > threshold) return 'IMPROVING';
    if (difference < -threshold) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Generate recommendations based on analysis
   * @param {Object} complianceData - Compliance data
   * @returns {Array} Recommendations array
   */
  generateRecommendations(complianceData) {
    const recommendations = [];
    
    // Compliance score recommendations
    if (complianceData.complianceScore < 80) {
      recommendations.push({
        type: 'CRITICAL',
        category: 'COMPLIANCE',
        message: 'Compliance score is below 80%. Focus on addressing critical violations first.',
        priority: 'HIGH'
      });
    }
    
    // Performance recommendations
    const fileProcessing = this.analyzeFileProcessingPerformance();
    if (fileProcessing.averageTime > 1000) {
      recommendations.push({
        type: 'WARNING',
        category: 'PERFORMANCE',
        message: 'File processing is slow. Consider optimizing validation algorithms.',
        priority: 'MEDIUM'
      });
    }
    
    // Standards effectiveness recommendations
    Object.keys(this.metrics.standardsEffectiveness).forEach(standard => {
      const effectiveness = this.metrics.standardsEffectiveness[standard].effectiveness;
      if (effectiveness < 70) {
        recommendations.push({
          type: 'WARNING',
          category: 'STANDARDS',
          message: `Standard '${standard}' has low effectiveness (${effectiveness.toFixed(1)}%). Consider updating or clarifying the standard.`,
          priority: 'MEDIUM'
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Get all metrics
   * @returns {Object} All metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Set execution time
   * @param {number} executionTime - Execution time in milliseconds
   */
  setExecutionTime(executionTime) {
    this.metrics.executionTime = executionTime;
  }
}

module.exports = AnalyticsModule; 