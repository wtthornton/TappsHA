#!/usr/bin/env node

/**
 * Automated Standards Compliance Checker with Analytics
 * Validates code against all .agent-os standards with enhanced metrics collection
 * 
 * Usage: node .agent-os/tools/compliance-checker.js [file-path]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const StatisticalAnalysis = require('./statistical-analysis');

class ComplianceChecker {
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
      validationExecutionTimes: {}, // Track individual validation method times
      violationCategories: {},
      standardsEffectiveness: {},
      historicalData: this.loadHistoricalData(),
      performanceBaselines: this.loadPerformanceBaselines()
    };
    
    // Initialize statistical analysis
    this.statisticalAnalysis = new StatisticalAnalysis();
    this.statisticalAnalysis.loadHistoricalData();
  }

  loadStandards() {
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

  // Enhanced: Load historical data for trend analysis
  loadHistoricalData() {
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

  // Enhanced: Save historical data for trend analysis with data integrity checks
  saveHistoricalData() {
    const historyPath = path.join(__dirname, '../reports/compliance-history.json');
    
    // Enhanced history entry with comprehensive timestamping and data integrity
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
        averageFileProcessingTime: this.calculateAverageProcessingTime(),
        violationCategories: this.metrics.violationCategories,
        standardsEffectiveness: this.metrics.standardsEffectiveness,
        filesProcessed: Object.keys(this.metrics.fileProcessingTimes).length
      },
      dataIntegrity: {
        checksum: this.generateDataChecksum(),
        version: '1.0',
        validated: true
      }
    };

    // Validate data integrity before saving
    if (!this.validateHistoryEntry(historyEntry)) {
      console.warn('⚠️  Data integrity check failed, skipping history save');
      return;
    }

    this.metrics.historicalData.push(historyEntry);
    
    // Enhanced data retention policy: keep last 30 entries with cleanup
    if (this.metrics.historicalData.length > 30) {
      this.metrics.historicalData = this.metrics.historicalData.slice(-30);
    }

    // Ensure reports directory exists
    const reportsDir = path.dirname(historyPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    try {
      // Write with atomic operation for data integrity
      const tempPath = historyPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.metrics.historicalData, null, 2));
      fs.renameSync(tempPath, historyPath);
      console.log('✅ Historical data saved successfully');
    } catch (error) {
      console.warn('⚠️  Could not save historical data:', error.message);
    }
  }

  // Generate unique run ID for tracking
  generateRunId() {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate data checksum for integrity validation
  generateDataChecksum() {
    const data = JSON.stringify({
      complianceScore: this.complianceScore,
      totalChecks: this.totalChecks,
      violations: this.violations.length
    });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Validate history entry data integrity
  validateHistoryEntry(entry) {
    // Check required fields
    const requiredFields = ['timestamp', 'runId', 'complianceScore', 'totalChecks', 'passedChecks'];
    for (const field of requiredFields) {
      if (!entry.hasOwnProperty(field)) {
        console.warn(`⚠️  Missing required field: ${field}`);
        return false;
      }
    }



    // Validate data types and ranges
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

    // Validate timestamp format
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.timestamp)) {
      console.warn('⚠️  Invalid timestamp format');
      return false;
    }

    return true;
  }

  // Load performance baselines for comparison
  loadPerformanceBaselines() {
    const baselinesPath = path.join(__dirname, '../reports/performance-baselines.json');
    try {
      if (fs.existsSync(baselinesPath)) {
        return JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load performance baselines:', error.message);
    }
    return this.createDefaultBaselines();
  }

  // Create default performance baselines
  createDefaultBaselines() {
    return {
      fileProcessing: {
        '.js': { normal: { min: 5, max: 50, avg: 20 }, slow: 100, verySlow: 200 },
        '.md': { normal: { min: 2, max: 20, avg: 8 }, slow: 50, verySlow: 100 },
        '.json': { normal: { min: 1, max: 10, avg: 4 }, slow: 25, verySlow: 50 },
        '.yml': { normal: { min: 3, max: 15, avg: 8 }, slow: 40, verySlow: 80 },
        '.yaml': { normal: { min: 3, max: 15, avg: 8 }, slow: 40, verySlow: 80 },
        '.xml': { normal: { min: 5, max: 30, avg: 12 }, slow: 60, verySlow: 120 },
        '.html': { normal: { min: 3, max: 25, avg: 10 }, slow: 50, verySlow: 100 },
        '.css': { normal: { min: 2, max: 15, avg: 6 }, slow: 30, verySlow: 60 },
        '.ts': { normal: { min: 8, max: 60, avg: 25 }, slow: 120, verySlow: 240 },
        '.java': { normal: { min: 10, max: 80, avg: 35 }, slow: 150, verySlow: 300 }
      },
      validationExecution: {
        'technology-stack': { normal: { min: 5, max: 30, avg: 15 }, slow: 60, verySlow: 120 },
        'code-style': { normal: { min: 10, max: 50, avg: 25 }, slow: 100, verySlow: 200 },
        'security': { normal: { min: 15, max: 60, avg: 30 }, slow: 120, verySlow: 240 },
        'architecture': { normal: { min: 8, max: 40, avg: 20 }, slow: 80, verySlow: 160 },
        'testing': { normal: { min: 5, max: 25, avg: 12 }, slow: 50, verySlow: 100 }
      },
      overallPerformance: {
        totalExecutionTime: { normal: { min: 1000, max: 10000, avg: 5000 }, slow: 20000, verySlow: 40000 },
        filesPerSecond: { normal: { min: 0.5, max: 5, avg: 2 }, slow: 0.2, verySlow: 0.1 },
        averageComplianceScore: { normal: { min: 70, max: 100, avg: 85 }, low: 50, veryLow: 30 }
      }
    };
  }

  // Save performance baselines
  savePerformanceBaselines() {
    const baselinesPath = path.join(__dirname, '../reports/performance-baselines.json');
    try {
      // Ensure reports directory exists
      const reportsDir = path.dirname(baselinesPath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(baselinesPath, JSON.stringify(this.metrics.performanceBaselines, null, 2));
      console.log('✅ Performance baselines saved successfully');
    } catch (error) {
      console.warn('⚠️  Could not save performance baselines:', error.message);
    }
  }

  // Check performance against baselines
  checkPerformanceBaselines(metricType, category, value) {
    const baselines = this.metrics.performanceBaselines;
    
    if (!baselines[metricType] || !baselines[metricType][category]) {
      return { status: 'UNKNOWN', message: 'No baseline available' };
    }
    
    const baseline = baselines[metricType][category];
    
    if (value <= baseline.normal.max && value >= baseline.normal.min) {
      return { status: 'NORMAL', message: 'Performance within normal range' };
    } else if (value <= baseline.slow) {
      return { status: 'SLOW', message: 'Performance is slow' };
    } else if (value <= baseline.verySlow) {
      return { status: 'VERY_SLOW', message: 'Performance is very slow' };
    } else {
      return { status: 'CRITICAL', message: 'Performance is critically slow' };
    }
  }

  // Enhanced: Track violation categories for analytics
  trackViolationCategory(category, type) {
    if (!this.metrics.violationCategories[category]) {
      this.metrics.violationCategories[category] = { CRITICAL: 0, WARNING: 0 };
    }
    this.metrics.violationCategories[category][type]++;
  }

  // Enhanced: Track standards effectiveness with detailed metrics
  trackStandardsEffectiveness(standardName, hasViolations) {
    if (!this.metrics.standardsEffectiveness[standardName]) {
      this.metrics.standardsEffectiveness[standardName] = { 
        violations: 0, 
        checks: 0,
        violationRate: 0,
        lastViolation: null,
        complianceTrend: 'stable',
        priority: 'MEDIUM',
        referenceCount: 0,
        lastReferenced: null,
        usageFrequency: 'LOW'
      };
    }
    
    this.metrics.standardsEffectiveness[standardName].checks++;
    this.metrics.standardsEffectiveness[standardName].referenceCount++;
    this.metrics.standardsEffectiveness[standardName].lastReferenced = new Date().toISOString();
    
    if (hasViolations) {
      this.metrics.standardsEffectiveness[standardName].violations++;
      this.metrics.standardsEffectiveness[standardName].lastViolation = new Date().toISOString();
    }
    
    // Calculate violation rate
    const standard = this.metrics.standardsEffectiveness[standardName];
    standard.violationRate = (standard.violations / standard.checks) * 100;
    
    // Determine priority based on violation rate
    if (standard.violationRate > 30) {
      standard.priority = 'HIGH';
    } else if (standard.violationRate > 15) {
      standard.priority = 'MEDIUM';
    } else {
      standard.priority = 'LOW';
    }
    
    // Determine usage frequency based on reference count
    if (standard.referenceCount > 50) {
      standard.usageFrequency = 'HIGH';
    } else if (standard.referenceCount > 20) {
      standard.usageFrequency = 'MEDIUM';
    } else {
      standard.usageFrequency = 'LOW';
    }
  }

  // Enhanced: Track file processing performance
  // Enhanced: Track file processing performance with detailed metrics and baseline checking
  trackFileProcessing(filePath, processingTime) {
    const fileExt = path.extname(filePath);
    const fileSize = this.getFileSize(filePath);
    
    // Initialize file type tracking if not exists
    if (!this.metrics.fileProcessingTimes.fileTypes) {
      this.metrics.fileProcessingTimes.fileTypes = {};
    }
    if (!this.metrics.fileProcessingTimes.fileTypes[fileExt]) {
      this.metrics.fileProcessingTimes.fileTypes[fileExt] = {
        totalTime: 0,
        count: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        totalSize: 0,
        averageSize: 0,
        baselineChecks: []
      };
    }
    
    // Check performance against baseline
    const baselineCheck = this.checkPerformanceBaselines('fileProcessing', fileExt, processingTime);
    
    // Track individual file processing
    this.metrics.fileProcessingTimes[filePath] = {
      processingTime,
      fileSize,
      fileType: fileExt,
      timestamp: new Date().toISOString(),
      baselineStatus: baselineCheck.status,
      baselineMessage: baselineCheck.message
    };
    
    // Update file type statistics
    const stats = this.metrics.fileProcessingTimes.fileTypes[fileExt];
    stats.totalTime += processingTime;
    stats.count++;
    stats.averageTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, processingTime);
    stats.maxTime = Math.max(stats.maxTime, processingTime);
    stats.totalSize += fileSize;
    stats.averageSize = stats.totalSize / stats.count;
    stats.baselineChecks.push({
      processingTime,
      status: baselineCheck.status,
      timestamp: new Date().toISOString()
    });
  }
  
  // Helper method to get file size
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  // Enhanced: Track validation execution time with baseline checking
  trackValidationExecution(validationType, executionTime) {
    if (!this.metrics.validationExecutionTimes[validationType]) {
      this.metrics.validationExecutionTimes[validationType] = {
        totalTime: 0,
        count: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        baselineChecks: []
      };
    }
    
    // Check performance against baseline
    const baselineCheck = this.checkPerformanceBaselines('validationExecution', validationType, executionTime);
    
    const stats = this.metrics.validationExecutionTimes[validationType];
    stats.totalTime += executionTime;
    stats.count++;
    stats.averageTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, executionTime);
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.baselineChecks.push({
      executionTime,
      status: baselineCheck.status,
      timestamp: new Date().toISOString()
    });
  }

  validateCode(filePath, content) {
    const startTime = Date.now();
    const violations = [];
    const fileExt = path.extname(filePath);
    
    // Technology Stack Validation
    const techStackStart = Date.now();
    const techStackViolations = this.validateTechnologyStack(filePath, content);
    this.trackValidationExecution('technology-stack', Date.now() - techStackStart);
    violations.push(...techStackViolations);
    this.trackStandardsEffectiveness('tech-stack', techStackViolations.length > 0);
    
    // Code Style Validation
    const codeStyleStart = Date.now();
    const codeStyleViolations = this.validateCodeStyle(filePath, content);
    this.trackValidationExecution('code-style', Date.now() - codeStyleStart);
    violations.push(...codeStyleViolations);
    this.trackStandardsEffectiveness('code-style', codeStyleViolations.length > 0);
    
    // Security Validation
    const securityStart = Date.now();
    const securityViolations = this.validateSecurity(filePath, content);
    this.trackValidationExecution('security', Date.now() - securityStart);
    violations.push(...securityViolations);
    this.trackStandardsEffectiveness('security-compliance', securityViolations.length > 0);
    
    // Architecture Validation
    const architectureStart = Date.now();
    const architectureViolations = this.validateArchitecture(filePath, content);
    this.trackValidationExecution('architecture', Date.now() - architectureStart);
    violations.push(...architectureViolations);
    this.trackStandardsEffectiveness('best-practices', architectureViolations.length > 0);
    
    // Testing Validation
    const testingStart = Date.now();
    const testingViolations = this.validateTesting(filePath, content);
    this.trackValidationExecution('testing', Date.now() - testingStart);
    violations.push(...testingViolations);
    this.trackStandardsEffectiveness('testing-strategy', testingViolations.length > 0);

    // Enhanced: Track processing time
    const processingTime = Date.now() - startTime;
    this.trackFileProcessing(filePath, processingTime);

    // Enhanced: Track violation categories
    violations.forEach(violation => {
      this.trackViolationCategory(violation.category, violation.type);
      // Add timestamp for trend analysis
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
          line: 1
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
          line: 1
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
          suggestion: 'Replace tabs with 2 spaces for consistent indentation'
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
          suggestion: 'Split long line into multiple lines or use line continuation'
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
      /token\s*=\s*['"][^'"]+['"]/i
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
            suggestion: 'Replace hardcoded value with environment variable: ${process.env.VARIABLE_NAME}'
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
          suggestion: 'Add @RequestMapping annotation to define API endpoints'
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
          suggestion: 'Define TypeScript interface for component props'
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
          suggestion: 'Add @Test annotations or test methods to validate functionality'
        });
      }
    }

    return violations;
  }

  validateCodebase(codebasePath = '.') {
    console.log('🔍 Running comprehensive compliance check with analytics...');
    
    const patterns = [
      '**/*.java',
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.xml',
      '**/*.json',
      '**/*.yml',
      '**/*.yaml'
    ];

    let totalFiles = 0;
    let totalViolations = 0;

    patterns.forEach(pattern => {
      const files = glob.sync(pattern, { cwd: codebasePath, ignore: ['node_modules/**', 'target/**', 'dist/**'] });
      
      files.forEach(file => {
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
      });
    });

    // Calculate compliance based on files with violations vs total files
    const filesWithViolations = this.violations.reduce((acc, violation) => {
      if (!acc.includes(violation.file)) {
        acc.push(violation.file);
      }
      return acc;
    }, []).length;
    
    this.passedChecks = this.totalChecks - filesWithViolations;
    this.complianceScore = Math.max(0, Math.round((this.passedChecks / this.totalChecks) * 100));

    // Enhanced: Calculate execution time
    this.metrics.executionTime = Date.now() - this.metrics.startTime;

    // Enhanced: Save historical data
    this.saveHistoricalData();
    
    // NEW: Save performance baselines
    this.savePerformanceBaselines();

    return {
      totalFiles,
      totalViolations,
      complianceScore: this.complianceScore,
      violations: this.violations,
      metrics: this.metrics
    };
  }

  // Enhanced: Generate analytics report
  generateAnalyticsReport() {
    const analytics = {
      timestamp: new Date().toISOString(),
      executionTime: this.metrics.executionTime,
      averageFileProcessingTime: this.calculateAverageProcessingTime(),
      validationPerformance: this.calculateValidationPerformance(),
      violationTrends: this.analyzeViolationTrends(),
      standardsEffectiveness: this.calculateStandardsEffectiveness(),
      improvementSuggestions: this.generateImprovementSuggestions(),
      ruleBasedSuggestions: this.generateRuleBasedSuggestions(),
      statisticalAnalysis: this.generateStatisticalAnalysis()
    };

    const analyticsPath = path.join(__dirname, '../reports/analytics-report.json');
    fs.writeFileSync(analyticsPath, JSON.stringify(analytics, null, 2));
    console.log('📊 Analytics report saved to: .agent-os/reports/analytics-report.json');

    return analytics;
  }

  // Enhanced: Generate statistical analysis
  generateStatisticalAnalysis() {
    const historicalData = this.metrics.historicalData;
    
    return {
      violationFrequency: this.statisticalAnalysis.analyzeViolationFrequency(historicalData),
      complianceTrends: this.statisticalAnalysis.analyzeComplianceTrends(historicalData),
      standardsEffectiveness: this.statisticalAnalysis.analyzeStandardsEffectiveness(historicalData),
      riskAssessment: this.statisticalAnalysis.calculateRiskScores(historicalData),
      predictions: this.statisticalAnalysis.predictComplianceScore(historicalData),
      insights: this.statisticalAnalysis.generateStatisticalInsights(historicalData),
      violationPatterns: this.statisticalAnalysis.identifyViolationPatterns(historicalData),
      recurringIssues: this.statisticalAnalysis.detectRecurringComplianceIssues(historicalData),
      violationClustering: this.statisticalAnalysis.buildViolationClusteringAnalysis(historicalData),
      issuePredictions: this.statisticalAnalysis.predictComplianceIssues(historicalData),
      forecasts: this.statisticalAnalysis.createSimpleForecasting(historicalData, 3),
      trendBasedRiskAssessment: this.statisticalAnalysis.implementRiskAssessmentBasedOnTrends(historicalData),
      confidenceScoring: this.statisticalAnalysis.buildConfidenceScoringForPredictions(historicalData),
      patternBasedSuggestions: this.statisticalAnalysis.implementPatternBasedSuggestions(historicalData)
    };
  }

  // Enhanced: Calculate average processing time
  // Enhanced: Calculate average processing time with detailed breakdown
  calculateAverageProcessingTime() {
    const fileEntries = Object.entries(this.metrics.fileProcessingTimes)
      .filter(([key]) => key !== 'fileTypes')
      .map(([filePath, data]) => data);
    
    if (fileEntries.length === 0) return 0;
    
    const totalTime = fileEntries.reduce((sum, entry) => sum + entry.processingTime, 0);
    const averageTime = totalTime / fileEntries.length;
    
    // Calculate file type performance
    const fileTypePerformance = {};
    if (this.metrics.fileProcessingTimes.fileTypes) {
      Object.entries(this.metrics.fileProcessingTimes.fileTypes).forEach(([fileType, stats]) => {
        fileTypePerformance[fileType] = {
          averageTime: Math.round(stats.averageTime * 100) / 100,
          count: stats.count,
          totalSize: stats.totalSize,
          averageSize: Math.round(stats.averageSize),
          efficiency: stats.averageSize > 0 ? Math.round((stats.averageTime / stats.averageSize) * 1000) / 1000 : 0 // ms per byte
        };
      });
    }
    
    return {
      overallAverage: Math.round(averageTime * 100) / 100,
      totalFiles: fileEntries.length,
      totalTime: totalTime,
      fileTypePerformance: fileTypePerformance
    };
  }

  // Enhanced: Calculate validation performance metrics
  calculateValidationPerformance() {
    const performance = {};
    
    Object.entries(this.metrics.validationExecutionTimes).forEach(([validationType, stats]) => {
      performance[validationType] = {
        averageTime: Math.round(stats.averageTime * 100) / 100, // Round to 2 decimal places
        totalTime: stats.totalTime,
        count: stats.count,
        minTime: stats.minTime === Infinity ? 0 : stats.minTime,
        maxTime: stats.maxTime,
        efficiency: stats.count > 0 ? Math.round((stats.totalTime / stats.count) * 100) / 100 : 0
      };
    });
    
    return performance;
  }

  // Enhanced: Analyze violation trends
  analyzeViolationTrends() {
    if (this.metrics.historicalData.length < 2) {
      return { trend: 'insufficient_data', message: 'Need more historical data for trend analysis' };
    }

    const recent = this.metrics.historicalData.slice(-5);
    const older = this.metrics.historicalData.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.complianceScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.complianceScore, 0) / older.length;
    
    const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';
    
    return {
      trend,
      recentAverage: Math.round(recentAvg),
      olderAverage: Math.round(olderAvg),
      change: Math.round(recentAvg - olderAvg)
    };
  }

  // Enhanced: Calculate standards effectiveness with detailed analysis
  calculateStandardsEffectiveness() {
    const effectiveness = {};
    const standardsRanking = [];
    const referenceTracking = [];
    
    Object.entries(this.metrics.standardsEffectiveness).forEach(([standard, data]) => {
      if (data.checks > 0) {
        effectiveness[standard] = {
          violationRate: Math.round((data.violations / data.checks) * 100),
          totalChecks: data.checks,
          totalViolations: data.violations,
          priority: data.priority,
          lastViolation: data.lastViolation,
          complianceTrend: data.complianceTrend,
          status: data.violationRate > 30 ? 'CRITICAL' : data.violationRate > 15 ? 'WARNING' : 'GOOD',
          referenceCount: data.referenceCount || 0,
          lastReferenced: data.lastReferenced,
          usageFrequency: data.usageFrequency || 'LOW'
        };
        
        // Add to ranking for sorting
        standardsRanking.push({
          name: standard,
          violationRate: data.violationRate,
          totalChecks: data.checks,
          totalViolations: data.violations,
          priority: data.priority,
          status: effectiveness[standard].status,
          referenceCount: data.referenceCount || 0,
          usageFrequency: data.usageFrequency || 'LOW'
        });
        
        // Add to reference tracking
        referenceTracking.push({
          name: standard,
          referenceCount: data.referenceCount || 0,
          usageFrequency: data.usageFrequency || 'LOW',
          lastReferenced: data.lastReferenced
        });
      }
    });

    // Sort standards by violation rate (highest first)
    standardsRanking.sort((a, b) => b.violationRate - a.violationRate);
    
    // Sort by reference count (most referenced first)
    const mostReferenced = [...referenceTracking].sort((a, b) => b.referenceCount - a.referenceCount);
    
    return {
      effectiveness: effectiveness,
      ranking: standardsRanking,
      referenceTracking: {
        mostReferenced: mostReferenced.slice(0, 5),
        leastReferenced: mostReferenced.slice(-5).reverse(),
        highUsage: mostReferenced.filter(s => s.usageFrequency === 'HIGH'),
        mediumUsage: mostReferenced.filter(s => s.usageFrequency === 'MEDIUM'),
        lowUsage: mostReferenced.filter(s => s.usageFrequency === 'LOW')
      },
      standardsClarification: this.identifyStandardsNeedingClarification(standardsRanking, mostReferenced),
      summary: {
        totalStandards: standardsRanking.length,
        criticalStandards: standardsRanking.filter(s => s.status === 'CRITICAL').length,
        warningStandards: standardsRanking.filter(s => s.status === 'WARNING').length,
        goodStandards: standardsRanking.filter(s => s.status === 'GOOD').length,
        mostViolated: standardsRanking.slice(0, 3),
        leastViolated: standardsRanking.slice(-3).reverse(),
        mostReferenced: mostReferenced.slice(0, 3),
        totalReferences: mostReferenced.reduce((sum, s) => sum + s.referenceCount, 0)
      }
    };
  }
  
  // Enhanced: Identify standards that need clarification
  identifyStandardsNeedingClarification(standardsRanking, referenceTracking) {
    const clarificationNeeded = [];
    
    // Analyze standards based on multiple factors
    standardsRanking.forEach(standard => {
      const referenceData = referenceTracking.find(ref => ref.name === standard.name);
      const clarificationFactors = [];
      
      // Factor 1: High violation rate with high usage
      if (standard.violationRate > 25 && referenceData && referenceData.usageFrequency === 'HIGH') {
        clarificationFactors.push({
          type: 'HIGH_VIOLATION_HIGH_USAGE',
          description: 'High violation rate despite frequent usage',
          recommendation: 'Clarify standards to reduce violations'
        });
      }
      
      // Factor 2: High violation rate with low usage
      if (standard.violationRate > 30 && referenceData && referenceData.usageFrequency === 'LOW') {
        clarificationFactors.push({
          type: 'HIGH_VIOLATION_LOW_USAGE',
          description: 'High violation rate with low adoption',
          recommendation: 'Improve standards clarity and provide training'
        });
      }
      
      // Factor 3: Inconsistent violation patterns
      if (standard.totalChecks > 10 && standard.violationRate > 15 && standard.violationRate < 40) {
        clarificationFactors.push({
          type: 'INCONSISTENT_PATTERNS',
          description: 'Moderate but inconsistent violation patterns',
          recommendation: 'Clarify ambiguous standards requirements'
        });
      }
      
      // Factor 4: Low usage despite being important
      if (referenceData && referenceData.usageFrequency === 'LOW' && standard.priority === 'HIGH') {
        clarificationFactors.push({
          type: 'LOW_USAGE_HIGH_PRIORITY',
          description: 'Low usage of high-priority standards',
          recommendation: 'Improve standards documentation and accessibility'
        });
      }
      
      // Factor 5: Critical violations in frequently used standards
      if (standard.status === 'CRITICAL' && referenceData && referenceData.usageFrequency === 'HIGH') {
        clarificationFactors.push({
          type: 'CRITICAL_HIGH_USAGE',
          description: 'Critical violations in frequently used standards',
          recommendation: 'Immediate clarification and training required'
        });
      }
      
      if (clarificationFactors.length > 0) {
        clarificationNeeded.push({
          standard: standard.name,
          factors: clarificationFactors,
          priority: this.calculateClarificationPriority(standard, referenceData),
          totalFactors: clarificationFactors.length,
          recommendations: clarificationFactors.map(f => f.recommendation)
        });
      }
    });
    
    // Sort by priority
    clarificationNeeded.sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    return {
      standardsNeedingClarification: clarificationNeeded,
      summary: {
        totalNeedingClarification: clarificationNeeded.length,
        criticalClarification: clarificationNeeded.filter(s => s.priority === 'CRITICAL').length,
        highClarification: clarificationNeeded.filter(s => s.priority === 'HIGH').length,
        mediumClarification: clarificationNeeded.filter(s => s.priority === 'MEDIUM').length,
        lowClarification: clarificationNeeded.filter(s => s.priority === 'LOW').length
      }
    };
  }
  
  // Calculate clarification priority
  calculateClarificationPriority(standard, referenceData) {
    let priority = 'LOW';
    
    // Critical violations in high-usage standards
    if (standard.status === 'CRITICAL' && referenceData && referenceData.usageFrequency === 'HIGH') {
      priority = 'CRITICAL';
    }
    // High violation rate with high usage
    else if (standard.violationRate > 30 && referenceData && referenceData.usageFrequency === 'HIGH') {
      priority = 'HIGH';
    }
    // High violation rate with low usage
    else if (standard.violationRate > 25 && referenceData && referenceData.usageFrequency === 'LOW') {
      priority = 'MEDIUM';
    }
    // Low usage of high-priority standards
    else if (referenceData && referenceData.usageFrequency === 'LOW' && standard.priority === 'HIGH') {
      priority = 'MEDIUM';
    }
    
    return priority;
  }

  // Enhanced: Generate improvement suggestions
  generateImprovementSuggestions() {
    const suggestions = [];
    
    // Analyze violation categories with enhanced insights
    Object.entries(this.metrics.violationCategories).forEach(([category, counts]) => {
      const totalViolations = counts.CRITICAL + counts.WARNING;
      const criticalRatio = counts.CRITICAL / totalViolations;
      
      if (totalViolations > 5) {
        let priority = 'MEDIUM';
        let message = `Focus on reducing ${category.toLowerCase()} violations (${totalViolations} total)`;
        let action = `Review and update ${category.toLowerCase()} standards`;
        
        if (counts.CRITICAL > 0) {
          priority = 'HIGH';
          message = `🚨 Critical ${category.toLowerCase()} violations detected (${counts.CRITICAL} critical, ${counts.WARNING} warnings)`;
          action = `Immediately address critical ${category.toLowerCase()} violations and review standards`;
        } else if (totalViolations > 20) {
          priority = 'HIGH';
          message = `⚠️ High volume of ${category.toLowerCase()} violations (${totalViolations} total)`;
          action = `Implement systematic approach to reduce ${category.toLowerCase()} violations`;
        }
        
        suggestions.push({
          priority: priority,
          category: category,
          message: message,
          action: action,
          impact: criticalRatio > 0.3 ? 'HIGH' : totalViolations > 15 ? 'MEDIUM' : 'LOW',
          effort: totalViolations > 20 ? 'HIGH' : totalViolations > 10 ? 'MEDIUM' : 'LOW'
        });
      }
    });

    // Analyze standards effectiveness with detailed recommendations
    Object.entries(this.metrics.standardsEffectiveness).forEach(([standard, data]) => {
      const violationRate = (data.violations / data.checks) * 100;
      
      if (violationRate > 20) {
        let priority = 'MEDIUM';
        let message = `${standard} has high violation rate (${Math.round(violationRate)}%)`;
        let action = `Review and clarify ${standard} documentation`;
        
        if (violationRate > 40) {
          priority = 'HIGH';
          message = `🚨 ${standard} has critical violation rate (${Math.round(violationRate)}%)`;
          action = `Urgently review and rewrite ${standard} documentation with clear examples`;
        } else if (violationRate > 30) {
          priority = 'HIGH';
          message = `⚠️ ${standard} has very high violation rate (${Math.round(violationRate)}%)`;
          action = `Review ${standard} documentation and provide team training`;
        }
        
        suggestions.push({
          priority: priority,
          category: 'Standards',
          message: message,
          action: action,
          impact: violationRate > 40 ? 'HIGH' : violationRate > 30 ? 'MEDIUM' : 'LOW',
          effort: violationRate > 40 ? 'HIGH' : 'MEDIUM'
        });
      }
    });

    // Analyze performance issues
    if (this.metrics.executionTime > 5000) {
      suggestions.push({
        priority: 'MEDIUM',
        category: 'Performance',
        message: `⚡ Slow execution time (${this.metrics.executionTime}ms)`,
        action: 'Optimize compliance checking performance',
        impact: 'MEDIUM',
        effort: 'MEDIUM'
      });
    }

    // Analyze file processing performance
    if (this.metrics.fileProcessingTimes.fileTypes) {
      Object.entries(this.metrics.fileProcessingTimes.fileTypes).forEach(([fileType, stats]) => {
        if (stats.averageTime > 10) {
          suggestions.push({
            priority: 'LOW',
            category: 'Performance',
            message: `📁 Slow ${fileType} file processing (${stats.averageTime}ms avg)`,
            action: `Optimize ${fileType} file validation`,
            impact: 'LOW',
            effort: 'LOW'
          });
        }
      });
    }

    // Analyze compliance score trends
    if (this.complianceScore < 70) {
      suggestions.push({
        priority: 'HIGH',
        category: 'Compliance',
        message: `📊 Low compliance score (${this.complianceScore}%)`,
        action: 'Implement comprehensive compliance improvement plan',
        impact: 'HIGH',
        effort: 'HIGH'
      });
    } else if (this.complianceScore < 85) {
      suggestions.push({
        priority: 'MEDIUM',
        category: 'Compliance',
        message: `📊 Moderate compliance score (${this.complianceScore}%)`,
        action: 'Focus on specific violation categories for improvement',
        impact: 'MEDIUM',
        effort: 'MEDIUM'
      });
    }

    // Analyze violation patterns
    const criticalViolations = this.violations.filter(v => v.type === 'CRITICAL').length;
    const warningViolations = this.violations.filter(v => v.type === 'WARNING').length;
    
    if (criticalViolations > 0) {
      suggestions.push({
        priority: 'HIGH',
        category: 'Security',
        message: `🚨 Critical violations detected (${criticalViolations} critical, ${warningViolations} warnings)`,
        action: 'Immediately address all critical violations',
        impact: 'HIGH',
        effort: criticalViolations > 5 ? 'HIGH' : 'MEDIUM'
      });
    }

    // Analyze file type distribution
    const fileTypeViolations = {};
    this.violations.forEach(violation => {
      const fileType = path.extname(violation.file);
      fileTypeViolations[fileType] = (fileTypeViolations[fileType] || 0) + 1;
    });

    Object.entries(fileTypeViolations).forEach(([fileType, count]) => {
      if (count > 10) {
        suggestions.push({
          priority: 'MEDIUM',
          category: 'File Types',
          message: `📁 High violations in ${fileType} files (${count} violations)`,
          action: `Review and improve ${fileType} file standards`,
          impact: 'MEDIUM',
          effort: 'MEDIUM'
        });
      }
    });

    // Sort suggestions by priority and impact
    suggestions.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const impactOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return impactOrder[b.impact] - impactOrder[a.impact];
    });

    return suggestions;
  }

  // Generate rule-based suggestions for common violations
  generateRuleBasedSuggestions() {
    const suggestions = [];
    
    // Analyze violation patterns and generate specific suggestions
    const violationPatterns = this.analyzeViolationPatterns();
    const historicalPatterns = this.analyzeHistoricalPatterns();
    const fileTypePatterns = this.analyzeFileTypePatterns();
    const severityPatterns = this.analyzeSeverityPatterns();
    
    // Enhanced Code Style suggestions with context
    if (violationPatterns.codeStyleViolations > 0) {
      const codeStyleRatio = violationPatterns.codeStyleViolations / violationPatterns.totalViolations;
      if (codeStyleRatio > 0.7) {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Code Style',
          priority: 'HIGH',
          message: `Code style violations dominate (${Math.round(codeStyleRatio * 100)}% of all violations)`,
          suggestion: 'Implement comprehensive code style automation',
          action: 'Configure Prettier + ESLint with strict rules, enable auto-format on save, and add pre-commit hooks',
          impact: 'HIGH',
          effort: 'MEDIUM',
          pattern: 'DOMINANT_VIOLATION_CATEGORY',
          confidence: 'HIGH'
        });
      } else if (violationPatterns.codeStyleViolations > 20) {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Code Style',
          priority: 'MEDIUM',
          message: 'Significant code style violations detected',
          suggestion: 'Implement automated code formatting',
          action: 'Configure IDE with code style rules and enable auto-format on save',
          impact: 'MEDIUM',
          effort: 'LOW',
          pattern: 'HIGH_VOLUME_VIOLATIONS',
          confidence: 'MEDIUM'
        });
      }
    }
    
    // Enhanced Security suggestions with severity analysis
    if (violationPatterns.securityViolations > 0) {
      const criticalSecurityRatio = severityPatterns.criticalSecurity / violationPatterns.securityViolations;
      if (criticalSecurityRatio > 0.5) {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Security',
          priority: 'CRITICAL',
          message: `Critical security violations detected (${Math.round(criticalSecurityRatio * 100)}% of security violations are critical)`,
          suggestion: 'Immediate security remediation required',
          action: 'Replace all hardcoded secrets with environment variables, implement secrets management, and conduct security audit',
          impact: 'CRITICAL',
          effort: 'HIGH',
          pattern: 'HIGH_CRITICAL_RATIO',
          confidence: 'HIGH'
        });
      } else {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Security',
          priority: 'HIGH',
          message: 'Security violations detected',
          suggestion: 'Implement secrets management with environment variables',
          action: 'Replace hardcoded secrets with environment variables and use .env files',
          impact: 'HIGH',
          effort: 'MEDIUM',
          pattern: 'SECURITY_VIOLATIONS',
          confidence: 'MEDIUM'
        });
      }
    }
    
    // Enhanced Architecture suggestions with file type analysis
    if (violationPatterns.architectureViolations > 0) {
      const backendArchitectureRatio = fileTypePatterns.backendArchitecture / violationPatterns.architectureViolations;
      if (backendArchitectureRatio > 0.8) {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Architecture',
          priority: 'MEDIUM',
          message: 'Backend architecture violations dominate',
          suggestion: 'Review backend architectural patterns',
          action: 'Update backend architectural standards and conduct code review focusing on Controller-Service-Repository pattern',
          impact: 'MEDIUM',
          effort: 'MEDIUM',
          pattern: 'BACKEND_ARCHITECTURE_FOCUS',
          confidence: 'HIGH'
        });
      } else {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Architecture',
          priority: 'MEDIUM',
          message: 'Architecture pattern violations detected',
          suggestion: 'Follow established architectural patterns',
          action: 'Review and update architectural standards documentation',
          impact: 'MEDIUM',
          effort: 'MEDIUM',
          pattern: 'GENERAL_ARCHITECTURE',
          confidence: 'MEDIUM'
        });
      }
    }
    
    // Enhanced Testing suggestions with historical context
    if (violationPatterns.testingViolations > 0) {
      const testingTrend = historicalPatterns.testingTrend;
      if (testingTrend === 'INCREASING') {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Testing',
          priority: 'HIGH',
          message: 'Testing violations are increasing over time',
          suggestion: 'Implement comprehensive testing strategy',
          action: 'Establish testing standards, implement test coverage requirements, and add testing to CI/CD pipeline',
          impact: 'HIGH',
          effort: 'HIGH',
          pattern: 'INCREASING_TREND',
          confidence: 'HIGH'
        });
      } else {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Testing',
          priority: 'MEDIUM',
          message: 'Testing standards violations detected',
          suggestion: 'Improve test coverage and quality',
          action: 'Implement comprehensive testing strategy with proper test methods',
          impact: 'MEDIUM',
          effort: 'HIGH',
          pattern: 'TESTING_VIOLATIONS',
          confidence: 'MEDIUM'
        });
      }
    }
    
    // Enhanced Performance suggestions with baseline comparison
    if (this.metrics.executionTime > 2000) {
      const baselineComparison = this.checkPerformanceBaselines('execution', 'overall', this.metrics.executionTime);
      if (baselineComparison.status === 'ABOVE_BASELINE') {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Performance',
          priority: 'MEDIUM',
          message: 'Compliance checking performance is above baseline',
          suggestion: 'Optimize validation algorithms and file processing',
          action: 'Review and optimize compliance checking performance, consider caching frequently accessed data',
          impact: 'MEDIUM',
          effort: 'MEDIUM',
          pattern: 'PERFORMANCE_DEGRADATION',
          confidence: 'HIGH'
        });
      }
    }
    
    // New: File type specific suggestions
    if (fileTypePatterns.frontendFiles > 0 && fileTypePatterns.frontendViolations > 0) {
      const frontendViolationRatio = fileTypePatterns.frontendViolations / fileTypePatterns.frontendFiles;
      if (frontendViolationRatio > 0.3) {
        suggestions.push({
          type: 'PATTERN_BASED',
          category: 'Frontend',
          priority: 'MEDIUM',
          message: 'High violation rate in frontend files',
          suggestion: 'Focus on frontend standards compliance',
          action: 'Review frontend code against React/TypeScript standards, implement frontend-specific linting rules',
          impact: 'MEDIUM',
          effort: 'MEDIUM',
          pattern: 'FRONTEND_FOCUS',
          confidence: 'MEDIUM'
        });
      }
    }
    
    // New: Recurring pattern suggestions
    if (historicalPatterns.recurringPatterns.length > 0) {
      suggestions.push({
        type: 'PATTERN_BASED',
        category: 'Recurring Issues',
        priority: 'HIGH',
        message: `${historicalPatterns.recurringPatterns.length} recurring violation patterns detected`,
        suggestion: 'Address systemic compliance issues',
        action: 'Review and update standards documentation, implement preventive measures, and conduct team training',
        impact: 'HIGH',
        effort: 'HIGH',
        pattern: 'RECURRING_PATTERNS',
        confidence: 'HIGH'
      });
    }
    
    return suggestions;
  }
  
  // Analyze violation patterns for rule-based suggestions
  analyzeViolationPatterns() {
    const patterns = {
      codeStyleViolations: 0,
      securityViolations: 0,
      architectureViolations: 0,
      testingViolations: 0,
      totalViolations: this.violations.length
    };
    
    this.violations.forEach(violation => {
      switch (violation.category) {
        case 'Code Style':
          patterns.codeStyleViolations++;
          break;
        case 'Security':
          patterns.securityViolations++;
          break;
        case 'Architecture':
          patterns.architectureViolations++;
          break;
        case 'Testing':
          patterns.testingViolations++;
          break;
      }
    });
    
    return patterns;
  }
  
  // Analyze historical patterns for trend-based suggestions
  analyzeHistoricalPatterns() {
    const patterns = {
      testingTrend: 'STABLE',
      recurringPatterns: []
    };
    
    if (this.metrics.historicalData.length >= 3) {
      const recentRuns = this.metrics.historicalData.slice(-3);
      const testingViolations = recentRuns.map(run => run.violations - run.criticalViolations - run.warnings);
      
      // Simple trend analysis
      if (testingViolations[2] > testingViolations[1] && testingViolations[1] > testingViolations[0]) {
        patterns.testingTrend = 'INCREASING';
      } else if (testingViolations[2] < testingViolations[1] && testingViolations[1] < testingViolations[0]) {
        patterns.testingTrend = 'DECREASING';
      }
      
      // Identify recurring patterns
      const violationMessages = this.violations.map(v => v.message);
      const messageCounts = {};
      violationMessages.forEach(message => {
        messageCounts[message] = (messageCounts[message] || 0) + 1;
      });
      
      patterns.recurringPatterns = Object.entries(messageCounts)
        .filter(([message, count]) => count > 2)
        .map(([message, count]) => ({ message, count }));
    }
    
    return patterns;
  }
  
  // Analyze file type patterns for context-aware suggestions
  analyzeFileTypePatterns() {
    const patterns = {
      frontendFiles: 0,
      frontendViolations: 0,
      backendFiles: 0,
      backendViolations: 0,
      backendArchitecture: 0
    };
    
    this.violations.forEach(violation => {
      const filePath = violation.file || '';
      if (filePath.includes('.tsx') || filePath.includes('.ts') || filePath.includes('frontend/')) {
        patterns.frontendFiles++;
        patterns.frontendViolations++;
      } else if (filePath.includes('.java') || filePath.includes('backend/')) {
        patterns.backendFiles++;
        patterns.backendViolations++;
        if (violation.category === 'Architecture') {
          patterns.backendArchitecture++;
        }
      }
    });
    
    return patterns;
  }
  
  // Analyze severity patterns for risk assessment
  analyzeSeverityPatterns() {
    const patterns = {
      criticalSecurity: 0,
      criticalTotal: 0,
      warningTotal: 0
    };
    
    this.violations.forEach(violation => {
      if (violation.type === 'CRITICAL') {
        patterns.criticalTotal++;
        if (violation.category === 'Security') {
          patterns.criticalSecurity++;
        }
      } else if (violation.type === 'WARNING') {
        patterns.warningTotal++;
      }
    });
    
    return patterns;
  }

  // Generate performance baseline analysis
  generatePerformanceBaselineAnalysis() {
    const analysis = {
      fileProcessing: {},
      validationExecution: {},
      overallPerformance: {},
      anomalies: [],
      recommendations: []
    };

    // Analyze file processing performance against baselines
    if (this.metrics.fileProcessingTimes.fileTypes) {
      Object.entries(this.metrics.fileProcessingTimes.fileTypes).forEach(([fileType, stats]) => {
        const baselineCheck = this.checkPerformanceBaselines('fileProcessing', fileType, stats.averageTime);
        analysis.fileProcessing[fileType] = {
          averageTime: stats.averageTime,
          baselineStatus: baselineCheck.status,
          baselineMessage: baselineCheck.message,
          performance: baselineCheck.status === 'NORMAL' ? 'Good' : 
                      baselineCheck.status === 'SLOW' ? 'Needs Attention' : 'Critical'
        };

        // Track anomalies
        if (baselineCheck.status !== 'NORMAL') {
          analysis.anomalies.push({
            type: 'fileProcessing',
            fileType: fileType,
            status: baselineCheck.status,
            message: `${fileType} files processing is ${baselineCheck.status.toLowerCase()}`,
            averageTime: stats.averageTime
          });
        }
      });
    }

    // Analyze validation execution performance against baselines
    Object.entries(this.metrics.validationExecutionTimes).forEach(([validationType, stats]) => {
      const baselineCheck = this.checkPerformanceBaselines('validationExecution', validationType, stats.averageTime);
      analysis.validationExecution[validationType] = {
        averageTime: stats.averageTime,
        baselineStatus: baselineCheck.status,
        baselineMessage: baselineCheck.message,
        performance: baselineCheck.status === 'NORMAL' ? 'Good' : 
                    baselineCheck.status === 'SLOW' ? 'Needs Attention' : 'Critical'
      };

      // Track anomalies
      if (baselineCheck.status !== 'NORMAL') {
        analysis.anomalies.push({
          type: 'validationExecution',
          validationType: validationType,
          status: baselineCheck.status,
          message: `${validationType} validation is ${baselineCheck.status.toLowerCase()}`,
          averageTime: stats.averageTime
        });
      }
    });

    // Analyze overall performance
    const totalExecutionTime = this.metrics.executionTime;
    const filesPerSecond = Object.keys(this.metrics.fileProcessingTimes).length / (totalExecutionTime / 1000);
    const averageComplianceScore = this.complianceScore;

    const overallBaselineCheck = this.checkPerformanceBaselines('overallPerformance', 'totalExecutionTime', totalExecutionTime);
    analysis.overallPerformance = {
      totalExecutionTime: {
        value: totalExecutionTime,
        baselineStatus: overallBaselineCheck.status,
        baselineMessage: overallBaselineCheck.message
      },
      filesPerSecond: {
        value: filesPerSecond,
        baselineStatus: this.checkPerformanceBaselines('overallPerformance', 'filesPerSecond', filesPerSecond).status
      },
      averageComplianceScore: {
        value: averageComplianceScore,
        baselineStatus: this.checkPerformanceBaselines('overallPerformance', 'averageComplianceScore', averageComplianceScore).status
      }
    };

    // Generate recommendations
    analysis.anomalies.forEach(anomaly => {
      if (anomaly.status === 'CRITICAL' || anomaly.status === 'VERY_SLOW') {
        analysis.recommendations.push({
          priority: 'HIGH',
          message: `Immediate attention needed: ${anomaly.message}`,
          action: 'Review and optimize performance'
        });
      } else if (anomaly.status === 'SLOW') {
        analysis.recommendations.push({
          priority: 'MEDIUM',
          message: `Performance optimization recommended: ${anomaly.message}`,
          action: 'Monitor and consider optimization'
        });
      }
    });

    return analysis;
  }

  // Generate performance trend analysis
  generatePerformanceTrendAnalysis() {
    const analysis = {
      fileProcessingTrends: {},
      validationTrends: {},
      overallTrends: {},
      performancePredictions: {},
      recommendations: []
    };

    // Analyze file processing trends
    if (this.metrics.fileProcessingTimes.fileTypes) {
      Object.entries(this.metrics.fileProcessingTimes.fileTypes).forEach(([fileType, stats]) => {
        if (stats.baselineChecks && stats.baselineChecks.length > 0) {
          const recentChecks = stats.baselineChecks.slice(-5);
          const olderChecks = stats.baselineChecks.slice(-10, -5);
          
          const recentAvg = recentChecks.reduce((sum, check) => sum + check.processingTime, 0) / recentChecks.length;
          const olderAvg = olderChecks.length > 0 ? 
            olderChecks.reduce((sum, check) => sum + check.processingTime, 0) / olderChecks.length : recentAvg;
          
          const trend = recentAvg < olderAvg ? 'improving' : recentAvg > olderAvg ? 'declining' : 'stable';
          const changePercent = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
          
          analysis.fileProcessingTrends[fileType] = {
            currentAverage: recentAvg,
            previousAverage: olderAvg,
            trend: trend,
            changePercent: Math.round(changePercent * 100) / 100,
            performance: trend === 'improving' ? 'Good' : trend === 'stable' ? 'Stable' : 'Needs Attention'
          };
        }
      });
    }

    // Analyze validation execution trends
    Object.entries(this.metrics.validationExecutionTimes).forEach(([validationType, stats]) => {
      if (stats.baselineChecks && stats.baselineChecks.length > 0) {
        const recentChecks = stats.baselineChecks.slice(-5);
        const olderChecks = stats.baselineChecks.slice(-10, -5);
        
        const recentAvg = recentChecks.reduce((sum, check) => sum + check.executionTime, 0) / recentChecks.length;
        const olderAvg = olderChecks.length > 0 ? 
          olderChecks.reduce((sum, check) => sum + check.executionTime, 0) / olderChecks.length : recentAvg;
        
        const trend = recentAvg < olderAvg ? 'improving' : recentAvg > olderAvg ? 'declining' : 'stable';
        const changePercent = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
        
        analysis.validationTrends[validationType] = {
          currentAverage: recentAvg,
          previousAverage: olderAvg,
          trend: trend,
          changePercent: Math.round(changePercent * 100) / 100,
          performance: trend === 'improving' ? 'Good' : trend === 'stable' ? 'Stable' : 'Needs Attention'
        };
      }
    });

    // Analyze overall performance trends using historical data
    if (this.metrics.historicalData.length >= 2) {
      const recent = this.metrics.historicalData.slice(-3);
      const older = this.metrics.historicalData.slice(-6, -3);
      
      const recentAvgExecution = recent.reduce((sum, entry) => sum + entry.metrics.executionTime, 0) / recent.length;
      const olderAvgExecution = older.length > 0 ? 
        older.reduce((sum, entry) => sum + entry.metrics.executionTime, 0) / older.length : recentAvgExecution;
      
      const recentAvgCompliance = recent.reduce((sum, entry) => sum + entry.complianceScore, 0) / recent.length;
      const olderAvgCompliance = older.length > 0 ? 
        older.reduce((sum, entry) => sum + entry.complianceScore, 0) / older.length : recentAvgCompliance;
      
      analysis.overallTrends = {
        executionTime: {
          current: recentAvgExecution,
          previous: olderAvgExecution,
          trend: recentAvgExecution < olderAvgExecution ? 'improving' : recentAvgExecution > olderAvgExecution ? 'declining' : 'stable',
          changePercent: olderAvgExecution > 0 ? ((recentAvgExecution - olderAvgExecution) / olderAvgExecution) * 100 : 0
        },
        complianceScore: {
          current: recentAvgCompliance,
          previous: olderAvgCompliance,
          trend: recentAvgCompliance > olderAvgCompliance ? 'improving' : recentAvgCompliance < olderAvgCompliance ? 'declining' : 'stable',
          changePercent: olderAvgCompliance > 0 ? ((recentAvgCompliance - olderAvgCompliance) / olderAvgCompliance) * 100 : 0
        }
      };
    }

    // Generate performance predictions
    analysis.performancePredictions = {
      nextRunExecutionTime: this.predictNextExecutionTime(),
      nextRunComplianceScore: this.predictNextComplianceScore(),
      optimizationPotential: this.calculateOptimizationPotential()
    };

    // Generate trend-based recommendations
    Object.entries(analysis.fileProcessingTrends).forEach(([fileType, trend]) => {
      if (trend.trend === 'declining' && trend.changePercent > 10) {
        analysis.recommendations.push({
          priority: 'HIGH',
          category: 'File Processing',
          message: `${fileType} processing performance is declining by ${Math.abs(trend.changePercent)}%`,
          action: 'Investigate and optimize file processing for this type'
        });
      }
    });

    Object.entries(analysis.validationTrends).forEach(([validationType, trend]) => {
      if (trend.trend === 'declining' && trend.changePercent > 15) {
        analysis.recommendations.push({
          priority: 'MEDIUM',
          category: 'Validation',
          message: `${validationType} validation performance is declining by ${Math.abs(trend.changePercent)}%`,
          action: 'Review and optimize validation logic'
        });
      }
    });

    if (analysis.overallTrends && analysis.overallTrends.executionTime.trend === 'declining') {
      analysis.recommendations.push({
        priority: 'HIGH',
        category: 'Overall Performance',
        message: `Overall execution time is increasing by ${Math.abs(analysis.overallTrends.executionTime.changePercent)}%`,
        action: 'Review system performance and optimize bottlenecks'
      });
    }

    return analysis;
  }

  // Predict next execution time based on trends
  predictNextExecutionTime() {
    if (this.metrics.historicalData.length < 3) {
      return { prediction: 'insufficient_data', confidence: 0 };
    }
    
    const recent = this.metrics.historicalData.slice(-3);
    const executionTimes = recent.map(entry => entry.metrics.executionTime);
    
    // Simple linear prediction
    const avg = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    const trend = executionTimes[executionTimes.length - 1] - executionTimes[0];
    const predicted = avg + (trend / 2);
    
    return {
      prediction: Math.round(predicted),
      confidence: 70,
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
    };
  }

  // Predict next compliance score based on trends
  predictNextComplianceScore() {
    if (this.metrics.historicalData.length < 3) {
      return { prediction: 'insufficient_data', confidence: 0 };
    }
    
    const recent = this.metrics.historicalData.slice(-3);
    const scores = recent.map(entry => entry.complianceScore);
    
    // Simple linear prediction
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const trend = scores[scores.length - 1] - scores[0];
    const predicted = avg + (trend / 2);
    
    return {
      prediction: Math.round(predicted),
      confidence: 75,
      trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable'
    };
  }

  // Calculate optimization potential
  calculateOptimizationPotential() {
    const potential = {
      fileProcessing: 0,
      validation: 0,
      overall: 0,
      totalPotential: 0
    };

    // Calculate file processing optimization potential
    if (this.metrics.fileProcessingTimes.fileTypes) {
      Object.entries(this.metrics.fileProcessingTimes.fileTypes).forEach(([fileType, stats]) => {
        const baseline = this.metrics.performanceBaselines.fileProcessing[fileType];
        if (baseline && stats.averageTime > baseline.normal.avg) {
          potential.fileProcessing += (stats.averageTime - baseline.normal.avg) / stats.averageTime * 100;
        }
      });
      potential.fileProcessing = Math.round(potential.fileProcessing / Object.keys(this.metrics.fileProcessingTimes.fileTypes).length);
    }

    // Calculate validation optimization potential
    Object.entries(this.metrics.validationExecutionTimes).forEach(([validationType, stats]) => {
      const baseline = this.metrics.performanceBaselines.validationExecution[validationType];
      if (baseline && stats.averageTime > baseline.normal.avg) {
        potential.validation += (stats.averageTime - baseline.normal.avg) / stats.averageTime * 100;
      }
    });
    potential.validation = Math.round(potential.validation / Object.keys(this.metrics.validationExecutionTimes).length);

    // Calculate overall optimization potential
    const overallBaseline = this.metrics.performanceBaselines.overallPerformance.totalExecutionTime;
    if (this.metrics.executionTime > overallBaseline.normal.avg) {
      potential.overall = Math.round((this.metrics.executionTime - overallBaseline.normal.avg) / this.metrics.executionTime * 100);
    }

    potential.totalPotential = Math.round((potential.fileProcessing + potential.validation + potential.overall) / 3);
    
    return potential;
  }

  // Generate comprehensive compliance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      runId: this.generateRunId(),
      overallScore: this.complianceScore,
      filesChecked: this.totalChecks,
      criticalIssues: this.violations.filter(v => v.type === 'CRITICAL').length,
      warnings: this.violations.filter(v => v.type === 'WARNING').length,
      executionTime: this.metrics.executionTime,
      violations: this.violations,
      standardsCompliance: this.calculateStandardsEffectiveness(),
      performanceMetrics: this.calculateAverageProcessingTime(),
      analytics: this.generateAnalyticsReport()
    };

    const reportPath = path.join(__dirname, '../reports/compliance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📋 Compliance report saved to: .agent-os/reports/compliance-report.json');

    return report;
  }
}

// CLI execution
if (require.main === module) {
  const checker = new ComplianceChecker();
  const targetPath = process.argv[2] || '.';
  
  const result = checker.validateCodebase(targetPath);
  const report = checker.generateReport();
  
  // Exit with error code if critical violations found
  const criticalViolations = report.violations.filter(v => v.type === 'CRITICAL');
  process.exit(criticalViolations.length > 0 ? 1 : 0);
}

module.exports = ComplianceChecker; 
module.exports = ComplianceChecker; 