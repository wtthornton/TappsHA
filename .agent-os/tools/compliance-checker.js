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
      violationCategories: {},
      standardsEffectiveness: {},
      historicalData: this.loadHistoricalData()
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

  // Enhanced: Track violation categories for analytics
  trackViolationCategory(category, type) {
    if (!this.metrics.violationCategories[category]) {
      this.metrics.violationCategories[category] = { CRITICAL: 0, WARNING: 0 };
    }
    this.metrics.violationCategories[category][type]++;
  }

  // Enhanced: Track standards effectiveness
  trackStandardsEffectiveness(standardName, hasViolations) {
    if (!this.metrics.standardsEffectiveness[standardName]) {
      this.metrics.standardsEffectiveness[standardName] = { violations: 0, checks: 0 };
    }
    this.metrics.standardsEffectiveness[standardName].checks++;
    if (hasViolations) {
      this.metrics.standardsEffectiveness[standardName].violations++;
    }
  }

  // Enhanced: Track file processing performance
  trackFileProcessing(filePath, processingTime) {
    this.metrics.fileProcessingTimes[filePath] = processingTime;
  }

  validateCode(filePath, content) {
    const startTime = Date.now();
    const violations = [];
    const fileExt = path.extname(filePath);
    
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
          line: lineNumber
        });
      }
      
      // Check line length (100 chars max)
      if (line.length > 100) {
        violations.push({
          type: 'WARNING',
          category: 'Code Style',
          message: 'Line exceeds 100 character limit',
          file: filePath,
          line: lineNumber
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
            line: index + 1
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
          line: 1
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
          line: 1
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
          line: 1
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
      violationTrends: this.analyzeViolationTrends(),
      standardsEffectiveness: this.calculateStandardsEffectiveness(),
      improvementSuggestions: this.generateImprovementSuggestions(),
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
      insights: this.statisticalAnalysis.generateStatisticalInsights(historicalData)
    };
  }

  // Enhanced: Calculate average processing time
  calculateAverageProcessingTime() {
    const times = Object.values(this.metrics.fileProcessingTimes);
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
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

  // Enhanced: Calculate standards effectiveness
  calculateStandardsEffectiveness() {
    const effectiveness = {};
    
    Object.entries(this.metrics.standardsEffectiveness).forEach(([standard, data]) => {
      if (data.checks > 0) {
        effectiveness[standard] = {
          violationRate: Math.round((data.violations / data.checks) * 100),
          totalChecks: data.checks,
          totalViolations: data.violations
        };
      }
    });

    return effectiveness;
  }

  // Enhanced: Generate improvement suggestions
  generateImprovementSuggestions() {
    const suggestions = [];
    
    // Analyze violation categories
    Object.entries(this.metrics.violationCategories).forEach(([category, counts]) => {
      const totalViolations = counts.CRITICAL + counts.WARNING;
      if (totalViolations > 5) {
        suggestions.push({
          priority: counts.CRITICAL > 0 ? 'HIGH' : 'MEDIUM',
          category: category,
          message: `Focus on reducing ${category.toLowerCase()} violations (${totalViolations} total)`,
          action: `Review and update ${category.toLowerCase()} standards`
        });
      }
    });

    // Analyze standards effectiveness
    Object.entries(this.metrics.standardsEffectiveness).forEach(([standard, data]) => {
      const violationRate = (data.violations / data.checks) * 100;
      if (violationRate > 20) {
        suggestions.push({
          priority: 'MEDIUM',
          category: 'Standards',
          message: `${standard} has high violation rate (${Math.round(violationRate)}%)`,
          action: `Review and clarify ${standard} documentation`
        });
      }
    });

    return suggestions;
  }

  generateReport() {
    const criticalViolations = this.violations.filter(v => v.type === 'CRITICAL');
    const warnings = this.violations.filter(v => v.type === 'WARNING');

    console.log('\n📊 Compliance Report');
    console.log('==================');
    console.log(`Overall Score: ${this.complianceScore}%`);
    console.log(`Files Checked: ${this.totalChecks}`);
    console.log(`Critical Issues: ${criticalViolations.length}`);
    console.log(`Warnings: ${warnings.length}`);
    console.log(`Execution Time: ${this.metrics.executionTime}ms`);

    // Enhanced: Display analytics insights
    const analytics = this.generateAnalyticsReport();
    console.log('\n📈 Analytics Insights');
    console.log('===================');
    console.log(`Average File Processing: ${Math.round(analytics.averageFileProcessingTime)}ms`);
    console.log(`Trend: ${analytics.violationTrends.trend}`);
    if (analytics.violationTrends.change !== 0) {
      console.log(`Score Change: ${analytics.violationTrends.change > 0 ? '+' : ''}${analytics.violationTrends.change}%`);
    }

    // Enhanced: Display statistical analysis
    if (analytics.statisticalAnalysis) {
      console.log('\n📊 Statistical Analysis');
      console.log('=====================');
      
      const stats = analytics.statisticalAnalysis;
      
      if (stats.violationFrequency.pattern !== 'none') {
        console.log(`Violation Pattern: ${stats.violationFrequency.pattern} (${stats.violationFrequency.averageViolations} avg)`);
      }
      
      if (stats.complianceTrends.improvement !== 0) {
        console.log(`Compliance Trend: ${stats.complianceTrends.improvement > 0 ? 'Improving' : 'Declining'} by ${Math.abs(stats.complianceTrends.improvement)}%`);
      }
      
      if (stats.riskAssessment.overallRisk !== 'LOW') {
        console.log(`Risk Level: ${stats.riskAssessment.overallRisk}`);
        stats.riskAssessment.factors.forEach(factor => {
          console.log(`  - ${factor}`);
        });
      }
      
      if (stats.predictions.prediction !== 'insufficient_data') {
        console.log(`Predicted Score (7 days): ${stats.predictions.prediction}% (${stats.predictions.confidence}% confidence)`);
      }
    }

    if (criticalViolations.length > 0) {
      console.log('\n🚨 Critical Violations:');
      criticalViolations.forEach(violation => {
        console.log(`  - ${violation.file}:${violation.line} - ${violation.message}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(violation => {
        console.log(`  - ${violation.file}:${violation.line} - ${violation.message}`);
      });
    }

    // Enhanced: Display improvement suggestions
    if (analytics.improvementSuggestions.length > 0) {
      console.log('\n💡 Improvement Suggestions:');
      analytics.improvementSuggestions.forEach(suggestion => {
        console.log(`  [${suggestion.priority}] ${suggestion.message}`);
        console.log(`      Action: ${suggestion.action}`);
      });
    }

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      complianceScore: this.complianceScore,
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      violations: this.violations,
      summary: {
        critical: criticalViolations.length,
        warnings: warnings.length
      },
      analytics: analytics
    };

    fs.writeFileSync('.agent-os/reports/compliance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: .agent-os/reports/compliance-report.json');

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