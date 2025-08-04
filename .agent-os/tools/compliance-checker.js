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
    // NEW: Generate documentation quality metrics
    const documentationQuality = this.measureDocumentationClarityAndCompleteness();
    const documentationUpdates = this.trackDocumentationUpdateFrequency();
    const documentationGaps = this.identifyDocumentationGaps();
    const documentationImprovementPlans = this.createDocumentationImprovementPlans(
      documentationQuality.clarityScores,
      documentationQuality.completenessScores,
      documentationUpdates.updateMetrics,
      documentationGaps.gaps
    );

    // NEW: Generate smart documentation suggestions
    const smartDocumentationSuggestions = this.suggestDocumentationUpdatesBasedOnUsage(
      this.calculateStandardsEffectiveness(),
      documentationQuality
    );
    const missingDocumentationSections = this.identifyMissingDocumentationSections();
    const documentationTemplates = this.createDocumentationTemplatesBasedOnPatterns();
    const documentationValidation = this.implementDocumentationValidation();

    // NEW: Enhanced prediction engine capabilities
    const violationProbabilities = this.calculateViolationProbabilities();
    const advancedForecasting = this.implementAdvancedTrendBasedForecasting();
    const comprehensiveConfidenceScoring = this.implementComprehensiveConfidenceScoring();

    const analytics = {
      timestamp: new Date().toISOString(),
      executionTime: this.metrics.executionTime,
      averageFileProcessingTime: this.calculateAverageProcessingTime(),
      validationPerformance: this.calculateValidationPerformance(),
      violationTrends: this.analyzeViolationTrends(),
      standardsEffectiveness: this.calculateStandardsEffectiveness(),
      improvementSuggestions: this.generateImprovementSuggestions(),
      ruleBasedSuggestions: this.generateRuleBasedSuggestions(),
      statisticalAnalysis: this.generateStatisticalAnalysis(),
      // NEW: Documentation quality analytics
      documentationQuality: documentationQuality,
      documentationUpdates: documentationUpdates,
      documentationGaps: documentationGaps,
      documentationImprovementPlans: documentationImprovementPlans,
      // NEW: Smart documentation suggestions
      smartDocumentationSuggestions: smartDocumentationSuggestions,
      missingDocumentationSections: missingDocumentationSections,
      documentationTemplates: documentationTemplates,
      documentationValidation: documentationValidation,
      // NEW: Enhanced prediction engine
      violationProbabilities: violationProbabilities,
      advancedForecasting: advancedForecasting,
      comprehensiveConfidenceScoring: comprehensiveConfidenceScoring
    };

    // NEW: Enhanced reporting capabilities
    analytics.drillDownCapabilities = this.implementDrillDownCapabilities(analytics);
    analytics.exportableReports = this.createExportableReports(analytics);

    // NEW: Enhanced actionable insights
    const prioritizedActionItems = this.createPrioritizedActionItems();
    analytics.prioritizedActionItems = prioritizedActionItems;
    analytics.impactAssessment = this.implementImpactAssessmentForSuggestions(prioritizedActionItems.actionItems);
    analytics.suggestionValidation = this.buildSuggestionValidationSystem(prioritizedActionItems.actionItems);

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
    
    // NEW: Enhanced standards effectiveness analysis
    const unusedOrObsolete = this.identifyUnusedOrObsoleteStandards(standardsRanking, mostReferenced);
    const clarityAndUsability = this.measureStandardsClarityAndUsability(standardsRanking, mostReferenced);
    const effectivenessAnalysis = this.measureStandardsEffectiveness(standardsRanking, mostReferenced);
    const improvementSuggestions = this.createStandardsImprovementSuggestions(
      standardsRanking, 
      mostReferenced, 
      unusedOrObsolete.unusedStandards, 
      unusedOrObsolete.obsoleteStandards, 
      clarityAndUsability.clarityMetrics, 
      clarityAndUsability.usabilityMetrics
    );
    const optimizationSuggestions = this.createStandardsOptimizationSuggestions(
      effectivenessAnalysis.effectivenessMetrics,
      effectivenessAnalysis.optimizationOpportunities
    );

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
      unusedOrObsolete: unusedOrObsolete,
      clarityAndUsability: clarityAndUsability,
      effectivenessAnalysis: effectivenessAnalysis,
      improvementSuggestions: improvementSuggestions,
      optimizationSuggestions: optimizationSuggestions,
      summary: {
        totalStandards: standardsRanking.length,
        criticalStandards: standardsRanking.filter(s => s.status === 'CRITICAL').length,
        warningStandards: standardsRanking.filter(s => s.status === 'WARNING').length,
        goodStandards: standardsRanking.filter(s => s.status === 'GOOD').length,
        mostViolated: standardsRanking.slice(0, 3),
        leastViolated: standardsRanking.slice(-3).reverse(),
        mostReferenced: mostReferenced.slice(0, 3),
        totalReferences: mostReferenced.reduce((sum, s) => sum + s.referenceCount, 0),
        // NEW: Enhanced summary metrics
        totalUnused: unusedOrObsolete.summary.totalUnused,
        totalObsolete: unusedOrObsolete.summary.totalObsolete,
        clearStandards: clarityAndUsability.summary.clearStandards,
        unclearStandards: clarityAndUsability.summary.unclearStandards,
        usableStandards: clarityAndUsability.summary.usableStandards,
        poorUsabilityStandards: clarityAndUsability.summary.poorUsabilityStandards,
        totalImprovementSuggestions: improvementSuggestions.summary.totalSuggestions,
        // NEW: Enhanced effectiveness metrics
        highlyEffective: effectivenessAnalysis.summary.highlyEffective,
        effective: effectivenessAnalysis.summary.effective,
        needsImprovement: effectivenessAnalysis.summary.needsImprovement,
        ineffective: effectivenessAnalysis.summary.ineffective,
        totalOptimizationOpportunities: effectivenessAnalysis.summary.totalOptimizationOpportunities,
        averageEffectivenessScore: effectivenessAnalysis.summary.averageEffectivenessScore,
        totalOptimizationSuggestions: optimizationSuggestions.summary.totalSuggestions
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

  // NEW: Identify unused or obsolete standards
  identifyUnusedOrObsoleteStandards(standardsRanking, referenceTracking) {
    const unusedStandards = [];
    const obsoleteStandards = [];
    const standardsToReview = [];
    
    // Get all available standards from the standards directory
    const availableStandards = this.getAvailableStandards();
    
    // Analyze each available standard
    availableStandards.forEach(standardName => {
      const referenceData = referenceTracking.find(ref => ref.name === standardName);
      const rankingData = standardsRanking.find(rank => rank.name === standardName);
      
      // Check for unused standards (no references in 30+ days)
      if (!referenceData || referenceData.referenceCount === 0) {
        const lastReferenced = referenceData ? new Date(referenceData.lastReferenced) : null;
        const daysSinceLastReference = lastReferenced ? Math.floor((Date.now() - lastReferenced.getTime()) / (1000 * 60 * 60 * 24)) : 999;
        
        if (daysSinceLastReference > 30) {
          unusedStandards.push({
            name: standardName,
            type: 'UNUSED',
            daysSinceLastReference: daysSinceLastReference,
            reason: 'No references in over 30 days',
            recommendation: 'Consider removing or updating this standard',
            priority: daysSinceLastReference > 90 ? 'HIGH' : daysSinceLastReference > 60 ? 'MEDIUM' : 'LOW'
          });
        }
      }
      
      // Check for obsolete standards (high violation rate with low usage)
      if (rankingData && referenceData) {
        const violationRate = rankingData.violationRate;
        const usageFrequency = referenceData.usageFrequency;
        
        if (violationRate > 50 && usageFrequency === 'LOW') {
          obsoleteStandards.push({
            name: standardName,
            type: 'OBSOLETE',
            violationRate: violationRate,
            usageFrequency: usageFrequency,
            reason: 'High violation rate with low adoption suggests outdated standard',
            recommendation: 'Review and update or deprecate this standard',
            priority: violationRate > 70 ? 'HIGH' : 'MEDIUM'
          });
        }
      }
      
      // Check for standards needing review (inconsistent patterns)
      if (rankingData && referenceData) {
        const violationRate = rankingData.violationRate;
        const usageFrequency = referenceData.usageFrequency;
        
        // High violation rate with medium usage suggests unclear standards
        if (violationRate > 35 && usageFrequency === 'MEDIUM') {
          standardsToReview.push({
            name: standardName,
            type: 'NEEDS_REVIEW',
            violationRate: violationRate,
            usageFrequency: usageFrequency,
            reason: 'High violation rate with moderate usage suggests unclear standards',
            recommendation: 'Clarify and improve this standard',
            priority: violationRate > 50 ? 'HIGH' : 'MEDIUM'
          });
        }
      }
    });
    
    return {
      unusedStandards: unusedStandards,
      obsoleteStandards: obsoleteStandards,
      standardsToReview: standardsToReview,
      summary: {
        totalUnused: unusedStandards.length,
        totalObsolete: obsoleteStandards.length,
        totalToReview: standardsToReview.length,
        highPriorityUnused: unusedStandards.filter(s => s.priority === 'HIGH').length,
        highPriorityObsolete: obsoleteStandards.filter(s => s.priority === 'HIGH').length,
        highPriorityReview: standardsToReview.filter(s => s.priority === 'HIGH').length
      }
    };
  }

  // NEW: Get available standards from the standards directory
  getAvailableStandards() {
    const standardsPath = path.join(__dirname, '../standards');
    const standards = [];
    
    try {
      const files = fs.readdirSync(standardsPath);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          standards.push(file.replace('.md', ''));
        }
      });
    } catch (error) {
      console.warn('⚠️ Could not read standards directory:', error.message);
    }
    
    return standards;
  }

  // NEW: Measure standards clarity and usability
  measureStandardsClarityAndUsability(standardsRanking, referenceTracking) {
    const clarityMetrics = {};
    const usabilityMetrics = {};
    
    // Analyze clarity based on violation patterns
    standardsRanking.forEach(standard => {
      const referenceData = referenceTracking.find(ref => ref.name === standard.name);
      
      if (referenceData) {
        // Clarity score based on violation rate vs usage
        let clarityScore = 100;
        let clarityFactors = [];
        
        // High violation rate with high usage suggests unclear standards
        if (standard.violationRate > 25 && referenceData.usageFrequency === 'HIGH') {
          clarityScore -= 30;
          clarityFactors.push('High violation rate despite frequent usage');
        }
        
        // High violation rate with low usage suggests unclear standards
        if (standard.violationRate > 30 && referenceData.usageFrequency === 'LOW') {
          clarityScore -= 25;
          clarityFactors.push('High violation rate with low adoption');
        }
        
        // Usability score based on adoption and effectiveness
        let usabilityScore = 100;
        let usabilityFactors = [];
        
        // Low usage suggests poor usability
        if (referenceData.usageFrequency === 'LOW') {
          usabilityScore -= 40;
          usabilityFactors.push('Low adoption rate');
        }
        
        // High violation rate suggests poor usability
        if (standard.violationRate > 30) {
          usabilityScore -= 30;
          usabilityFactors.push('High violation rate');
        }
        
        // Low reference count suggests poor usability
        if (referenceData.referenceCount < 5) {
          usabilityScore -= 20;
          usabilityFactors.push('Low reference count');
        }
        
        clarityMetrics[standard.name] = {
          score: Math.max(0, clarityScore),
          factors: clarityFactors,
          status: clarityScore > 80 ? 'CLEAR' : clarityScore > 60 ? 'NEEDS_IMPROVEMENT' : 'UNCLEAR',
          recommendation: clarityScore > 80 ? 'Standard is clear' : 
                        clarityScore > 60 ? 'Clarify documentation' : 'Rewrite standard'
        };
        
        usabilityMetrics[standard.name] = {
          score: Math.max(0, usabilityScore),
          factors: usabilityFactors,
          status: usabilityScore > 80 ? 'USABLE' : usabilityScore > 60 ? 'NEEDS_IMPROVEMENT' : 'POOR_USABILITY',
          recommendation: usabilityScore > 80 ? 'Standard is usable' : 
                        usabilityScore > 60 ? 'Improve usability' : 'Redesign standard'
        };
      }
    });
    
    return {
      clarityMetrics: clarityMetrics,
      usabilityMetrics: usabilityMetrics,
      summary: {
        clearStandards: Object.values(clarityMetrics).filter(m => m.status === 'CLEAR').length,
        unclearStandards: Object.values(clarityMetrics).filter(m => m.status === 'UNCLEAR').length,
        usableStandards: Object.values(usabilityMetrics).filter(m => m.status === 'USABLE').length,
        poorUsabilityStandards: Object.values(usabilityMetrics).filter(m => m.status === 'POOR_USABILITY').length
      }
    };
  }

  // NEW: Create standards improvement suggestions
  createStandardsImprovementSuggestions(standardsRanking, referenceTracking, unusedStandards, obsoleteStandards, clarityMetrics, usabilityMetrics) {
    const suggestions = [];
    
    // Suggestions for unused standards
    unusedStandards.forEach(standard => {
      suggestions.push({
        type: 'REMOVE_OR_UPDATE',
        standard: standard.name,
        priority: standard.priority,
        reason: standard.reason,
        action: standard.recommendation,
        impact: 'MEDIUM',
        effort: 'LOW'
      });
    });
    
    // Suggestions for obsolete standards
    obsoleteStandards.forEach(standard => {
      suggestions.push({
        type: 'UPDATE_OR_DEPRECATE',
        standard: standard.name,
        priority: standard.priority,
        reason: standard.reason,
        action: standard.recommendation,
        impact: 'HIGH',
        effort: 'MEDIUM'
      });
    });
    
    // Suggestions for unclear standards
    Object.entries(clarityMetrics).forEach(([standardName, metrics]) => {
      if (metrics.status === 'UNCLEAR') {
        suggestions.push({
          type: 'CLARIFY_STANDARD',
          standard: standardName,
          priority: 'HIGH',
          reason: 'Standard is unclear based on violation patterns',
          action: 'Rewrite standard with clear examples and guidelines',
          impact: 'HIGH',
          effort: 'MEDIUM'
        });
      }
    });
    
    // Suggestions for poor usability standards
    Object.entries(usabilityMetrics).forEach(([standardName, metrics]) => {
      if (metrics.status === 'POOR_USABILITY') {
        suggestions.push({
          type: 'IMPROVE_USABILITY',
          standard: standardName,
          priority: 'MEDIUM',
          reason: 'Standard has poor usability based on adoption patterns',
          action: 'Redesign standard for better adoption and effectiveness',
          impact: 'MEDIUM',
          effort: 'HIGH'
        });
      }
    });
    
    return {
      suggestions: suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        highPriority: suggestions.filter(s => s.priority === 'HIGH').length,
        mediumPriority: suggestions.filter(s => s.priority === 'MEDIUM').length,
        lowPriority: suggestions.filter(s => s.priority === 'LOW').length,
        removeOrUpdate: suggestions.filter(s => s.type === 'REMOVE_OR_UPDATE').length,
        updateOrDeprecate: suggestions.filter(s => s.type === 'UPDATE_OR_DEPRECATE').length,
        clarifyStandard: suggestions.filter(s => s.type === 'CLARIFY_STANDARD').length,
        improveUsability: suggestions.filter(s => s.type === 'IMPROVE_USABILITY').length
      }
    };
  }

  // NEW: Measure standards effectiveness with detailed analysis
  measureStandardsEffectiveness(standardsRanking, referenceTracking) {
    const effectivenessMetrics = {};
    const optimizationOpportunities = [];
    
    standardsRanking.forEach(standard => {
      const referenceData = referenceTracking.find(ref => ref.name === standard.name);
      
      if (referenceData) {
        // Calculate effectiveness score based on multiple factors
        let effectivenessScore = 100;
        let effectivenessFactors = [];
        
        // Factor 1: Violation rate impact
        if (standard.violationRate > 30) {
          effectivenessScore -= 40;
          effectivenessFactors.push(`High violation rate (${standard.violationRate}%)`);
        } else if (standard.violationRate > 20) {
          effectivenessScore -= 20;
          effectivenessFactors.push(`Moderate violation rate (${standard.violationRate}%)`);
        }
        
        // Factor 2: Usage frequency impact
        if (referenceData.usageFrequency === 'LOW') {
          effectivenessScore -= 30;
          effectivenessFactors.push('Low adoption rate');
        } else if (referenceData.usageFrequency === 'MEDIUM') {
          effectivenessScore -= 10;
          effectivenessFactors.push('Moderate adoption rate');
        }
        
        // Factor 3: Reference count impact
        if (referenceData.referenceCount < 3) {
          effectivenessScore -= 20;
          effectivenessFactors.push('Low reference count');
        } else if (referenceData.referenceCount < 10) {
          effectivenessScore -= 10;
          effectivenessFactors.push('Moderate reference count');
        }
        
        // Factor 4: Recent usage impact
        const lastReferenced = new Date(referenceData.lastReferenced);
        const daysSinceLastReference = Math.floor((Date.now() - lastReferenced.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastReference > 30) {
          effectivenessScore -= 15;
          effectivenessFactors.push(`Not referenced recently (${daysSinceLastReference} days ago)`);
        }
        
        effectivenessMetrics[standard.name] = {
          score: Math.max(0, effectivenessScore),
          factors: effectivenessFactors,
          status: effectivenessScore > 80 ? 'HIGHLY_EFFECTIVE' : 
                  effectivenessScore > 60 ? 'EFFECTIVE' : 
                  effectivenessScore > 40 ? 'NEEDS_IMPROVEMENT' : 'INEFFECTIVE',
          violationRate: standard.violationRate,
          usageFrequency: referenceData.usageFrequency,
          referenceCount: referenceData.referenceCount,
          daysSinceLastReference: daysSinceLastReference,
          recommendation: effectivenessScore > 80 ? 'Standard is highly effective' :
                        effectivenessScore > 60 ? 'Standard is effective but could be improved' :
                        effectivenessScore > 40 ? 'Standard needs significant improvement' : 'Standard is ineffective and needs redesign'
        };
        
        // Identify optimization opportunities
        if (effectivenessScore < 60) {
          optimizationOpportunities.push({
            standard: standard.name,
            currentScore: effectivenessScore,
            factors: effectivenessFactors,
            priority: effectivenessScore < 30 ? 'HIGH' : effectivenessScore < 50 ? 'MEDIUM' : 'LOW',
            optimizationType: effectivenessScore < 30 ? 'REDESIGN' : effectivenessScore < 50 ? 'IMPROVE' : 'ENHANCE',
            estimatedImpact: effectivenessScore < 30 ? 'HIGH' : effectivenessScore < 50 ? 'MEDIUM' : 'LOW',
            estimatedEffort: effectivenessScore < 30 ? 'HIGH' : effectivenessScore < 50 ? 'MEDIUM' : 'LOW'
          });
        }
      }
    });
    
    return {
      effectivenessMetrics: effectivenessMetrics,
      optimizationOpportunities: optimizationOpportunities,
      summary: {
        highlyEffective: Object.values(effectivenessMetrics).filter(m => m.status === 'HIGHLY_EFFECTIVE').length,
        effective: Object.values(effectivenessMetrics).filter(m => m.status === 'EFFECTIVE').length,
        needsImprovement: Object.values(effectivenessMetrics).filter(m => m.status === 'NEEDS_IMPROVEMENT').length,
        ineffective: Object.values(effectivenessMetrics).filter(m => m.status === 'INEFFECTIVE').length,
        totalOptimizationOpportunities: optimizationOpportunities.length,
        highPriorityOptimizations: optimizationOpportunities.filter(o => o.priority === 'HIGH').length,
        averageEffectivenessScore: Math.round(
          Object.values(effectivenessMetrics).reduce((sum, m) => sum + m.score, 0) / Object.values(effectivenessMetrics).length
        )
      }
    };
  }

  // NEW: Create standards optimization suggestions
  createStandardsOptimizationSuggestions(effectivenessMetrics, optimizationOpportunities) {
    const suggestions = [];
    
    // High-priority optimization suggestions
    optimizationOpportunities.filter(o => o.priority === 'HIGH').forEach(opportunity => {
      suggestions.push({
        type: 'URGENT_OPTIMIZATION',
        standard: opportunity.standard,
        priority: 'CRITICAL',
        reason: `Standard is highly ineffective (score: ${opportunity.currentScore})`,
        action: `Redesign ${opportunity.standard} for better effectiveness`,
        impact: 'HIGH',
        effort: 'HIGH',
        estimatedImprovement: Math.min(100, opportunity.currentScore + 40)
      });
    });
    
    // Medium-priority optimization suggestions
    optimizationOpportunities.filter(o => o.priority === 'MEDIUM').forEach(opportunity => {
      suggestions.push({
        type: 'IMPROVE_STANDARD',
        standard: opportunity.standard,
        priority: 'HIGH',
        reason: `Standard needs improvement (score: ${opportunity.currentScore})`,
        action: `Improve ${opportunity.standard} documentation and clarity`,
        impact: 'MEDIUM',
        effort: 'MEDIUM',
        estimatedImprovement: Math.min(100, opportunity.currentScore + 25)
      });
    });
    
    // Low-priority enhancement suggestions
    optimizationOpportunities.filter(o => o.priority === 'LOW').forEach(opportunity => {
      suggestions.push({
        type: 'ENHANCE_STANDARD',
        standard: opportunity.standard,
        priority: 'MEDIUM',
        reason: `Standard could be enhanced (score: ${opportunity.currentScore})`,
        action: `Enhance ${opportunity.standard} with better examples and guidelines`,
        impact: 'LOW',
        effort: 'LOW',
        estimatedImprovement: Math.min(100, opportunity.currentScore + 15)
      });
    });
    
    // Effectiveness-based suggestions
    Object.entries(effectivenessMetrics).forEach(([standardName, metrics]) => {
      if (metrics.status === 'INEFFECTIVE') {
        suggestions.push({
          type: 'REDESIGN_STANDARD',
          standard: standardName,
          priority: 'HIGH',
          reason: `Standard is ineffective (${metrics.violationRate}% violation rate, ${metrics.usageFrequency} usage)`,
          action: `Completely redesign ${standardName} for better adoption and compliance`,
          impact: 'HIGH',
          effort: 'HIGH',
          estimatedImprovement: Math.min(100, metrics.score + 50)
        });
      } else if (metrics.status === 'NEEDS_IMPROVEMENT') {
        suggestions.push({
          type: 'IMPROVE_STANDARD',
          standard: standardName,
          priority: 'MEDIUM',
          reason: `Standard needs improvement (${metrics.violationRate}% violation rate)`,
          action: `Improve ${standardName} documentation and provide training`,
          impact: 'MEDIUM',
          effort: 'MEDIUM',
          estimatedImprovement: Math.min(100, metrics.score + 30)
        });
      }
    });
    
    return {
      suggestions: suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        criticalPriority: suggestions.filter(s => s.priority === 'CRITICAL').length,
        highPriority: suggestions.filter(s => s.priority === 'HIGH').length,
        mediumPriority: suggestions.filter(s => s.priority === 'MEDIUM').length,
        urgentOptimizations: suggestions.filter(s => s.type === 'URGENT_OPTIMIZATION').length,
        redesignStandards: suggestions.filter(s => s.type === 'REDESIGN_STANDARD').length,
        improveStandards: suggestions.filter(s => s.type === 'IMPROVE_STANDARD').length,
        enhanceStandards: suggestions.filter(s => s.type === 'ENHANCE_STANDARD').length
      }
    };
  }

  // NEW: Measure documentation clarity and completeness
  measureDocumentationClarityAndCompleteness() {
    const documentationMetrics = {};
    const clarityScores = {};
    const completenessScores = {};
    
    // Analyze all documentation files in .agent-os
    const documentationFiles = this.getDocumentationFiles();
    
    documentationFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.md');
        
        // Calculate clarity score based on content analysis
        let clarityScore = 100;
        let clarityFactors = [];
        
        // Factor 1: Section structure (headers)
        const headers = content.match(/^#{1,6}\s+.+$/gm) || [];
        if (headers.length < 3) {
          clarityScore -= 20;
          clarityFactors.push('Poor section structure');
        } else if (headers.length < 5) {
          clarityScore -= 10;
          clarityFactors.push('Limited section structure');
        }
        
        // Factor 2: Code examples
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        if (codeBlocks.length === 0) {
          clarityScore -= 25;
          clarityFactors.push('No code examples');
        } else if (codeBlocks.length < 2) {
          clarityScore -= 10;
          clarityFactors.push('Limited code examples');
        }
        
        // Factor 3: Lists and bullet points
        const lists = content.match(/^[\s]*[-*+]\s+.+$/gm) || [];
        if (lists.length < 5) {
          clarityScore -= 15;
          clarityFactors.push('Limited structured content');
        }
        
        // Factor 4: Links and references
        const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
        if (links.length === 0) {
          clarityScore -= 10;
          clarityFactors.push('No external references');
        }
        
        // Calculate completeness score
        let completenessScore = 100;
        let completenessFactors = [];
        
        // Factor 1: File size (content length)
        const contentLength = content.length;
        if (contentLength < 500) {
          completenessScore -= 40;
          completenessFactors.push('Very short content');
        } else if (contentLength < 1000) {
          completenessScore -= 20;
          completenessFactors.push('Short content');
        }
        
        // Factor 2: Required sections
        const requiredSections = ['overview', 'requirements', 'implementation', 'examples'];
        const hasRequiredSections = requiredSections.some(section => 
          content.toLowerCase().includes(section)
        );
        if (!hasRequiredSections) {
          completenessScore -= 30;
          completenessFactors.push('Missing required sections');
        }
        
        // Factor 3: Last update
        const stats = fs.statSync(filePath);
        const daysSinceUpdate = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate > 90) {
          completenessScore -= 20;
          completenessFactors.push('Outdated content');
        } else if (daysSinceUpdate > 30) {
          completenessScore -= 10;
          completenessFactors.push('Content may be outdated');
        }
        
        clarityScores[fileName] = {
          score: Math.max(0, clarityScore),
          factors: clarityFactors,
          status: clarityScore > 80 ? 'CLEAR' : clarityScore > 60 ? 'NEEDS_IMPROVEMENT' : 'UNCLEAR',
          recommendation: clarityScore > 80 ? 'Documentation is clear' : 
                        clarityScore > 60 ? 'Improve clarity with better structure and examples' : 'Rewrite documentation'
        };
        
        completenessScores[fileName] = {
          score: Math.max(0, completenessScore),
          factors: completenessFactors,
          status: completenessScore > 80 ? 'COMPLETE' : completenessScore > 60 ? 'NEEDS_IMPROVEMENT' : 'INCOMPLETE',
          recommendation: completenessScore > 80 ? 'Documentation is complete' : 
                        completenessScore > 60 ? 'Add missing sections and content' : 'Significantly expand documentation',
          lastUpdated: daysSinceUpdate,
          contentLength: contentLength
        };
        
      } catch (error) {
        console.warn(`⚠️ Could not analyze documentation file: ${filePath}`, error.message);
      }
    });
    
    return {
      clarityScores: clarityScores,
      completenessScores: completenessScores,
      summary: {
        clearDocumentation: Object.values(clarityScores).filter(s => s.status === 'CLEAR').length,
        unclearDocumentation: Object.values(clarityScores).filter(s => s.status === 'UNCLEAR').length,
        completeDocumentation: Object.values(completenessScores).filter(s => s.status === 'COMPLETE').length,
        incompleteDocumentation: Object.values(completenessScores).filter(s => s.status === 'INCOMPLETE').length,
        averageClarityScore: Math.round(
          Object.values(clarityScores).reduce((sum, s) => sum + s.score, 0) / Object.values(clarityScores).length
        ),
        averageCompletenessScore: Math.round(
          Object.values(completenessScores).reduce((sum, s) => sum + s.score, 0) / Object.values(completenessScores).length
        )
      }
    };
  }

  // NEW: Track documentation update frequency
  trackDocumentationUpdateFrequency() {
    const updateMetrics = {};
    const documentationFiles = this.getDocumentationFiles();
    
    documentationFiles.forEach(filePath => {
      try {
        const stats = fs.statSync(filePath);
        const fileName = path.basename(filePath, '.md');
        const daysSinceUpdate = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
        
        let updateFrequency = 'RECENT';
        let updateStatus = 'GOOD';
        let recommendation = 'Documentation is up to date';
        
        if (daysSinceUpdate > 90) {
          updateFrequency = 'STALE';
          updateStatus = 'CRITICAL';
          recommendation = 'Documentation is outdated and needs immediate update';
        } else if (daysSinceUpdate > 60) {
          updateFrequency = 'AGING';
          updateStatus = 'WARNING';
          recommendation = 'Documentation should be updated soon';
        } else if (daysSinceUpdate > 30) {
          updateFrequency = 'MODERATE';
          updateStatus = 'GOOD';
          recommendation = 'Documentation is reasonably current';
        }
        
        updateMetrics[fileName] = {
          daysSinceUpdate: daysSinceUpdate,
          updateFrequency: updateFrequency,
          updateStatus: updateStatus,
          recommendation: recommendation,
          lastModified: stats.mtime.toISOString()
        };
        
      } catch (error) {
        console.warn(`⚠️ Could not track update frequency for: ${filePath}`, error.message);
      }
    });
    
    return {
      updateMetrics: updateMetrics,
      summary: {
        recentUpdates: Object.values(updateMetrics).filter(m => m.updateFrequency === 'RECENT').length,
        moderateUpdates: Object.values(updateMetrics).filter(m => m.updateFrequency === 'MODERATE').length,
        agingUpdates: Object.values(updateMetrics).filter(m => m.updateFrequency === 'AGING').length,
        staleUpdates: Object.values(updateMetrics).filter(m => m.updateFrequency === 'STALE').length,
        criticalUpdates: Object.values(updateMetrics).filter(m => m.updateStatus === 'CRITICAL').length,
        averageDaysSinceUpdate: Math.round(
          Object.values(updateMetrics).reduce((sum, m) => sum + m.daysSinceUpdate, 0) / Object.values(updateMetrics).length
        )
      }
    };
  }

  // NEW: Identify documentation gaps
  identifyDocumentationGaps() {
    const gaps = [];
    const documentationFiles = this.getDocumentationFiles();
    const existingDocs = documentationFiles.map(f => path.basename(f, '.md'));
    
    // Define expected documentation based on standards
    const expectedDocs = [
      'tech-stack', 'code-style', 'best-practices', 'security-compliance',
      'ci-cd-strategy', 'testing-strategy', 'enforcement', 'mission',
      'architecture', 'deployment', 'monitoring', 'troubleshooting'
    ];
    
    // Find missing documentation
    expectedDocs.forEach(expectedDoc => {
      if (!existingDocs.includes(expectedDoc)) {
        gaps.push({
          type: 'MISSING_DOCUMENTATION',
          document: expectedDoc,
          priority: 'HIGH',
          reason: 'Expected documentation is missing',
          action: `Create ${expectedDoc}.md documentation`,
          impact: 'HIGH',
          effort: 'MEDIUM'
        });
      }
    });
    
    // Check for incomplete documentation
    documentationFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.md');
        
        // Check for minimal content
        if (content.length < 500) {
          gaps.push({
            type: 'INCOMPLETE_DOCUMENTATION',
            document: fileName,
            priority: 'MEDIUM',
            reason: 'Documentation is too short',
            action: `Expand ${fileName}.md with more detailed content`,
            impact: 'MEDIUM',
            effort: 'LOW'
          });
        }
        
        // Check for missing sections
        const requiredSections = ['overview', 'requirements', 'implementation'];
        const missingSections = requiredSections.filter(section => 
          !content.toLowerCase().includes(section)
        );
        
        if (missingSections.length > 0) {
          gaps.push({
            type: 'MISSING_SECTIONS',
            document: fileName,
            priority: 'MEDIUM',
            reason: `Missing sections: ${missingSections.join(', ')}`,
            action: `Add missing sections to ${fileName}.md`,
            impact: 'MEDIUM',
            effort: 'LOW'
          });
        }
        
      } catch (error) {
        console.warn(`⚠️ Could not analyze documentation gaps for: ${filePath}`, error.message);
      }
    });
    
    return {
      gaps: gaps,
      summary: {
        totalGaps: gaps.length,
        missingDocumentation: gaps.filter(g => g.type === 'MISSING_DOCUMENTATION').length,
        incompleteDocumentation: gaps.filter(g => g.type === 'INCOMPLETE_DOCUMENTATION').length,
        missingSections: gaps.filter(g => g.type === 'MISSING_SECTIONS').length,
        highPriorityGaps: gaps.filter(g => g.priority === 'HIGH').length,
        mediumPriorityGaps: gaps.filter(g => g.priority === 'MEDIUM').length
      }
    };
  }

  // NEW: Create documentation improvement plans
  createDocumentationImprovementPlans(clarityScores, completenessScores, updateMetrics, gaps) {
    const improvementPlans = [];
    
    // Plans for unclear documentation
    Object.entries(clarityScores).forEach(([docName, scores]) => {
      if (scores.status === 'UNCLEAR') {
        improvementPlans.push({
          type: 'IMPROVE_CLARITY',
          document: docName,
          priority: 'HIGH',
          reason: `Documentation is unclear (score: ${scores.score})`,
          action: 'Rewrite documentation with better structure and examples',
          impact: 'HIGH',
          effort: 'MEDIUM',
          estimatedImprovement: Math.min(100, scores.score + 40)
        });
      }
    });
    
    // Plans for incomplete documentation
    Object.entries(completenessScores).forEach(([docName, scores]) => {
      if (scores.status === 'INCOMPLETE') {
        improvementPlans.push({
          type: 'COMPLETE_DOCUMENTATION',
          document: docName,
          priority: 'MEDIUM',
          reason: `Documentation is incomplete (score: ${scores.score})`,
          action: 'Add missing sections and expand content',
          impact: 'MEDIUM',
          effort: 'LOW',
          estimatedImprovement: Math.min(100, scores.score + 30)
        });
      }
    });
    
    // Plans for outdated documentation
    Object.entries(updateMetrics).forEach(([docName, metrics]) => {
      if (metrics.updateStatus === 'CRITICAL') {
        improvementPlans.push({
          type: 'UPDATE_DOCUMENTATION',
          document: docName,
          priority: 'HIGH',
          reason: `Documentation is outdated (${metrics.daysSinceUpdate} days old)`,
          action: 'Update documentation with current information',
          impact: 'HIGH',
          effort: 'MEDIUM',
          estimatedImprovement: 85
        });
      }
    });
    
    // Plans for missing documentation
    gaps.filter(g => g.type === 'MISSING_DOCUMENTATION').forEach(gap => {
      improvementPlans.push({
        type: 'CREATE_DOCUMENTATION',
        document: gap.document,
        priority: 'HIGH',
        reason: gap.reason,
        action: gap.action,
        impact: 'HIGH',
        effort: 'MEDIUM',
        estimatedImprovement: 90
      });
    });
    
    return {
      plans: improvementPlans,
      summary: {
        totalPlans: improvementPlans.length,
        highPriority: improvementPlans.filter(p => p.priority === 'HIGH').length,
        mediumPriority: improvementPlans.filter(p => p.priority === 'MEDIUM').length,
        improveClarity: improvementPlans.filter(p => p.type === 'IMPROVE_CLARITY').length,
        completeDocumentation: improvementPlans.filter(p => p.type === 'COMPLETE_DOCUMENTATION').length,
        updateDocumentation: improvementPlans.filter(p => p.type === 'UPDATE_DOCUMENTATION').length,
        createDocumentation: improvementPlans.filter(p => p.type === 'CREATE_DOCUMENTATION').length
      }
    };
  }

  // NEW: Get documentation files from .agent-os directory
  getDocumentationFiles() {
    const agentOsPath = path.join(__dirname, '..');
    const documentationFiles = [];
    
    try {
      const files = glob.sync('**/*.md', { cwd: agentOsPath, ignore: ['node_modules/**'] });
      files.forEach(file => {
        const fullPath = path.join(agentOsPath, file);
        documentationFiles.push(fullPath);
      });
    } catch (error) {
      console.warn('⚠️ Could not read documentation files:', error.message);
    }
    
    return documentationFiles;
  }

  // NEW: Suggest documentation updates based on usage
  suggestDocumentationUpdatesBasedOnUsage(standardsEffectiveness, documentationQuality) {
    const suggestions = [];
    
    // Analyze standards effectiveness to suggest documentation updates
    if (standardsEffectiveness.effectivenessAnalysis) {
      Object.entries(standardsEffectiveness.effectivenessAnalysis.effectivenessMetrics).forEach(([standardName, metrics]) => {
        if (metrics.status === 'INEFFECTIVE' || metrics.status === 'NEEDS_IMPROVEMENT') {
          suggestions.push({
            type: 'UPDATE_DOCUMENTATION_BASED_ON_USAGE',
            document: `${standardName}.md`,
            priority: metrics.status === 'INEFFECTIVE' ? 'HIGH' : 'MEDIUM',
            reason: `Standard has ${metrics.violationRate}% violation rate and ${metrics.usageFrequency} usage`,
            action: `Update ${standardName}.md to address compliance issues and improve clarity`,
            impact: 'HIGH',
            effort: 'MEDIUM',
            estimatedImprovement: Math.min(100, metrics.score + 30)
          });
        }
      });
    }
    
    // Analyze documentation quality to suggest updates
    Object.entries(documentationQuality.clarityScores).forEach(([docName, scores]) => {
      if (scores.status === 'UNCLEAR') {
        suggestions.push({
          type: 'IMPROVE_DOCUMENTATION_CLARITY',
          document: `${docName}.md`,
          priority: 'HIGH',
          reason: `Documentation is unclear (score: ${scores.score})`,
          action: `Rewrite ${docName}.md with better structure and examples`,
          impact: 'HIGH',
          effort: 'MEDIUM',
          estimatedImprovement: Math.min(100, scores.score + 40)
        });
      }
    });
    
    Object.entries(documentationQuality.completenessScores).forEach(([docName, scores]) => {
      if (scores.status === 'INCOMPLETE') {
        suggestions.push({
          type: 'COMPLETE_DOCUMENTATION',
          document: `${docName}.md`,
          priority: 'MEDIUM',
          reason: `Documentation is incomplete (score: ${scores.score})`,
          action: `Add missing sections and expand content in ${docName}.md`,
          impact: 'MEDIUM',
          effort: 'LOW',
          estimatedImprovement: Math.min(100, scores.score + 30)
        });
      }
    });
    
    return {
      suggestions: suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        highPriority: suggestions.filter(s => s.priority === 'HIGH').length,
        mediumPriority: suggestions.filter(s => s.priority === 'MEDIUM').length,
        updateBasedOnUsage: suggestions.filter(s => s.type === 'UPDATE_DOCUMENTATION_BASED_ON_USAGE').length,
        improveClarity: suggestions.filter(s => s.type === 'IMPROVE_DOCUMENTATION_CLARITY').length,
        completeDocumentation: suggestions.filter(s => s.type === 'COMPLETE_DOCUMENTATION').length
      }
    };
  }

  // NEW: Identify missing documentation sections
  identifyMissingDocumentationSections() {
    const missingSections = [];
    const documentationFiles = this.getDocumentationFiles();
    
    // Define standard sections that should be present in documentation
    const standardSections = [
      'overview', 'requirements', 'implementation', 'examples', 'configuration',
      'troubleshooting', 'references', 'changelog', 'contributing'
    ];
    
    documentationFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.md');
        
        // Check for missing standard sections
        const missingSectionsForFile = standardSections.filter(section => 
          !content.toLowerCase().includes(section)
        );
        
        if (missingSectionsForFile.length > 0) {
          missingSections.push({
            document: fileName,
            missingSections: missingSectionsForFile,
            priority: missingSectionsForFile.length > 3 ? 'HIGH' : 'MEDIUM',
            reason: `Missing sections: ${missingSectionsForFile.join(', ')}`,
            action: `Add missing sections to ${fileName}.md`,
            impact: 'MEDIUM',
            effort: 'LOW'
          });
        }
        
        // Check for minimal content
        if (content.length < 500) {
          missingSections.push({
            document: fileName,
            missingSections: ['general_content'],
            priority: 'MEDIUM',
            reason: 'Documentation is too short',
            action: `Expand ${fileName}.md with more detailed content`,
            impact: 'MEDIUM',
            effort: 'LOW'
          });
        }
        
      } catch (error) {
        console.warn(`⚠️ Could not analyze missing sections for: ${filePath}`, error.message);
      }
    });
    
    return {
      missingSections: missingSections,
      summary: {
        totalDocumentsWithMissingSections: missingSections.length,
        highPriority: missingSections.filter(s => s.priority === 'HIGH').length,
        mediumPriority: missingSections.filter(s => s.priority === 'MEDIUM').length,
        averageMissingSections: Math.round(
          missingSections.reduce((sum, s) => sum + s.missingSections.length, 0) / Math.max(missingSections.length, 1)
        )
      }
    };
  }

  // NEW: Create documentation templates based on patterns
  createDocumentationTemplatesBasedOnPatterns() {
    const templates = {};
    const documentationFiles = this.getDocumentationFiles();
    
    // Analyze existing documentation to identify patterns
    const sectionPatterns = {};
    const contentPatterns = {};
    
    documentationFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.md');
        
        // Extract section patterns
        const headers = content.match(/^#{1,6}\s+(.+)$/gm) || [];
        const sections = headers.map(header => header.replace(/^#{1,6}\s+/, '').toLowerCase());
        
        if (sections.length > 0) {
          sectionPatterns[fileName] = sections;
        }
        
        // Extract content patterns
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        const lists = content.match(/^[\s]*[-*+]\s+.+$/gm) || [];
        const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
        
        contentPatterns[fileName] = {
          codeBlocks: codeBlocks.length,
          lists: lists.length,
          links: links.length,
          totalLength: content.length
        };
        
      } catch (error) {
        console.warn(`⚠️ Could not analyze patterns for: ${filePath}`, error.message);
      }
    });
    
    // Generate templates based on successful patterns
    const successfulDocs = Object.entries(contentPatterns)
      .filter(([doc, patterns]) => patterns.codeBlocks > 0 && patterns.lists > 5 && patterns.totalLength > 1000)
      .sort((a, b) => b[1].totalLength - a[1].totalLength);
    
    if (successfulDocs.length > 0) {
      const bestDoc = successfulDocs[0][0];
      const bestSections = sectionPatterns[bestDoc] || [];
      
      templates.standardTemplate = {
        name: 'Standard Documentation Template',
        basedOn: bestDoc,
        sections: bestSections,
        recommendedStructure: [
          '# Overview',
          '# Requirements', 
          '# Implementation',
          '# Examples',
          '# Configuration',
          '# Troubleshooting',
          '# References'
        ],
        contentGuidelines: {
          minCodeBlocks: 2,
          minLists: 5,
          minLength: 1000,
          includeLinks: true
        }
      };
    }
    
    // Generate specialized templates
    templates.technicalTemplate = {
      name: 'Technical Documentation Template',
      sections: [
        '# Overview',
        '# Architecture',
        '# Implementation',
        '# Configuration',
        '# API Reference',
        '# Examples',
        '# Troubleshooting'
      ],
      contentGuidelines: {
        minCodeBlocks: 3,
        minLists: 8,
        minLength: 1500,
        includeLinks: true
      }
    };
    
    templates.userGuideTemplate = {
      name: 'User Guide Template',
      sections: [
        '# Overview',
        '# Getting Started',
        '# Features',
        '# Usage Examples',
        '# Configuration',
        '# Troubleshooting',
        '# FAQ'
      ],
      contentGuidelines: {
        minCodeBlocks: 1,
        minLists: 10,
        minLength: 800,
        includeLinks: true
      }
    };
    
    return {
      templates: templates,
      patterns: {
        sectionPatterns: sectionPatterns,
        contentPatterns: contentPatterns
      },
      summary: {
        totalTemplates: Object.keys(templates).length,
        successfulPatterns: successfulDocs.length,
        averageCodeBlocks: Math.round(
          Object.values(contentPatterns).reduce((sum, p) => sum + p.codeBlocks, 0) / Object.values(contentPatterns).length
        ),
        averageLists: Math.round(
          Object.values(contentPatterns).reduce((sum, p) => sum + p.lists, 0) / Object.values(contentPatterns).length
        )
      }
    };
  }

  // NEW: Implement documentation validation
  implementDocumentationValidation() {
    const validationResults = {};
    const documentationFiles = this.getDocumentationFiles();
    
    // Define validation rules
    const validationRules = {
      minLength: 500,
      minSections: 3,
      minCodeBlocks: 1,
      minLists: 3,
      requireOverview: true,
      requireExamples: true,
      maxDaysSinceUpdate: 90
    };
    
    documentationFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.md');
        const stats = fs.statSync(filePath);
        const daysSinceUpdate = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
        
        const validation = {
          passed: true,
          errors: [],
          warnings: [],
          score: 100
        };
        
        // Validate content length
        if (content.length < validationRules.minLength) {
          validation.passed = false;
          validation.errors.push(`Content too short (${content.length} chars, minimum ${validationRules.minLength})`);
          validation.score -= 20;
        }
        
        // Validate sections
        const headers = content.match(/^#{1,6}\s+(.+)$/gm) || [];
        if (headers.length < validationRules.minSections) {
          validation.warnings.push(`Few sections (${headers.length}, recommended ${validationRules.minSections})`);
          validation.score -= 10;
        }
        
        // Validate code blocks
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        if (codeBlocks.length < validationRules.minCodeBlocks) {
          validation.warnings.push(`Few code examples (${codeBlocks.length}, recommended ${validationRules.minCodeBlocks})`);
          validation.score -= 10;
        }
        
        // Validate lists
        const lists = content.match(/^[\s]*[-*+]\s+.+$/gm) || [];
        if (lists.length < validationRules.minLists) {
          validation.warnings.push(`Few structured lists (${lists.length}, recommended ${validationRules.minLists})`);
          validation.score -= 5;
        }
        
        // Validate required sections
        if (validationRules.requireOverview && !content.toLowerCase().includes('overview')) {
          validation.warnings.push('Missing overview section');
          validation.score -= 5;
        }
        
        if (validationRules.requireExamples && !content.toLowerCase().includes('example')) {
          validation.warnings.push('Missing examples section');
          validation.score -= 5;
        }
        
        // Validate update frequency
        if (daysSinceUpdate > validationRules.maxDaysSinceUpdate) {
          validation.warnings.push(`Documentation outdated (${daysSinceUpdate} days old)`);
          validation.score -= 15;
        }
        
        validation.score = Math.max(0, validation.score);
        validation.status = validation.score > 80 ? 'VALID' : validation.score > 60 ? 'NEEDS_IMPROVEMENT' : 'INVALID';
        
        validationResults[fileName] = validation;
        
      } catch (error) {
        console.warn(`⚠️ Could not validate documentation: ${filePath}`, error.message);
      }
    });
    
    return {
      validationResults: validationResults,
      summary: {
        totalDocuments: Object.keys(validationResults).length,
        validDocuments: Object.values(validationResults).filter(v => v.status === 'VALID').length,
        needsImprovement: Object.values(validationResults).filter(v => v.status === 'NEEDS_IMPROVEMENT').length,
        invalidDocuments: Object.values(validationResults).filter(v => v.status === 'INVALID').length,
        averageScore: Math.round(
          Object.values(validationResults).reduce((sum, v) => sum + v.score, 0) / Object.values(validationResults).length
        )
      }
    };
  }

  // NEW: Implement drill-down capabilities
  implementDrillDownCapabilities(analyticsData) {
    const drillDownData = {
      violations: {
        byFile: this.drillDownViolationsByFile(),
        byType: this.drillDownViolationsByType(),
        bySeverity: this.drillDownViolationsBySeverity(),
        byStandard: this.drillDownViolationsByStandard()
      },
      performance: {
        byFileType: this.drillDownPerformanceByFileType(),
        byValidationType: this.drillDownPerformanceByValidationType(),
        byTimeRange: this.drillDownPerformanceByTimeRange()
      },
      standards: {
        byEffectiveness: this.drillDownStandardsByEffectiveness(),
        byUsage: this.drillDownStandardsByUsage(),
        byViolationRate: this.drillDownStandardsByViolationRate()
      },
      documentation: {
        byQuality: this.drillDownDocumentationByQuality(),
        byUpdateFrequency: this.drillDownDocumentationByUpdateFrequency(),
        byCompleteness: this.drillDownDocumentationByCompleteness()
      }
    };
    
    return drillDownData;
  }

  // Drill-down helper methods
  drillDownViolationsByFile() {
    const violationsByFile = {};
    
    this.violations.forEach(violation => {
      if (!violationsByFile[violation.file]) {
        violationsByFile[violation.file] = {
          totalViolations: 0,
          criticalViolations: 0,
          warningViolations: 0,
          violations: []
        };
      }
      
      violationsByFile[violation.file].totalViolations++;
      violationsByFile[violation.file].violations.push(violation);
      
      if (violation.severity === 'CRITICAL') {
        violationsByFile[violation.file].criticalViolations++;
      } else {
        violationsByFile[violation.file].warningViolations++;
      }
    });
    
    return violationsByFile;
  }

  drillDownViolationsByType() {
    const violationsByType = {};
    
    this.violations.forEach(violation => {
      const type = violation.type || 'UNKNOWN';
      if (!violationsByType[type]) {
        violationsByType[type] = {
          count: 0,
          files: new Set(),
          severity: { CRITICAL: 0, WARNING: 0 }
        };
      }
      
      violationsByType[type].count++;
      violationsByType[type].files.add(violation.file);
      violationsByType[type].severity[violation.severity]++;
    });
    
    // Convert Sets to arrays for JSON serialization
    Object.values(violationsByType).forEach(type => {
      type.files = Array.from(type.files);
    });
    
    return violationsByType;
  }

  drillDownViolationsBySeverity() {
    const violationsBySeverity = {
      CRITICAL: { count: 0, files: new Set(), types: {} },
      WARNING: { count: 0, files: new Set(), types: {} }
    };
    
    this.violations.forEach(violation => {
      const severity = violation.type || 'WARNING'; // Use type as severity
      if (violationsBySeverity[severity]) {
        violationsBySeverity[severity].count++;
        violationsBySeverity[severity].files.add(violation.file);
        
        const type = violation.type || 'UNKNOWN';
        if (!violationsBySeverity[severity].types[type]) {
          violationsBySeverity[severity].types[type] = 0;
        }
        violationsBySeverity[severity].types[type]++;
      }
    });
    
    // Convert Sets to arrays
    Object.values(violationsBySeverity).forEach(severity => {
      severity.files = Array.from(severity.files);
    });
    
    return violationsBySeverity;
  }

  drillDownViolationsByStandard() {
    const violationsByStandard = {};
    
    this.violations.forEach(violation => {
      const standard = violation.standard || 'UNKNOWN';
      if (!violationsByStandard[standard]) {
        violationsByStandard[standard] = {
          count: 0,
          files: new Set(),
          severity: { CRITICAL: 0, WARNING: 0 }
        };
      }
      
      violationsByStandard[standard].count++;
      violationsByStandard[standard].files.add(violation.file);
      const severity = violation.type || 'WARNING';
      if (violationsByStandard[standard].severity[severity] !== undefined) {
        violationsByStandard[standard].severity[severity]++;
      }
    });
    
    // Convert Sets to arrays
    Object.values(violationsByStandard).forEach(standard => {
      standard.files = Array.from(standard.files);
    });
    
    return violationsByStandard;
  }

  drillDownPerformanceByFileType() {
    const performanceByFileType = {};
    
    Object.entries(this.metrics.fileProcessingTimes).forEach(([filePath, data]) => {
      if (filePath !== 'fileTypes') {
        const fileExt = path.extname(filePath);
        const fileType = fileExt || 'NO_EXTENSION';
        
        if (!performanceByFileType[fileType]) {
          performanceByFileType[fileType] = {
            totalTime: 0,
            count: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0
          };
        }
        
        performanceByFileType[fileType].totalTime += data.processingTime;
        performanceByFileType[fileType].count++;
        performanceByFileType[fileType].minTime = Math.min(performanceByFileType[fileType].minTime, data.processingTime);
        performanceByFileType[fileType].maxTime = Math.max(performanceByFileType[fileType].maxTime, data.processingTime);
      }
    });
    
    // Calculate averages
    Object.values(performanceByFileType).forEach(type => {
      type.averageTime = type.count > 0 ? type.totalTime / type.count : 0;
      type.minTime = type.minTime === Infinity ? 0 : type.minTime;
    });
    
    return performanceByFileType;
  }

  drillDownPerformanceByValidationType() {
    return this.metrics.validationExecutionTimes;
  }

  drillDownPerformanceByTimeRange() {
    const timeRanges = {
      '0-100ms': { count: 0, totalTime: 0 },
      '100-500ms': { count: 0, totalTime: 0 },
      '500ms-1s': { count: 0, totalTime: 0 },
      '1s+': { count: 0, totalTime: 0 }
    };
    
    Object.entries(this.metrics.validationExecutionTimes).forEach(([type, stats]) => {
      const avgTime = stats.averageTime;
      
      if (avgTime <= 100) {
        timeRanges['0-100ms'].count += stats.count;
        timeRanges['0-100ms'].totalTime += stats.totalTime;
      } else if (avgTime <= 500) {
        timeRanges['100-500ms'].count += stats.count;
        timeRanges['100-500ms'].totalTime += stats.totalTime;
      } else if (avgTime <= 1000) {
        timeRanges['500ms-1s'].count += stats.count;
        timeRanges['500ms-1s'].totalTime += stats.totalTime;
      } else {
        timeRanges['1s+'].count += stats.count;
        timeRanges['1s+'].totalTime += stats.totalTime;
      }
    });
    
    return timeRanges;
  }

  drillDownStandardsByEffectiveness() {
    const standardsEffectiveness = this.calculateStandardsEffectiveness();
    return standardsEffectiveness.effectivenessAnalysis?.effectivenessMetrics || {};
  }

  drillDownStandardsByUsage() {
    const standardsEffectiveness = this.calculateStandardsEffectiveness();
    return standardsEffectiveness.referenceTracking || {};
  }

  drillDownStandardsByViolationRate() {
    const standardsEffectiveness = this.calculateStandardsEffectiveness();
    return standardsEffectiveness.ranking || [];
  }

  drillDownDocumentationByQuality() {
    const documentationQuality = this.measureDocumentationClarityAndCompleteness();
    return {
      clarity: documentationQuality.clarityScores,
      completeness: documentationQuality.completenessScores
    };
  }

  drillDownDocumentationByUpdateFrequency() {
    return this.trackDocumentationUpdateFrequency();
  }

  drillDownDocumentationByCompleteness() {
    const documentationQuality = this.measureDocumentationClarityAndCompleteness();
    return documentationQuality.completenessScores;
  }

  // NEW: Create exportable reports
  createExportableReports(analyticsData) {
    const reports = {
      csv: this.createCSVReports(analyticsData),
      json: this.createJSONReports(analyticsData),
      html: this.createHTMLReports(analyticsData),
      markdown: this.createMarkdownReports(analyticsData)
    };
    
    return reports;
  }

  createCSVReports(analyticsData) {
    const csvReports = {};
    
    // Violations CSV
    let violationsCSV = 'File,Type,Severity,Message,Line,Standard\n';
    this.violations.forEach(violation => {
      violationsCSV += `"${violation.file}","${violation.type}","${violation.severity}","${violation.message}","${violation.line}","${violation.standard}"\n`;
    });
    csvReports.violations = violationsCSV;
    
    // Performance CSV
    let performanceCSV = 'File,ProcessingTime,FileSize,FileType\n';
    Object.entries(this.metrics.fileProcessingTimes).forEach(([filePath, data]) => {
      if (filePath !== 'fileTypes') {
        performanceCSV += `"${filePath}","${data.processingTime}","${data.fileSize}","${path.extname(filePath)}"\n`;
      }
    });
    csvReports.performance = performanceCSV;
    
    // Standards CSV
    const standardsEffectiveness = this.calculateStandardsEffectiveness();
    let standardsCSV = 'Standard,ViolationRate,TotalChecks,TotalViolations,Status\n';
    standardsEffectiveness.ranking.forEach(standard => {
      standardsCSV += `"${standard.name}","${standard.violationRate}","${standard.totalChecks}","${standard.totalViolations}","${standard.status}"\n`;
    });
    csvReports.standards = standardsCSV;
    
    return csvReports;
  }

  createJSONReports(analyticsData) {
    return {
      summary: {
        timestamp: new Date().toISOString(),
        totalFiles: this.totalChecks,
        totalViolations: this.violations.length,
        complianceScore: this.complianceScore,
        executionTime: this.metrics.executionTime
      },
      violations: this.violations,
      performance: this.metrics.fileProcessingTimes,
      standards: this.calculateStandardsEffectiveness(),
      documentation: analyticsData.documentationQuality
    };
  }

  createHTMLReports(analyticsData) {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Compliance Analytics Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #fff; border: 1px solid #ddd; }
        .critical { color: #d32f2f; }
        .warning { color: #f57c00; }
        .success { color: #388e3c; }
    </style>
</head>
<body>
    <h1>Compliance Analytics Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">Total Files: ${this.totalChecks}</div>
        <div class="metric">Total Violations: ${this.violations.length}</div>
        <div class="metric">Compliance Score: ${this.complianceScore}%</div>
        <div class="metric">Execution Time: ${this.metrics.executionTime}ms</div>
    </div>
    
    <div class="section">
        <h2>Violations by Type</h2>
        ${this.generateViolationsHTML()}
    </div>
    
    <div class="section">
        <h2>Performance Metrics</h2>
        ${this.generatePerformanceHTML()}
    </div>
    
    <div class="section">
        <h2>Standards Effectiveness</h2>
        ${this.generateStandardsHTML()}
    </div>
</body>
</html>`;
    
    return {
      main: htmlTemplate,
      violations: this.generateViolationsHTML(),
      performance: this.generatePerformanceHTML(),
      standards: this.generateStandardsHTML()
    };
  }

  createMarkdownReports(analyticsData) {
    let markdown = `# Compliance Analytics Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- **Total Files:** ${this.totalChecks}\n`;
    markdown += `- **Total Violations:** ${this.violations.length}\n`;
    markdown += `- **Compliance Score:** ${this.complianceScore}%\n`;
    markdown += `- **Execution Time:** ${this.metrics.executionTime}ms\n\n`;
    
    // Violations
    markdown += `## Violations\n\n`;
    this.violations.forEach(violation => {
      markdown += `- **${violation.file}** (${violation.severity}): ${violation.message}\n`;
    });
    markdown += `\n`;
    
    // Performance
    markdown += `## Performance\n\n`;
    const avgProcessingTime = this.calculateAverageProcessingTime();
    markdown += `- **Average Processing Time:** ${avgProcessingTime.overallAverage}ms\n`;
    markdown += `- **Total Processing Time:** ${avgProcessingTime.totalTime}ms\n\n`;
    
    // Standards
    markdown += `## Standards Effectiveness\n\n`;
    const standardsEffectiveness = this.calculateStandardsEffectiveness();
    standardsEffectiveness.ranking.slice(0, 5).forEach(standard => {
      markdown += `- **${standard.name}:** ${standard.violationRate}% violation rate\n`;
    });
    
    return {
      main: markdown,
      summary: markdown.split('##')[0],
      violations: markdown.split('## Violations')[1]?.split('##')[0] || '',
      performance: markdown.split('## Performance')[1]?.split('##')[0] || '',
      standards: markdown.split('## Standards')[1] || ''
    };
  }

  // Helper methods for HTML generation
  generateViolationsHTML() {
    const violationsByType = this.drillDownViolationsByType();
    let html = '<table border="1"><tr><th>Type</th><th>Count</th><th>Files</th><th>Critical</th><th>Warning</th></tr>';
    
    Object.entries(violationsByType).forEach(([type, data]) => {
      html += `<tr><td>${type}</td><td>${data.count}</td><td>${data.files.length}</td><td class="critical">${data.severity.CRITICAL}</td><td class="warning">${data.severity.WARNING}</td></tr>`;
    });
    
    html += '</table>';
    return html;
  }

  generatePerformanceHTML() {
    const performanceByFileType = this.drillDownPerformanceByFileType();
    let html = '<table border="1"><tr><th>File Type</th><th>Count</th><th>Avg Time (ms)</th><th>Total Time (ms)</th></tr>';
    
    Object.entries(performanceByFileType).forEach(([fileType, data]) => {
      html += `<tr><td>${fileType}</td><td>${data.count}</td><td>${Math.round(data.averageTime)}</td><td>${Math.round(data.totalTime)}</td></tr>`;
    });
    
    html += '</table>';
    return html;
  }

  generateStandardsHTML() {
    const standardsEffectiveness = this.calculateStandardsEffectiveness();
    let html = '<table border="1"><tr><th>Standard</th><th>Violation Rate</th><th>Status</th><th>Total Checks</th></tr>';
    
    standardsEffectiveness.ranking.slice(0, 10).forEach(standard => {
      const statusClass = standard.status === 'CRITICAL' ? 'critical' : standard.status === 'WARNING' ? 'warning' : 'success';
      html += `<tr><td>${standard.name}</td><td>${standard.violationRate}%</td><td class="${statusClass}">${standard.status}</td><td>${standard.totalChecks}</td></tr>`;
    });
    
    html += '</table>';
    return html;
  }

  // NEW: Create prioritized action items
  createPrioritizedActionItems() {
    const actionItems = [];
    
    // Collect all suggestions from various sources
    const improvementSuggestions = this.generateImprovementSuggestions();
    const ruleBasedSuggestions = this.generateRuleBasedSuggestions();
    const standardsEffectiveness = this.calculateStandardsEffectiveness();
    const documentationQuality = this.measureDocumentationClarityAndCompleteness();
    
    // Add improvement suggestions
    improvementSuggestions.forEach(suggestion => {
      actionItems.push({
        id: `improvement_${actionItems.length}`,
        type: 'IMPROVEMENT',
        source: 'violation_analysis',
        priority: suggestion.priority,
        category: suggestion.category,
        message: suggestion.message,
        action: suggestion.action,
        impact: suggestion.impact,
        effort: suggestion.effort,
        estimatedTime: this.estimateActionTime(suggestion.effort),
        estimatedImpact: this.estimateActionImpact(suggestion.impact)
      });
    });
    
    // Add rule-based suggestions
    ruleBasedSuggestions.forEach(suggestion => {
      actionItems.push({
        id: `rule_${actionItems.length}`,
        type: 'RULE_BASED',
        source: 'pattern_analysis',
        priority: suggestion.priority,
        category: suggestion.category,
        message: suggestion.message,
        action: suggestion.action,
        impact: suggestion.impact,
        effort: suggestion.effort,
        estimatedTime: this.estimateActionTime(suggestion.effort),
        estimatedImpact: this.estimateActionImpact(suggestion.impact)
      });
    });
    
    // Add standards effectiveness suggestions
    if (standardsEffectiveness.improvementSuggestions) {
      standardsEffectiveness.improvementSuggestions.suggestions.forEach(suggestion => {
        actionItems.push({
          id: `standards_${actionItems.length}`,
          type: 'STANDARDS_IMPROVEMENT',
          source: 'standards_analysis',
          priority: suggestion.priority,
          category: 'Standards',
          message: suggestion.reason,
          action: suggestion.action,
          impact: suggestion.impact,
          effort: suggestion.effort,
          estimatedTime: this.estimateActionTime(suggestion.effort),
          estimatedImpact: this.estimateActionImpact(suggestion.impact)
        });
      });
    }
    
    // Add documentation suggestions
    Object.entries(documentationQuality.clarityScores).forEach(([docName, scores]) => {
      if (scores.status === 'UNCLEAR') {
        actionItems.push({
          id: `doc_clarity_${actionItems.length}`,
          type: 'DOCUMENTATION',
          source: 'documentation_analysis',
          priority: 'HIGH',
          category: 'Documentation',
          message: `Documentation ${docName} is unclear (score: ${scores.score})`,
          action: `Rewrite ${docName} documentation with better structure and examples`,
          impact: 'HIGH',
          effort: 'MEDIUM',
          estimatedTime: this.estimateActionTime('MEDIUM'),
          estimatedImpact: this.estimateActionImpact('HIGH')
        });
      }
    });
    
    // Sort by priority and impact
    actionItems.sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const impactOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
    
    return {
      actionItems: actionItems,
      summary: {
        totalItems: actionItems.length,
        criticalPriority: actionItems.filter(item => item.priority === 'CRITICAL').length,
        highPriority: actionItems.filter(item => item.priority === 'HIGH').length,
        mediumPriority: actionItems.filter(item => item.priority === 'MEDIUM').length,
        lowPriority: actionItems.filter(item => item.priority === 'LOW').length,
        highImpact: actionItems.filter(item => item.impact === 'HIGH').length,
        estimatedTotalTime: actionItems.reduce((sum, item) => sum + item.estimatedTime, 0),
        estimatedTotalImpact: actionItems.reduce((sum, item) => sum + item.estimatedImpact, 0)
      }
    };
  }

  // NEW: Implement impact assessment for suggestions
  implementImpactAssessmentForSuggestions(actionItems) {
    const impactAssessment = {
      overallImpact: {
        complianceScore: this.assessComplianceScoreImpact(actionItems),
        performanceImpact: this.assessPerformanceImpact(actionItems),
        standardsImpact: this.assessStandardsImpact(actionItems),
        documentationImpact: this.assessDocumentationImpact(actionItems)
      },
      individualAssessments: actionItems.map(item => ({
        id: item.id,
        impact: this.assessIndividualImpact(item),
        riskAssessment: this.assessRiskForAction(item),
        successProbability: this.assessSuccessProbability(item),
        dependencies: this.identifyDependencies(item)
      }))
    };
    
    return impactAssessment;
  }

  // NEW: Build suggestion validation system
  buildSuggestionValidationSystem(actionItems) {
    const validationResults = {
      validatedSuggestions: [],
      rejectedSuggestions: [],
      needsReview: [],
      summary: {
        totalValidated: 0,
        totalRejected: 0,
        totalNeedsReview: 0,
        validationScore: 0
      }
    };
    
    actionItems.forEach(item => {
      const validation = this.validateSuggestion(item);
      
      if (validation.isValid) {
        validationResults.validatedSuggestions.push({
          ...item,
          validationScore: validation.score,
          validationNotes: validation.notes
        });
        validationResults.summary.totalValidated++;
      } else if (validation.needsReview) {
        validationResults.needsReview.push({
          ...item,
          validationScore: validation.score,
          validationNotes: validation.notes,
          reviewReason: validation.reviewReason
        });
        validationResults.summary.totalNeedsReview++;
      } else {
        validationResults.rejectedSuggestions.push({
          ...item,
          validationScore: validation.score,
          validationNotes: validation.notes,
          rejectionReason: validation.rejectionReason
        });
        validationResults.summary.totalRejected++;
      }
    });
    
    // Calculate overall validation score
    const totalItems = actionItems.length;
    validationResults.summary.validationScore = totalItems > 0 ? 
      Math.round((validationResults.summary.totalValidated / totalItems) * 100) : 0;
    
    return validationResults;
  }

  // Helper methods for action items
  estimateActionTime(effort) {
    const timeEstimates = {
      'LOW': 1,      // 1 hour
      'MEDIUM': 4,   // 4 hours
      'HIGH': 16     // 16 hours (2 days)
    };
    return timeEstimates[effort] || 4;
  }

  estimateActionImpact(impact) {
    const impactScores = {
      'LOW': 10,     // 10% improvement
      'MEDIUM': 25,  // 25% improvement
      'HIGH': 50     // 50% improvement
    };
    return impactScores[impact] || 25;
  }

  assessComplianceScoreImpact(actionItems) {
    const highImpactItems = actionItems.filter(item => item.impact === 'HIGH');
    const mediumImpactItems = actionItems.filter(item => item.impact === 'MEDIUM');
    
    const estimatedImprovement = (highImpactItems.length * 50) + (mediumImpactItems.length * 25);
    const currentScore = this.complianceScore;
    const potentialScore = Math.min(100, currentScore + estimatedImprovement);
    
    return {
      currentScore: currentScore,
      potentialScore: potentialScore,
      estimatedImprovement: estimatedImprovement,
      improvementPercentage: Math.round((estimatedImprovement / currentScore) * 100)
    };
  }

  assessPerformanceImpact(actionItems) {
    const performanceItems = actionItems.filter(item => 
      item.category === 'Performance' || item.message.includes('performance')
    );
    
    const totalEstimatedTime = performanceItems.reduce((sum, item) => sum + item.estimatedTime, 0);
    const totalEstimatedImpact = performanceItems.reduce((sum, item) => sum + item.estimatedImpact, 0);
    
    return {
      itemsCount: performanceItems.length,
      estimatedTimeInvestment: totalEstimatedTime,
      estimatedPerformanceGain: totalEstimatedImpact,
      roi: totalEstimatedTime > 0 ? Math.round(totalEstimatedImpact / totalEstimatedTime * 100) / 100 : 0
    };
  }

  assessStandardsImpact(actionItems) {
    const standardsItems = actionItems.filter(item => 
      item.type === 'STANDARDS_IMPROVEMENT' || item.category === 'Standards'
    );
    
    return {
      itemsCount: standardsItems.length,
      criticalStandards: standardsItems.filter(item => item.priority === 'CRITICAL').length,
      highPriorityStandards: standardsItems.filter(item => item.priority === 'HIGH').length,
      estimatedComplianceImprovement: standardsItems.reduce((sum, item) => sum + item.estimatedImpact, 0)
    };
  }

  assessDocumentationImpact(actionItems) {
    const documentationItems = actionItems.filter(item => 
      item.type === 'DOCUMENTATION' || item.category === 'Documentation'
    );
    
    return {
      itemsCount: documentationItems.length,
      clarityImprovements: documentationItems.filter(item => item.message.includes('clarity')).length,
      completenessImprovements: documentationItems.filter(item => item.message.includes('complete')).length,
      estimatedQualityImprovement: documentationItems.reduce((sum, item) => sum + item.estimatedImpact, 0)
    };
  }

  assessIndividualImpact(item) {
    const impactFactors = {
      priority: { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0.5 },
      impact: { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 },
      effort: { 'LOW': 1, 'MEDIUM': 0.8, 'HIGH': 0.6 }
    };
    
    const priorityScore = impactFactors.priority[item.priority] || 1;
    const impactScore = impactFactors.impact[item.impact] || 1;
    const effortScore = impactFactors.effort[item.effort] || 1;
    
    return Math.round((priorityScore * impactScore * effortScore) * 100) / 100;
  }

  assessRiskForAction(item) {
    const riskFactors = {
      'CRITICAL': 'HIGH',
      'HIGH': 'MEDIUM',
      'MEDIUM': 'LOW',
      'LOW': 'LOW'
    };
    
    return {
      level: riskFactors[item.priority] || 'LOW',
      factors: [
        `Priority: ${item.priority}`,
        `Impact: ${item.impact}`,
        `Effort: ${item.effort}`
      ],
      mitigation: this.suggestRiskMitigation(item)
    };
  }

  assessSuccessProbability(item) {
    const baseProbability = {
      'LOW': 0.9,    // 90% success rate for low effort
      'MEDIUM': 0.7, // 70% success rate for medium effort
      'HIGH': 0.5    // 50% success rate for high effort
    };
    
    const effortProbability = baseProbability[item.effort] || 0.7;
    const priorityBonus = item.priority === 'CRITICAL' ? 0.1 : 0;
    const impactBonus = item.impact === 'HIGH' ? 0.05 : 0;
    
    return Math.min(0.95, effortProbability + priorityBonus + impactBonus);
  }

  identifyDependencies(item) {
    const dependencies = [];
    
    // Identify common dependencies based on item type
    if (item.type === 'DOCUMENTATION') {
      dependencies.push('Documentation review process');
      dependencies.push('Content approval workflow');
    }
    
    if (item.type === 'STANDARDS_IMPROVEMENT') {
      dependencies.push('Standards review committee');
      dependencies.push('Team training schedule');
    }
    
    if (item.category === 'Performance') {
      dependencies.push('Performance testing environment');
      dependencies.push('Monitoring tools setup');
    }
    
    return dependencies;
  }

  suggestRiskMitigation(item) {
    const mitigations = {
      'HIGH': [
        'Implement in phases',
        'Create rollback plan',
        'Monitor closely during implementation'
      ],
      'MEDIUM': [
        'Test in staging environment',
        'Have backup plan ready'
      ],
      'LOW': [
        'Standard implementation process'
      ]
    };
    
    // Calculate risk level directly without calling assessRiskForAction
    const riskFactors = {
      'CRITICAL': 'HIGH',
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW'
    };
    
    const riskLevel = riskFactors[item.priority] || 'LOW';
    return mitigations[riskLevel] || mitigations['LOW'];
  }

  validateSuggestion(item) {
    const validation = {
      isValid: true,
      score: 100,
      notes: [],
      needsReview: false,
      reviewReason: null,
      rejectionReason: null
    };
    
    // Validation rules
    if (item.estimatedTime > 40) {
      validation.isValid = false;
      validation.score -= 30;
      validation.notes.push('Estimated time too high');
      validation.rejectionReason = 'Exceeds maximum time allocation';
    }
    
    if (item.impact === 'LOW' && item.effort === 'HIGH') {
      validation.score -= 20;
      validation.notes.push('Low impact for high effort');
      validation.needsReview = true;
      validation.reviewReason = 'ROI may not justify effort';
    }
    
    if (item.priority === 'CRITICAL' && item.successProbability < 0.6) {
      validation.score -= 25;
      validation.notes.push('Critical priority with low success probability');
      validation.needsReview = true;
      validation.reviewReason = 'High risk for critical item';
    }
    
    if (item.estimatedImpact < 10) {
      validation.score -= 15;
      validation.notes.push('Very low estimated impact');
    }
    
    validation.score = Math.max(0, validation.score);
    
    return validation;
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

  // Enhanced: Build violation probability calculations
  calculateViolationProbabilities() {
    if (this.metrics.historicalData.length < 5) {
      return {
        probabilities: [],
        confidence: 0,
        message: 'Insufficient historical data for probability calculations (minimum 5 runs required)'
      };
    }

    const probabilities = [];
    const recentData = this.metrics.historicalData.slice(-10); // Last 10 runs

    // Calculate file type violation probabilities
    const fileTypeViolations = {};
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.violationCategories) {
        Object.entries(entry.metrics.violationCategories).forEach(([fileType, count]) => {
          if (!fileTypeViolations[fileType]) {
            fileTypeViolations[fileType] = [];
          }
          fileTypeViolations[fileType].push(count);
        });
      }
    });

    Object.entries(fileTypeViolations).forEach(([fileType, counts]) => {
      const avgViolations = counts.reduce((sum, count) => sum + count, 0) / counts.length;
      const trend = counts[counts.length - 1] - counts[0];
      const probability = Math.min(100, Math.max(0, avgViolations * 10 + (trend > 0 ? 15 : trend < 0 ? -10 : 0)));
      
      probabilities.push({
        type: 'FILE_TYPE_VIOLATION_PROBABILITY',
        fileType: fileType,
        probability: Math.round(probability),
        confidence: this.calculateProbabilityConfidence(counts),
        trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        recommendation: this.generateViolationProbabilityRecommendation(fileType, probability, trend)
      });
    });

    // Calculate severity-based violation probabilities
    const severityProbabilities = this.calculateSeverityBasedProbabilities(recentData);
    probabilities.push(...severityProbabilities);

    // Calculate standards-based violation probabilities
    const standardsProbabilities = this.calculateStandardsBasedProbabilities(recentData);
    probabilities.push(...standardsProbabilities);

    // Calculate overall confidence
    const totalConfidence = probabilities.reduce((sum, prob) => sum + prob.confidence, 0);
    const overallConfidence = probabilities.length > 0 ? Math.round(totalConfidence / probabilities.length) : 0;

    return {
      probabilities: probabilities,
      confidence: overallConfidence,
      totalProbabilities: probabilities.length,
      highProbabilityViolations: probabilities.filter(p => p.probability > 70).length,
      mediumProbabilityViolations: probabilities.filter(p => p.probability > 40 && p.probability <= 70).length,
      lowProbabilityViolations: probabilities.filter(p => p.probability <= 40).length
    };
  }

  // Enhanced: Calculate severity-based violation probabilities
  calculateSeverityBasedProbabilities(recentData) {
    const probabilities = [];
    
    // Critical violation probability
    const criticalCounts = recentData.map(entry => entry.criticalViolations || 0);
    const avgCritical = criticalCounts.reduce((sum, count) => sum + count, 0) / criticalCounts.length;
    const criticalTrend = criticalCounts[criticalCounts.length - 1] - criticalCounts[0];
    const criticalProbability = Math.min(100, Math.max(0, avgCritical * 20 + (criticalTrend > 0 ? 25 : criticalTrend < 0 ? -15 : 0)));
    
    probabilities.push({
      type: 'CRITICAL_VIOLATION_PROBABILITY',
      severity: 'CRITICAL',
      probability: Math.round(criticalProbability),
      confidence: this.calculateProbabilityConfidence(criticalCounts),
      trend: criticalTrend > 0 ? 'increasing' : criticalTrend < 0 ? 'decreasing' : 'stable',
      recommendation: this.generateSeverityProbabilityRecommendation('CRITICAL', criticalProbability, criticalTrend)
    });

    // Warning violation probability
    const warningCounts = recentData.map(entry => entry.warnings || 0);
    const avgWarnings = warningCounts.reduce((sum, count) => sum + count, 0) / warningCounts.length;
    const warningTrend = warningCounts[warningCounts.length - 1] - warningCounts[0];
    const warningProbability = Math.min(100, Math.max(0, avgWarnings * 8 + (warningTrend > 0 ? 20 : warningTrend < 0 ? -10 : 0)));
    
    probabilities.push({
      type: 'WARNING_VIOLATION_PROBABILITY',
      severity: 'WARNING',
      probability: Math.round(warningProbability),
      confidence: this.calculateProbabilityConfidence(warningCounts),
      trend: warningTrend > 0 ? 'increasing' : warningTrend < 0 ? 'decreasing' : 'stable',
      recommendation: this.generateSeverityProbabilityRecommendation('WARNING', warningProbability, warningTrend)
    });

    return probabilities;
  }

  // Enhanced: Calculate standards-based violation probabilities
  calculateStandardsBasedProbabilities(recentData) {
    const probabilities = [];
    const standardsViolations = {};

    // Aggregate standards violations across recent data
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.standardsEffectiveness) {
        Object.entries(entry.metrics.standardsEffectiveness).forEach(([standard, data]) => {
          if (!standardsViolations[standard]) {
            standardsViolations[standard] = [];
          }
          standardsViolations[standard].push(data.violations || 0);
        });
      }
    });

    Object.entries(standardsViolations).forEach(([standard, violations]) => {
      const avgViolations = violations.reduce((sum, count) => sum + count, 0) / violations.length;
      const trend = violations[violations.length - 1] - violations[0];
      const probability = Math.min(100, Math.max(0, avgViolations * 15 + (trend > 0 ? 20 : trend < 0 ? -10 : 0)));
      
      probabilities.push({
        type: 'STANDARDS_VIOLATION_PROBABILITY',
        standard: standard,
        probability: Math.round(probability),
        confidence: this.calculateProbabilityConfidence(violations),
        trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
        recommendation: this.generateStandardsProbabilityRecommendation(standard, probability, trend)
      });
    });

    return probabilities;
  }

  // Enhanced: Calculate probability confidence based on data consistency
  calculateProbabilityConfidence(dataPoints) {
    if (dataPoints.length < 3) return 30;
    
    const mean = dataPoints.reduce((sum, point) => sum + point, 0) / dataPoints.length;
    const variance = dataPoints.reduce((sum, point) => sum + Math.pow(point - mean, 2), 0) / dataPoints.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    
    // Higher confidence for more consistent data
    let confidence = 100 - (coefficientOfVariation * 50);
    confidence = Math.max(30, Math.min(95, confidence));
    
    // Bonus confidence for more data points
    if (dataPoints.length >= 8) confidence += 10;
    else if (dataPoints.length >= 5) confidence += 5;
    
    return Math.round(confidence);
  }

  // Enhanced: Generate violation probability recommendations
  generateViolationProbabilityRecommendation(fileType, probability, trend) {
    if (probability > 80) {
      return `High probability of ${fileType} violations. Immediate attention required.`;
    } else if (probability > 60) {
      return `Moderate probability of ${fileType} violations. Monitor closely.`;
    } else if (probability > 40) {
      return `Low-moderate probability of ${fileType} violations. Regular monitoring recommended.`;
    } else {
      return `Low probability of ${fileType} violations. Continue current practices.`;
    }
  }

  // Enhanced: Generate severity probability recommendations
  generateSeverityProbabilityRecommendation(severity, probability, trend) {
    if (probability > 80) {
      return `High probability of ${severity} violations. Critical attention required.`;
    } else if (probability > 60) {
      return `Moderate probability of ${severity} violations. Increased monitoring needed.`;
    } else if (probability > 40) {
      return `Low-moderate probability of ${severity} violations. Standard monitoring.`;
    } else {
      return `Low probability of ${severity} violations. Continue current practices.`;
    }
  }

  // Enhanced: Generate standards probability recommendations
  generateStandardsProbabilityRecommendation(standard, probability, trend) {
    if (probability > 80) {
      return `High probability of ${standard} violations. Review and improve standards compliance.`;
    } else if (probability > 60) {
      return `Moderate probability of ${standard} violations. Monitor standards effectiveness.`;
    } else if (probability > 40) {
      return `Low-moderate probability of ${standard} violations. Regular standards review.`;
    } else {
      return `Low probability of ${standard} violations. Standards working well.`;
    }
  }

  // Enhanced: Implement advanced trend-based forecasting
  implementAdvancedTrendBasedForecasting() {
    if (this.metrics.historicalData.length < 5) {
      return {
        forecasts: [],
        confidence: 0,
        message: 'Insufficient historical data for advanced forecasting (minimum 5 runs required)'
      };
    }

    const forecasts = [];
    const recentData = this.metrics.historicalData.slice(-10);

    // Enhanced compliance score forecasting
    const complianceForecast = this.generateAdvancedComplianceForecast(recentData);
    forecasts.push(complianceForecast);

    // Enhanced violation count forecasting
    const violationForecast = this.generateAdvancedViolationForecast(recentData);
    forecasts.push(violationForecast);

    // Enhanced performance forecasting
    const performanceForecast = this.generateAdvancedPerformanceForecast(recentData);
    forecasts.push(performanceForecast);

    // Enhanced standards effectiveness forecasting
    const standardsForecast = this.generateAdvancedStandardsForecast(recentData);
    forecasts.push(standardsForecast);

    // Calculate overall forecast confidence
    const totalConfidence = forecasts.reduce((sum, forecast) => sum + forecast.confidence, 0);
    const overallConfidence = forecasts.length > 0 ? Math.round(totalConfidence / forecasts.length) : 0;

    return {
      forecasts: forecasts,
      confidence: overallConfidence,
      totalForecasts: forecasts.length,
      highConfidenceForecasts: forecasts.filter(f => f.confidence > 80).length,
      mediumConfidenceForecasts: forecasts.filter(f => f.confidence > 60 && f.confidence <= 80).length,
      lowConfidenceForecasts: forecasts.filter(f => f.confidence <= 60).length
    };
  }

  // Enhanced: Generate advanced compliance forecast
  generateAdvancedComplianceForecast(recentData) {
    const scores = recentData.map(entry => entry.complianceScore);
    const trend = this.calculateLinearTrend(scores);
    const volatility = this.calculateVolatility(scores);
    const seasonality = this.detectSeasonality(scores);
    
    const nextScore = this.predictNextValue(scores, trend, volatility, seasonality);
    const confidence = this.calculateForecastConfidence(scores, trend, volatility);
    
    return {
      type: 'ADVANCED_COMPLIANCE_FORECAST',
      metric: 'compliance_score',
      currentValue: scores[scores.length - 1],
      predictedValue: Math.round(nextScore),
      confidence: confidence,
      trend: trend.slope > 0 ? 'improving' : trend.slope < 0 ? 'declining' : 'stable',
      volatility: volatility,
      seasonality: seasonality,
      recommendation: this.generateAdvancedForecastRecommendation('compliance score', nextScore, scores[scores.length - 1], trend.slope)
    };
  }

  // Enhanced: Generate advanced violation forecast
  generateAdvancedViolationForecast(recentData) {
    const violations = recentData.map(entry => entry.violations);
    const trend = this.calculateLinearTrend(violations);
    const volatility = this.calculateVolatility(violations);
    const seasonality = this.detectSeasonality(violations);
    
    const nextViolations = this.predictNextValue(violations, trend, volatility, seasonality);
    const confidence = this.calculateForecastConfidence(violations, trend, volatility);
    
    return {
      type: 'ADVANCED_VIOLATION_FORECAST',
      metric: 'violation_count',
      currentValue: violations[violations.length - 1],
      predictedValue: Math.round(nextViolations),
      confidence: confidence,
      trend: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
      volatility: volatility,
      seasonality: seasonality,
      recommendation: this.generateAdvancedForecastRecommendation('violation count', nextViolations, violations[violations.length - 1], trend.slope)
    };
  }

  // Enhanced: Generate advanced performance forecast
  generateAdvancedPerformanceForecast(recentData) {
    const executionTimes = recentData.map(entry => entry.metrics.executionTime);
    const trend = this.calculateLinearTrend(executionTimes);
    const volatility = this.calculateVolatility(executionTimes);
    const seasonality = this.detectSeasonality(executionTimes);
    
    const nextExecutionTime = this.predictNextValue(executionTimes, trend, volatility, seasonality);
    const confidence = this.calculateForecastConfidence(executionTimes, trend, volatility);
    
    return {
      type: 'ADVANCED_PERFORMANCE_FORECAST',
      metric: 'execution_time',
      currentValue: executionTimes[executionTimes.length - 1],
      predictedValue: Math.round(nextExecutionTime),
      confidence: confidence,
      trend: trend.slope > 0 ? 'slowing' : trend.slope < 0 ? 'improving' : 'stable',
      volatility: volatility,
      seasonality: seasonality,
      recommendation: this.generateAdvancedForecastRecommendation('execution time', nextExecutionTime, executionTimes[executionTimes.length - 1], trend.slope)
    };
  }

  // Enhanced: Generate advanced standards forecast
  generateAdvancedStandardsForecast(recentData) {
    const standardsEffectiveness = [];
    
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.standardsEffectiveness) {
        const avgEffectiveness = Object.values(entry.metrics.standardsEffectiveness)
          .reduce((sum, standard) => sum + (standard.effectivenessScore || 0), 0) / 
          Object.keys(entry.metrics.standardsEffectiveness).length;
        standardsEffectiveness.push(avgEffectiveness);
      }
    });

    if (standardsEffectiveness.length < 3) {
      return {
        type: 'ADVANCED_STANDARDS_FORECAST',
        metric: 'standards_effectiveness',
        confidence: 30,
        message: 'Insufficient standards effectiveness data for forecasting'
      };
    }

    const trend = this.calculateLinearTrend(standardsEffectiveness);
    const volatility = this.calculateVolatility(standardsEffectiveness);
    const seasonality = this.detectSeasonality(standardsEffectiveness);
    
    const nextEffectiveness = this.predictNextValue(standardsEffectiveness, trend, volatility, seasonality);
    const confidence = this.calculateForecastConfidence(standardsEffectiveness, trend, volatility);
    
    return {
      type: 'ADVANCED_STANDARDS_FORECAST',
      metric: 'standards_effectiveness',
      currentValue: standardsEffectiveness[standardsEffectiveness.length - 1],
      predictedValue: Math.round(nextEffectiveness),
      confidence: confidence,
      trend: trend.slope > 0 ? 'improving' : trend.slope < 0 ? 'declining' : 'stable',
      volatility: volatility,
      seasonality: seasonality,
      recommendation: this.generateAdvancedForecastRecommendation('standards effectiveness', nextEffectiveness, standardsEffectiveness[standardsEffectiveness.length - 1], trend.slope)
    };
  }

  // Enhanced: Calculate linear trend
  calculateLinearTrend(data) {
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, y) => sum + y, 0);
    const sumXY = data.reduce((sum, y, i) => sum + (i * y), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  // Enhanced: Calculate volatility
  calculateVolatility(data) {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  // Enhanced: Detect seasonality (simplified)
  detectSeasonality(data) {
    if (data.length < 6) return 'none';
    
    // Simple seasonality detection based on pattern repetition
    const halfLength = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, halfLength);
    const secondHalf = data.slice(halfLength);
    
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = Math.abs(firstHalfAvg - secondHalfAvg);
    const overallAvg = (firstHalfAvg + secondHalfAvg) / 2;
    const seasonalityStrength = difference / overallAvg;
    
    if (seasonalityStrength > 0.2) return 'strong';
    else if (seasonalityStrength > 0.1) return 'moderate';
    else return 'weak';
  }

  // Enhanced: Predict next value with trend, volatility, and seasonality
  predictNextValue(data, trend, volatility, seasonality) {
    const lastValue = data[data.length - 1];
    const trendPrediction = lastValue + trend.slope;
    
    // Adjust for seasonality
    let seasonalityAdjustment = 0;
    if (seasonality === 'strong') {
      seasonalityAdjustment = volatility * 0.3;
    } else if (seasonality === 'moderate') {
      seasonalityAdjustment = volatility * 0.15;
    }
    
    // Add some randomness based on volatility
    const randomFactor = (Math.random() - 0.5) * volatility * 0.2;
    
    return trendPrediction + seasonalityAdjustment + randomFactor;
  }

  // Enhanced: Calculate forecast confidence
  calculateForecastConfidence(data, trend, volatility) {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const coefficientOfVariation = volatility / mean;
    
    // Base confidence on data consistency
    let confidence = 100 - (coefficientOfVariation * 30);
    
    // Adjust for data points
    if (data.length >= 10) confidence += 15;
    else if (data.length >= 7) confidence += 10;
    else if (data.length >= 5) confidence += 5;
    
    // Adjust for trend consistency
    const trendConsistency = Math.abs(trend.slope) / mean;
    if (trendConsistency < 0.1) confidence += 10;
    else if (trendConsistency > 0.3) confidence -= 10;
    
    return Math.max(30, Math.min(95, Math.round(confidence)));
  }

  // Enhanced: Generate advanced forecast recommendations
  generateAdvancedForecastRecommendation(metric, predictedValue, currentValue, trendSlope) {
    const change = predictedValue - currentValue;
    const changePercent = (change / currentValue) * 100;
    
    if (Math.abs(changePercent) > 20) {
      return `Significant ${changePercent > 0 ? 'increase' : 'decrease'} in ${metric} predicted. Immediate action recommended.`;
    } else if (Math.abs(changePercent) > 10) {
      return `Moderate ${changePercent > 0 ? 'increase' : 'decrease'} in ${metric} predicted. Monitor closely.`;
    } else if (Math.abs(changePercent) > 5) {
      return `Slight ${changePercent > 0 ? 'increase' : 'decrease'} in ${metric} predicted. Regular monitoring.`;
    } else {
      return `Stable ${metric} predicted. Continue current practices.`;
    }
  }

  // Enhanced: Add comprehensive confidence scoring for predictions
  implementComprehensiveConfidenceScoring() {
    if (this.metrics.historicalData.length < 3) {
      return {
        confidenceScores: [],
        overallConfidence: 0,
        message: 'Insufficient data for comprehensive confidence scoring'
      };
    }

    const confidenceScores = [];
    const recentData = this.metrics.historicalData.slice(-5);

    // Data quality confidence
    const dataQualityConfidence = this.calculateDataQualityConfidence(recentData);
    confidenceScores.push(dataQualityConfidence);

    // Prediction accuracy confidence
    const predictionAccuracyConfidence = this.calculatePredictionAccuracyConfidence(recentData);
    confidenceScores.push(predictionAccuracyConfidence);

    // Trend consistency confidence
    const trendConsistencyConfidence = this.calculateTrendConsistencyConfidence(recentData);
    confidenceScores.push(trendConsistencyConfidence);

    // Model reliability confidence
    const modelReliabilityConfidence = this.calculateModelReliabilityConfidence(recentData);
    confidenceScores.push(modelReliabilityConfidence);

    // Calculate overall confidence
    const totalConfidence = confidenceScores.reduce((sum, score) => sum + score.confidence, 0);
    const overallConfidence = confidenceScores.length > 0 ? Math.round(totalConfidence / confidenceScores.length) : 0;

    return {
      confidenceScores: confidenceScores,
      overallConfidence: overallConfidence,
      totalScores: confidenceScores.length,
      highConfidenceFactors: confidenceScores.filter(s => s.confidence > 80).length,
      mediumConfidenceFactors: confidenceScores.filter(s => s.confidence > 60 && s.confidence <= 80).length,
      lowConfidenceFactors: confidenceScores.filter(s => s.confidence <= 60).length
    };
  }

  // Enhanced: Calculate data quality confidence
  calculateDataQualityConfidence(recentData) {
    let confidence = 70; // Base confidence
    
    // Check data completeness
    const completeEntries = recentData.filter(entry => 
      entry.complianceScore !== undefined && 
      entry.violations !== undefined && 
      entry.metrics !== undefined
    ).length;
    
    const completenessRatio = completeEntries / recentData.length;
    confidence += completenessRatio * 20;
    
    // Check data consistency
    const scores = recentData.map(entry => entry.complianceScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    if (coefficientOfVariation < 0.1) confidence += 10;
    else if (coefficientOfVariation > 0.3) confidence -= 10;
    
    return {
      type: 'DATA_QUALITY_CONFIDENCE',
      confidence: Math.max(30, Math.min(95, Math.round(confidence))),
      factors: {
        completeness: completenessRatio,
        consistency: 1 - coefficientOfVariation,
        dataPoints: recentData.length
      }
    };
  }

  // Enhanced: Calculate prediction accuracy confidence
  calculatePredictionAccuracyConfidence(recentData) {
    if (recentData.length < 4) {
      return {
        type: 'PREDICTION_ACCURACY_CONFIDENCE',
        confidence: 30,
        message: 'Insufficient data for accuracy assessment'
      };
    }

    // Simple accuracy assessment based on trend prediction
    const actualScores = recentData.map(entry => entry.complianceScore);
    const predictedScores = [];
    
    for (let i = 2; i < actualScores.length; i++) {
      const trend = actualScores[i-1] - actualScores[i-2];
      const predicted = actualScores[i-1] + trend;
      predictedScores.push(predicted);
    }
    
    const actualForComparison = actualScores.slice(2);
    const errors = predictedScores.map((predicted, i) => Math.abs(predicted - actualForComparison[i]));
    const meanError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    const meanActual = actualForComparison.reduce((sum, score) => sum + score, 0) / actualForComparison.length;
    const accuracyRatio = 1 - (meanError / meanActual);
    
    const confidence = Math.max(30, Math.min(95, Math.round(accuracyRatio * 100)));
    
    return {
      type: 'PREDICTION_ACCURACY_CONFIDENCE',
      confidence: confidence,
      factors: {
        meanError: meanError,
        accuracyRatio: accuracyRatio,
        predictions: predictedScores.length
      }
    };
  }

  // Enhanced: Calculate trend consistency confidence
  calculateTrendConsistencyConfidence(recentData) {
    const scores = recentData.map(entry => entry.complianceScore);
    const trends = [];
    
    for (let i = 1; i < scores.length; i++) {
      trends.push(scores[i] - scores[i-1]);
    }
    
    const meanTrend = trends.reduce((sum, trend) => sum + trend, 0) / trends.length;
    const trendVariance = trends.reduce((sum, trend) => sum + Math.pow(trend - meanTrend, 2), 0) / trends.length;
    const trendConsistency = 1 - (Math.sqrt(trendVariance) / Math.abs(meanTrend));
    
    const confidence = Math.max(30, Math.min(95, Math.round(trendConsistency * 100)));
    
    return {
      type: 'TREND_CONSISTENCY_CONFIDENCE',
      confidence: confidence,
      factors: {
        meanTrend: meanTrend,
        trendVariance: trendVariance,
        consistency: trendConsistency
      }
    };
  }

  // Enhanced: Calculate model reliability confidence
  calculateModelReliabilityConfidence(recentData) {
    let confidence = 60; // Base confidence
    
    // Check for sufficient data points
    if (recentData.length >= 8) confidence += 20;
    else if (recentData.length >= 5) confidence += 10;
    
    // Check for recent data (within last 7 days)
    const now = new Date();
    const recentEntries = recentData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const daysDiff = (now - entryDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    
    if (recentEntries.length >= recentData.length * 0.6) confidence += 15;
    
    // Check for data variety (different types of violations)
    const uniqueViolationTypes = new Set();
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.violationCategories) {
        Object.keys(entry.metrics.violationCategories).forEach(type => uniqueViolationTypes.add(type));
      }
    });
    
    if (uniqueViolationTypes.size >= 3) confidence += 10;
    
    return {
      type: 'MODEL_RELIABILITY_CONFIDENCE',
      confidence: Math.max(30, Math.min(95, Math.round(confidence))),
      factors: {
        dataPoints: recentData.length,
        recentData: recentEntries.length,
        variety: uniqueViolationTypes.size
      }
    };
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

  // Enhanced: Real-time monitoring capabilities
  startRealTimeMonitoring() {
    console.log('🚀 Starting real-time monitoring...');
    
    // Initialize notification system
    this.initializeNotificationSystem();
    
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([
      '**/*.java',
      '**/*.ts',
      '**/*.tsx', 
      '**/*.js',
      '**/*.jsx',
      '**/*.xml',
      '**/*.json',
      '**/*.md'
    ], {
      ignored: ['node_modules/**', 'target/**', 'dist/**', '.git/**', '.agent-os/reports/**'],
      persistent: true,
      ignoreInitial: true
    });

    // Real-time violation tracking
    this.realTimeViolations = [];
    this.realTimeMetrics = {
      startTime: Date.now(),
      filesChanged: 0,
      violationsDetected: 0,
      criticalViolations: 0,
      warnings: 0
    };

    watcher.on('change', (filePath) => {
      this.handleRealTimeFileChange(filePath);
    });

    watcher.on('add', (filePath) => {
      this.handleRealTimeFileChange(filePath, 'added');
    });

    watcher.on('unlink', (filePath) => {
      this.handleRealTimeFileRemoval(filePath);
    });

    console.log('✅ Real-time monitoring active. Press Ctrl+C to stop.');
    return watcher;
  }

  handleRealTimeFileChange(filePath, changeType = 'modified') {
    const startTime = Date.now();
    console.log(`\n📝 File ${changeType}: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const violations = this.validateCode(filePath, content);
      
      // Update real-time metrics
      this.realTimeMetrics.filesChanged++;
      this.realTimeMetrics.violationsDetected += violations.length;
      this.realTimeMetrics.criticalViolations += violations.filter(v => v.type === 'CRITICAL').length;
      this.realTimeMetrics.warnings += violations.filter(v => v.type === 'WARNING').length;
      
      // Track real-time violations
      const realTimeViolation = {
        filePath,
        changeType,
        timestamp: new Date().toISOString(),
        violations,
        processingTime: Date.now() - startTime
      };
      
      this.realTimeViolations.push(realTimeViolation);
      
      // Immediate feedback system
      this.provideImmediateFeedback(realTimeViolation);
      
      // Add configurable alerts for violations
      this.addConfigurableAlertsForViolations(realTimeViolation);
      
      // Implement trend-based notifications
      this.implementTrendBasedNotifications();
      
      // Create improvement milestone alerts
      this.createImprovementMilestoneAlerts();
      
      // Update live dashboard
      this.updateLiveDashboard();
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  handleRealTimeFileRemoval(filePath) {
    console.log(`🗑️  File removed: ${filePath}`);
    
    // Remove any tracked violations for this file
    this.realTimeViolations = this.realTimeViolations.filter(
      v => v.filePath !== filePath
    );
    
    this.updateLiveDashboard();
  }

  provideImmediateFeedback(realTimeViolation) {
    const { filePath, violations, processingTime } = realTimeViolation;
    
    if (violations.length === 0) {
      console.log(`✅ ${filePath} - No violations detected (${processingTime}ms)`);
      return;
    }
    
    console.log(`⚠️  ${filePath} - ${violations.length} violation(s) detected (${processingTime}ms)`);
    
    violations.forEach(violation => {
      const icon = violation.type === 'CRITICAL' ? '🚨' : '⚠️';
      console.log(`  ${icon} ${violation.type}: ${violation.message}`);
      
      if (violation.suggestion) {
        console.log(`     💡 Suggestion: ${violation.suggestion}`);
      }
    });
    
    // Provide quick fix suggestions
    if (violations.length > 0) {
      this.suggestQuickFixes(filePath, violations);
    }
  }

  suggestQuickFixes(filePath, violations) {
    console.log('\n🔧 Quick fix suggestions:');
    
    violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.type} - ${violation.message}`);
      
      if (violation.rule) {
        console.log(`   Rule: ${violation.rule}`);
      }
      
      if (violation.suggestion) {
        console.log(`   Fix: ${violation.suggestion}`);
      }
      
      // Provide specific fix based on violation type
      const specificFix = this.getSpecificFix(violation);
      if (specificFix) {
        console.log(`   Specific: ${specificFix}`);
      }
    });
  }

  getSpecificFix(violation) {
    const fixes = {
      'Code Style': {
        'indentation': 'Use consistent 2-space indentation',
        'naming': 'Follow camelCase for variables, PascalCase for classes',
        'formatting': 'Add proper spacing around operators and brackets'
      },
      'Security': {
        'authentication': 'Implement proper authentication checks',
        'authorization': 'Add authorization validation',
        'input_validation': 'Validate all user inputs'
      },
      'Architecture': {
        'separation_of_concerns': 'Separate business logic from presentation',
        'dependency_injection': 'Use dependency injection instead of direct instantiation',
        'layered_architecture': 'Follow Controller → Service → Repository pattern'
      }
    };
    
    const category = violation.category || 'Code Style';
    const rule = violation.rule || '';
    
    for (const [key, fix] of Object.entries(fixes[category] || {})) {
      if (rule.toLowerCase().includes(key.toLowerCase())) {
        return fix;
      }
    }
    
    return null;
  }

  updateLiveDashboard() {
    // Generate live dashboard data
    const liveData = {
      timestamp: new Date().toISOString(),
      metrics: this.realTimeMetrics,
      recentViolations: this.realTimeViolations.slice(-10), // Last 10 violations
      summary: {
        totalFilesChanged: this.realTimeMetrics.filesChanged,
        totalViolations: this.realTimeMetrics.violationsDetected,
        criticalViolations: this.realTimeMetrics.criticalViolations,
        warnings: this.realTimeMetrics.warnings,
        averageProcessingTime: this.calculateAverageRealTimeProcessingTime()
      }
    };
    
    // Save live dashboard data
    const liveDashboardPath = path.join(__dirname, '../reports/live-dashboard.json');
    fs.writeFileSync(liveDashboardPath, JSON.stringify(liveData, null, 2));
    
    // Generate live HTML dashboard
    this.generateLiveHtmlDashboard(liveData);
  }

  calculateAverageRealTimeProcessingTime() {
    if (this.realTimeViolations.length === 0) return 0;
    
    const totalTime = this.realTimeViolations.reduce((sum, v) => sum + v.processingTime, 0);
    return Math.round(totalTime / this.realTimeViolations.length);
  }

  generateLiveHtmlDashboard(liveData) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Compliance Dashboard</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            text-align: center;
        }
        .live-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #28a745;
            border-radius: 50%;
            margin-right: 10px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .success { color: #28a745; }
        .info { color: #17a2b8; }
        .recent-violations {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        .violation-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .violation-item:last-child {
            border-bottom: none;
        }
        .auto-refresh {
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="live-indicator"></span>
            <h1>Live Compliance Dashboard</h1>
            <p>Real-time monitoring active - Last updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Files Changed</h3>
                <div class="metric-value info">${liveData.summary.totalFilesChanged}</div>
            </div>
            <div class="metric-card">
                <h3>Total Violations</h3>
                <div class="metric-value warning">${liveData.summary.totalViolations}</div>
            </div>
            <div class="metric-card">
                <h3>Critical Violations</h3>
                <div class="metric-value critical">${liveData.summary.criticalViolations}</div>
            </div>
            <div class="metric-card">
                <h3>Warnings</h3>
                <div class="metric-value warning">${liveData.summary.warnings}</div>
            </div>
            <div class="metric-card">
                <h3>Avg Processing Time</h3>
                <div class="metric-value info">${liveData.summary.averageProcessingTime}ms</div>
            </div>
        </div>
        
        <div class="recent-violations">
            <h2>Recent Violations</h2>
            ${liveData.recentViolations.map(v => `
                <div class="violation-item">
                    <div>
                        <strong>${v.filePath}</strong> (${v.changeType})
                        <br>
                        <small>${v.violations.length} violation(s) - ${v.processingTime}ms</small>
                    </div>
                    <div>
                        ${v.violations.filter(v => v.type === 'CRITICAL').length} 🚨
                        ${v.violations.filter(v => v.type === 'WARNING').length} ⚠️
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="auto-refresh">
            <p>Dashboard auto-refreshes every 5 seconds</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh dashboard
        setInterval(() => {
            location.reload();
        }, 5000);
    </script>
</body>
</html>`;
    
    const liveDashboardPath = path.join(__dirname, '../reports/live-dashboard.html');
    fs.writeFileSync(liveDashboardPath, html);
  }

  // Enhanced: Notification system implementation
  initializeNotificationSystem() {
    this.notificationConfig = this.loadNotificationConfig();
    this.notificationHistory = [];
    this.alertThresholds = {
      criticalViolations: 5,
      totalViolations: 20,
      complianceScore: 80,
      processingTime: 5000 // 5 seconds
    };
  }

  loadNotificationConfig() {
    const configPath = path.join(__dirname, '../config/notifications.json');
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load notification config:', error.message);
    }
    
    // Default notification configuration
    return {
      enabled: true,
      alerts: {
        violations: {
          critical: true,
          warning: true,
          threshold: 5
        },
        trends: {
          compliance_decline: true,
          violation_spike: true,
          performance_degradation: true
        },
        milestones: {
          compliance_improvement: true,
          standards_adoption: true,
          performance_optimization: true
        }
      },
      channels: {
        console: true,
        file: true,
        html: true
      },
      frequency: {
        immediate: ['critical_violations'],
        hourly: ['trend_alerts'],
        daily: ['milestone_reports']
      }
    };
  }

  addConfigurableAlertsForViolations(realTimeViolation) {
    const { filePath, violations, processingTime } = realTimeViolation;
    
    // Check for critical violations
    const criticalViolations = violations.filter(v => v.type === 'CRITICAL');
    if (criticalViolations.length > 0 && this.notificationConfig.alerts.violations.critical) {
      this.createViolationAlert('critical', {
        filePath,
        violations: criticalViolations,
        message: `🚨 CRITICAL: ${criticalViolations.length} critical violation(s) detected in ${filePath}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for warning violations
    const warningViolations = violations.filter(v => v.type === 'WARNING');
    if (warningViolations.length >= this.alertThresholds.totalViolations && this.notificationConfig.alerts.violations.warning) {
      this.createViolationAlert('warning', {
        filePath,
        violations: warningViolations,
        message: `⚠️ WARNING: ${warningViolations.length} warning violation(s) detected in ${filePath}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check processing time threshold
    if (processingTime > this.alertThresholds.processingTime) {
      this.createPerformanceAlert('slow_processing', {
        filePath,
        processingTime,
        message: `⏱️ SLOW: File processing took ${processingTime}ms for ${filePath}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  createViolationAlert(type, alertData) {
    const alert = {
      id: this.generateAlertId(),
      type: 'violation',
      severity: type,
      data: alertData,
      timestamp: new Date().toISOString()
    };
    
    this.notificationHistory.push(alert);
    this.sendNotification(alert);
    
    console.log(`🔔 ${alertData.message}`);
  }

  createPerformanceAlert(type, alertData) {
    const alert = {
      id: this.generateAlertId(),
      type: 'performance',
      severity: 'warning',
      data: alertData,
      timestamp: new Date().toISOString()
    };
    
    this.notificationHistory.push(alert);
    this.sendNotification(alert);
    
    console.log(`🔔 ${alertData.message}`);
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sendNotification(alert) {
    // Console notification
    if (this.notificationConfig.channels.console) {
      this.sendConsoleNotification(alert);
    }
    
    // File notification
    if (this.notificationConfig.channels.file) {
      this.saveNotificationToFile(alert);
    }
    
    // HTML notification
    if (this.notificationConfig.channels.html) {
      this.updateNotificationDashboard(alert);
    }
  }

  sendConsoleNotification(alert) {
    const { severity, data } = alert;
    const icon = severity === 'critical' ? '🚨' : '⚠️';
    const color = severity === 'critical' ? '\x1b[31m' : '\x1b[33m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${icon} ${data.message}${reset}`);
    
    if (data.violations) {
      data.violations.forEach(violation => {
        console.log(`  ${color}  • ${violation.message}${reset}`);
      });
    }
  }

  saveNotificationToFile(alert) {
    const notificationsPath = path.join(__dirname, '../reports/notifications.json');
    let notifications = [];
    
    try {
      if (fs.existsSync(notificationsPath)) {
        notifications = JSON.parse(fs.readFileSync(notificationsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load existing notifications:', error.message);
    }
    
    notifications.push(alert);
    
    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications = notifications.slice(-100);
    }
    
    fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));
  }

  updateNotificationDashboard(alert) {
    const dashboardPath = path.join(__dirname, '../reports/notification-dashboard.html');
    
    // Generate notification dashboard HTML
    const html = this.generateNotificationDashboardHtml();
    fs.writeFileSync(dashboardPath, html);
  }

  generateNotificationDashboardHtml() {
    const recentNotifications = this.notificationHistory.slice(-20); // Last 20 notifications
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification Dashboard</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            text-align: center;
        }
        .notification-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 10px;
            border-left: 4px solid #ddd;
        }
        .notification-item.critical {
            border-left-color: #dc3545;
        }
        .notification-item.warning {
            border-left-color: #ffc107;
        }
        .notification-item.info {
            border-left-color: #17a2b8;
        }
        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .notification-time {
            color: #666;
            font-size: 0.9em;
        }
        .notification-message {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .notification-details {
            color: #666;
            font-size: 0.9em;
        }
        .auto-refresh {
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Notification Dashboard</h1>
            <p>Real-time alerts and notifications - Last updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="notifications">
            ${recentNotifications.map(notification => `
                <div class="notification-item ${notification.severity}">
                    <div class="notification-header">
                        <div class="notification-message">${notification.data.message}</div>
                        <div class="notification-time">${new Date(notification.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="notification-details">
                        Type: ${notification.type} | Severity: ${notification.severity}
                        ${notification.data.filePath ? `<br>File: ${notification.data.filePath}` : ''}
                        ${notification.data.processingTime ? `<br>Processing Time: ${notification.data.processingTime}ms` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="auto-refresh">
            <p>Dashboard auto-refreshes every 10 seconds</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh dashboard
        setInterval(() => {
            location.reload();
        }, 10000);
    </script>
</body>
</html>`;
    
    return html;
  }

  implementTrendBasedNotifications() {
    // Analyze recent violations for trends
    const recentViolations = this.realTimeViolations.slice(-10);
    
    if (recentViolations.length < 3) return; // Need at least 3 data points
    
    // Check for compliance decline trend
    const complianceTrend = this.analyzeComplianceTrend(recentViolations);
    if (complianceTrend.declining && this.notificationConfig.alerts.trends.compliance_decline) {
      this.createTrendAlert('compliance_decline', {
        message: `📉 TREND: Compliance score declining - ${complianceTrend.percentage}% decrease`,
        trend: complianceTrend,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for violation spike
    const violationTrend = this.analyzeViolationTrend(recentViolations);
    if (violationTrend.spiking && this.notificationConfig.alerts.trends.violation_spike) {
      this.createTrendAlert('violation_spike', {
        message: `📈 TREND: Violation spike detected - ${violationTrend.increase}% increase`,
        trend: violationTrend,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for performance degradation
    const performanceTrend = this.analyzePerformanceTrend(recentViolations);
    if (performanceTrend.degrading && this.notificationConfig.alerts.trends.performance_degradation) {
      this.createTrendAlert('performance_degradation', {
        message: `⏱️ TREND: Performance degrading - ${performanceTrend.increase}% slower processing`,
        trend: performanceTrend,
        timestamp: new Date().toISOString()
      });
    }
  }

  analyzeComplianceTrend(recentViolations) {
    const complianceScores = recentViolations.map(v => {
      const totalViolations = v.violations.length;
      const criticalViolations = v.violations.filter(v => v.type === 'CRITICAL').length;
      return Math.max(0, 100 - (totalViolations * 2) - (criticalViolations * 10));
    });
    
    const firstHalf = complianceScores.slice(0, Math.floor(complianceScores.length / 2));
    const secondHalf = complianceScores.slice(Math.floor(complianceScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const decline = firstAvg - secondAvg;
    const percentage = Math.round((decline / firstAvg) * 100);
    
    return {
      declining: decline > 5,
      percentage: percentage,
      firstHalf: firstAvg,
      secondHalf: secondAvg
    };
  }

  analyzeViolationTrend(recentViolations) {
    const violationCounts = recentViolations.map(v => v.violations.length);
    
    const firstHalf = violationCounts.slice(0, Math.floor(violationCounts.length / 2));
    const secondHalf = violationCounts.slice(Math.floor(violationCounts.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, count) => sum + count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, count) => sum + count, 0) / secondHalf.length;
    
    const increase = secondAvg - firstAvg;
    const percentage = firstAvg > 0 ? Math.round((increase / firstAvg) * 100) : 0;
    
    return {
      spiking: increase > 2,
      increase: percentage,
      firstHalf: firstAvg,
      secondHalf: secondAvg
    };
  }

  analyzePerformanceTrend(recentViolations) {
    const processingTimes = recentViolations.map(v => v.processingTime);
    
    const firstHalf = processingTimes.slice(0, Math.floor(processingTimes.length / 2));
    const secondHalf = processingTimes.slice(Math.floor(processingTimes.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, time) => sum + time, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, time) => sum + time, 0) / secondHalf.length;
    
    const increase = secondAvg - firstAvg;
    const percentage = firstAvg > 0 ? Math.round((increase / firstAvg) * 100) : 0;
    
    return {
      degrading: increase > 100, // 100ms increase
      increase: percentage,
      firstHalf: firstAvg,
      secondHalf: secondAvg
    };
  }

  createTrendAlert(type, alertData) {
    const alert = {
      id: this.generateAlertId(),
      type: 'trend',
      severity: 'warning',
      data: alertData,
      timestamp: new Date().toISOString()
    };
    
    this.notificationHistory.push(alert);
    this.sendNotification(alert);
    
    console.log(`📊 ${alertData.message}`);
  }

  createImprovementMilestoneAlerts() {
    // Check for compliance improvement milestones
    const currentComplianceScore = this.calculateCurrentComplianceScore();
    
    if (currentComplianceScore >= 95 && !this.milestoneAchieved('high_compliance')) {
      this.createMilestoneAlert('high_compliance', {
        message: `🎉 MILESTONE: High compliance achieved! Score: ${currentComplianceScore}%`,
        score: currentComplianceScore,
        timestamp: new Date().toISOString()
      });
    }
    
    if (currentComplianceScore >= 90 && !this.milestoneAchieved('good_compliance')) {
      this.createMilestoneAlert('good_compliance', {
        message: `✅ MILESTONE: Good compliance achieved! Score: ${currentComplianceScore}%`,
        score: currentComplianceScore,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for performance milestones
    const avgProcessingTime = this.calculateAverageRealTimeProcessingTime();
    
    if (avgProcessingTime < 100 && !this.milestoneAchieved('fast_processing')) {
      this.createMilestoneAlert('fast_processing', {
        message: `⚡ MILESTONE: Fast processing achieved! Avg time: ${avgProcessingTime}ms`,
        processingTime: avgProcessingTime,
        timestamp: new Date().toISOString()
      });
    }
  }

  calculateCurrentComplianceScore() {
    if (this.realTimeViolations.length === 0) return 100;
    
    const totalViolations = this.realTimeMetrics.violationsDetected;
    const criticalViolations = this.realTimeMetrics.criticalViolations;
    
    return Math.max(0, 100 - (totalViolations * 2) - (criticalViolations * 10));
  }

  milestoneAchieved(milestoneType) {
    return this.notificationHistory.some(alert => 
      alert.type === 'milestone' && alert.data.milestoneType === milestoneType
    );
  }

  createMilestoneAlert(milestoneType, alertData) {
    const alert = {
      id: this.generateAlertId(),
      type: 'milestone',
      severity: 'info',
      data: {
        ...alertData,
        milestoneType
      },
      timestamp: new Date().toISOString()
    };
    
    this.notificationHistory.push(alert);
    this.sendNotification(alert);
    
    console.log(`🎉 ${alertData.message}`);
  }

  buildNotificationCustomization() {
    // Allow users to customize notification settings
    const customizationPath = path.join(__dirname, '../config/notification-customization.json');
    
    const defaultCustomization = {
      thresholds: {
        criticalViolations: 1,
        totalViolations: 5,
        complianceScore: 85,
        processingTime: 3000
      },
      channels: {
        console: true,
        file: true,
        html: true,
        email: false,
        slack: false
      },
      frequency: {
        immediate: ['critical_violations', 'performance_alerts'],
        hourly: ['trend_alerts'],
        daily: ['milestone_reports', 'summary_reports']
      },
      filters: {
        fileTypes: ['java', 'ts', 'js', 'tsx', 'jsx'],
        excludePaths: ['node_modules', 'target', 'dist'],
        minSeverity: 'warning'
      }
    };
    
    if (!fs.existsSync(customizationPath)) {
      fs.writeFileSync(customizationPath, JSON.stringify(defaultCustomization, null, 2));
    }
    
    return defaultCustomization;
  }
}

// CLI execution
if (require.main === module) {
  const checker = new ComplianceChecker();
  const command = process.argv[2] || 'check';
  const targetPath = process.argv[3] || '.';
  
  if (command === 'monitor') {
    console.log('🚀 Starting real-time compliance monitoring...');
    console.log('📊 Live dashboard will be available at: .agent-os/reports/live-dashboard.html');
    console.log('📈 Real-time data will be saved to: .agent-os/reports/live-dashboard.json');
    
    const watcher = checker.startRealTimeMonitoring();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping real-time monitoring...');
      watcher.close();
      process.exit(0);
    });
  } else {
    const result = checker.validateCodebase(targetPath);
    const report = checker.generateReport();
    
    // Exit with error code if critical violations found
    const criticalViolations = report.violations.filter(v => v.type === 'CRITICAL');
    process.exit(criticalViolations.length > 0 ? 1 : 0);
  }
}

module.exports = ComplianceChecker; 
module.exports = ComplianceChecker; 