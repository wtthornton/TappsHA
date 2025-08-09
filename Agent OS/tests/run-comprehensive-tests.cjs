#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Agent-OS Dashboard
 * Executes all test suites and generates detailed reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, total: 0, duration: 0 },
      integration: { passed: 0, failed: 0, total: 0, duration: 0 },
      visual: { passed: 0, failed: 0, total: 0, duration: 0 },
      performance: { passed: 0, failed: 0, total: 0, duration: 0 },
      features: { passed: 0, failed: 0, total: 0, duration: 0 }
    };
    this.startTime = Date.now();
    this.reportPath = path.join(__dirname, '../reports/comprehensive-test-report.json');
    this.featuresPath = path.join(__dirname, '../features');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkDashboardRunning() {
    try {
      const http = require('http');
      return new Promise((resolve) => {
        const req = http.request('http://localhost:3011/api/status', (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => resolve(false));
        req.end();
      });
    } catch (error) {
      return false;
    }
  }

  async runUnitTests() {
    this.log('Starting Unit Tests...');
    
    try {
      const startTime = Date.now();
      const result = execSync('npx vitest run tests/unit/dashboard-core.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const duration = Date.now() - startTime;
      const parsed = JSON.parse(result);
      
      this.testResults.unit.total = parsed.numTotalTests;
      this.testResults.unit.passed = parsed.numPassedTests;
      this.testResults.unit.failed = parsed.numFailedTests;
      this.testResults.unit.duration = duration;
      
      this.log(`Unit Tests: ${this.testResults.unit.passed}/${this.testResults.unit.total} passed (${duration}ms)`, 'success');
    } catch (error) {
      this.log(`Unit Tests failed: ${error.message}`, 'error');
      this.testResults.unit.failed = 1;
    }
  }

  async runIntegrationTests() {
    this.log('Starting Integration Tests...');
    
    try {
      const startTime = Date.now();
      const result = execSync('npx vitest run tests/integration/dashboard-api.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const duration = Date.now() - startTime;
      const parsed = JSON.parse(result);
      
      this.testResults.integration.total = parsed.numTotalTests;
      this.testResults.integration.passed = parsed.numPassedTests;
      this.testResults.integration.failed = parsed.numFailedTests;
      this.testResults.integration.duration = duration;
      
      this.log(`Integration Tests: ${this.testResults.integration.passed}/${this.testResults.integration.total} passed (${duration}ms)`, 'success');
    } catch (error) {
      this.log(`Integration Tests failed: ${error.message}`, 'error');
      this.testResults.integration.failed = 1;
    }
  }

  async runVisualTests() {
    this.log('Starting Visual Regression Tests...');
    
    try {
      const startTime = Date.now();
      const result = execSync('npx playwright test tests/visual/dashboard-visual.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const duration = Date.now() - startTime;
      const parsed = JSON.parse(result);
      
      this.testResults.visual.total = parsed.suites[0]?.specs?.length || 0;
      this.testResults.visual.passed = parsed.suites[0]?.specs?.filter(s => s.tests[0]?.results[0]?.status === 'passed').length || 0;
      this.testResults.visual.failed = this.testResults.visual.total - this.testResults.visual.passed;
      this.testResults.visual.duration = duration;
      
      this.log(`Visual Tests: ${this.testResults.visual.passed}/${this.testResults.visual.total} passed (${duration}ms)`, 'success');
    } catch (error) {
      this.log(`Visual Tests failed: ${error.message}`, 'error');
      this.testResults.visual.failed = 1;
    }
  }

  async runPerformanceTests() {
    this.log('Starting Performance Tests...');
    
    try {
      const startTime = Date.now();
      const result = execSync('npx playwright test tests/performance/dashboard-performance.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const duration = Date.now() - startTime;
      const parsed = JSON.parse(result);
      
      this.testResults.performance.total = parsed.suites[0]?.specs?.length || 0;
      this.testResults.performance.passed = parsed.suites[0]?.specs?.filter(s => s.tests[0]?.results[0]?.status === 'passed').length || 0;
      this.testResults.performance.failed = this.testResults.performance.total - this.testResults.performance.passed;
      this.testResults.performance.duration = duration;
      
      this.log(`Performance Tests: ${this.testResults.performance.passed}/${this.testResults.performance.total} passed (${duration}ms)`, 'success');
    } catch (error) {
      this.log(`Performance Tests failed: ${error.message}`, 'error');
      this.testResults.performance.failed = 1;
    }
  }

  async runFeatureTests() {
    this.log('Starting Feature Validation Tests...');
    
    try {
      const startTime = Date.now();
      
      // Check if features directory exists and has expected files
      const featureFiles = [
        'real-time-metrics.json',
        'advanced-charts.json',
        'smart-alerts.json',
        'predictive-analytics.json',
        'modern-ui.json',
        'api-extensions.json',
        'feature-summary.json'
      ];
      
      let passed = 0;
      let total = featureFiles.length;
      
      for (const file of featureFiles) {
        const filePath = path.join(this.featuresPath, file);
        if (fs.existsSync(filePath)) {
          try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (content.name && content.description) {
              passed++;
            }
          } catch (error) {
            this.log(`Feature file ${file} has invalid JSON`, 'error');
          }
        } else {
          this.log(`Feature file ${file} not found`, 'error');
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.testResults.features.total = total;
      this.testResults.features.passed = passed;
      this.testResults.features.failed = total - passed;
      this.testResults.features.duration = duration;
      
      this.log(`Feature Tests: ${passed}/${total} passed (${duration}ms)`, 'success');
    } catch (error) {
      this.log(`Feature Tests failed: ${error.message}`, 'error');
      this.testResults.features.failed = 1;
    }
  }

  generateComprehensiveReport() {
    const totalTime = Date.now() - this.startTime;
    const totalTests = Object.values(this.testResults).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(this.testResults).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.testResults).reduce((sum, category) => sum + category.failed, 0);
    const totalDuration = Object.values(this.testResults).reduce((sum, category) => sum + category.duration, 0);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(2) : 0,
        executionTime: totalTime,
        totalDuration
      },
      categories: this.testResults,
      recommendations: this.generateRecommendations(),
      dashboardStatus: {
        running: true,
        port: 3011,
        features: this.getFeatureSummary()
      }
    };

    // Ensure reports directory exists
    const reportsDir = path.dirname(this.reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save report
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  getFeatureSummary() {
    try {
      const summaryPath = path.join(this.featuresPath, 'feature-summary.json');
      if (fs.existsSync(summaryPath)) {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        return summary;
      }
    } catch (error) {
      this.log('Could not read feature summary', 'warning');
    }
    return { totalFeatures: 0, features: [] };
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.testResults.unit.failed > 0) {
      recommendations.push({
        category: 'Unit Tests',
        priority: 'high',
        action: 'Review and fix failing unit tests for core dashboard functionality'
      });
    }

    if (this.testResults.integration.failed > 0) {
      recommendations.push({
        category: 'Integration Tests',
        priority: 'high',
        action: 'Check dashboard API endpoints and ensure server is running on port 3011'
      });
    }

    if (this.testResults.visual.failed > 0) {
      recommendations.push({
        category: 'Visual Tests',
        priority: 'medium',
        action: 'Review visual regression test failures and update baseline screenshots if needed'
      });
    }

    if (this.testResults.performance.failed > 0) {
      recommendations.push({
        category: 'Performance Tests',
        priority: 'medium',
        action: 'Optimize dashboard performance to meet performance budgets'
      });
    }

    if (this.testResults.features.failed > 0) {
      recommendations.push({
        category: 'Feature Tests',
        priority: 'medium',
        action: 'Validate feature implementations and ensure all required files exist'
      });
    }

    // Add positive recommendations for successful tests
    if (this.testResults.unit.passed > 0) {
      recommendations.push({
        category: 'Quality Assurance',
        priority: 'low',
        action: 'Consider adding more edge case tests to improve coverage'
      });
    }

    if (this.testResults.performance.passed > 0) {
      recommendations.push({
        category: 'Performance',
        priority: 'low',
        action: 'Monitor performance trends and set up automated performance regression testing'
      });
    }

    return recommendations;
  }

  displayResults(report) {
    console.log('\n🎯 === COMPREHENSIVE TEST RESULTS ===');
    console.log(`📊 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.totalPassed}`);
    console.log(`❌ Failed: ${report.summary.totalFailed}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}%`);
    console.log(`⏱️  Total Execution Time: ${report.summary.executionTime}ms`);
    console.log(`📁 Report saved to: ${this.reportPath}`);
    
    console.log('\n📋 Category Breakdown:');
    Object.entries(this.testResults).forEach(([category, results]) => {
      const status = results.failed === 0 ? '✅' : '❌';
      console.log(`   ${status} ${category.toUpperCase()}: ${results.passed}/${results.total} passed (${results.duration}ms)`);
    });

    if (report.recommendations.length > 0) {
      console.log('\n🔧 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${index + 1}. ${priority} ${rec.category}: ${rec.action}`);
      });
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive Agent-OS Dashboard Test Suite');
    
    // Check if dashboard is running
    const isRunning = await this.checkDashboardRunning();
    if (!isRunning) {
      this.log('⚠️  Dashboard not running on port 3011. Some tests may fail.');
      this.log('Start the dashboard with: node .agent-os/tools/enhanced-dashboard.js');
    } else {
      this.log('✅ Dashboard is running on port 3011');
    }

    // Run all test suites
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runVisualTests();
    await this.runPerformanceTests();
    await this.runFeatureTests();

    // Generate and display report
    const report = this.generateComprehensiveReport();
    this.displayResults(report);

    // Exit with appropriate code
    const exitCode = report.summary.totalFailed > 0 ? 1 : 0;
    process.exit(exitCode);
  }
}

// Run the comprehensive test suite
const runner = new ComprehensiveTestRunner();
runner.run().catch(error => {
  console.error('❌ Comprehensive test runner failed:', error);
  process.exit(1);
});
