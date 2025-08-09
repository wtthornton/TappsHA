#!/usr/bin/env node

/**
 * Agent-OS Dashboard Test Runner
 * Executes comprehensive testing suite for the dashboard
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DashboardTestRunner {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      visual: { passed: 0, failed: 0, total: 0 },
      performance: { passed: 0, failed: 0, total: 0 }
    };
    this.startTime = Date.now();
    this.reportPath = path.join(__dirname, '../reports/dashboard-test-report.json');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
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
      const result = execSync('npx vitest run tests/unit/dashboard-core.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const parsed = JSON.parse(result);
      this.testResults.unit.total = parsed.numTotalTests;
      this.testResults.unit.passed = parsed.numPassedTests;
      this.testResults.unit.failed = parsed.numFailedTests;
      
      this.log(`Unit Tests: ${this.testResults.unit.passed}/${this.testResults.unit.total} passed`, 'success');
    } catch (error) {
      this.log(`Unit Tests failed: ${error.message}`, 'error');
      this.testResults.unit.failed = 1;
    }
  }

  async runIntegrationTests() {
    this.log('Starting Integration Tests...');
    
    try {
      const result = execSync('npx vitest run tests/integration/dashboard-api.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const parsed = JSON.parse(result);
      this.testResults.integration.total = parsed.numTotalTests;
      this.testResults.integration.passed = parsed.numPassedTests;
      this.testResults.integration.failed = parsed.numFailedTests;
      
      this.log(`Integration Tests: ${this.testResults.integration.passed}/${this.testResults.integration.total} passed`, 'success');
    } catch (error) {
      this.log(`Integration Tests failed: ${error.message}`, 'error');
      this.testResults.integration.failed = 1;
    }
  }

  async runVisualTests() {
    this.log('Starting Visual Regression Tests...');
    
    try {
      const result = execSync('npx playwright test tests/visual/dashboard-visual.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const parsed = JSON.parse(result);
      this.testResults.visual.total = parsed.suites[0]?.specs?.length || 0;
      this.testResults.visual.passed = parsed.suites[0]?.specs?.filter(s => s.tests[0]?.results[0]?.status === 'passed').length || 0;
      this.testResults.visual.failed = this.testResults.visual.total - this.testResults.visual.passed;
      
      this.log(`Visual Tests: ${this.testResults.visual.passed}/${this.testResults.visual.total} passed`, 'success');
    } catch (error) {
      this.log(`Visual Tests failed: ${error.message}`, 'error');
      this.testResults.visual.failed = 1;
    }
  }

  async runPerformanceTests() {
    this.log('Starting Performance Tests...');
    
    try {
      const result = execSync('npx playwright test tests/performance/dashboard-performance.test.ts --reporter=json', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      
      const parsed = JSON.parse(result);
      this.testResults.performance.total = parsed.suites[0]?.specs?.length || 0;
      this.testResults.performance.passed = parsed.suites[0]?.specs?.filter(s => s.tests[0]?.results[0]?.status === 'passed').length || 0;
      this.testResults.performance.failed = this.testResults.performance.total - this.testResults.performance.passed;
      
      this.log(`Performance Tests: ${this.testResults.performance.passed}/${this.testResults.performance.total} passed`, 'success');
    } catch (error) {
      this.log(`Performance Tests failed: ${error.message}`, 'error');
      this.testResults.performance.failed = 1;
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalTests = Object.values(this.testResults).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(this.testResults).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.testResults).reduce((sum, category) => sum + category.failed, 0);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(2) : 0,
        executionTime: totalTime
      },
      categories: this.testResults,
      recommendations: this.generateRecommendations()
    };

    // Ensure reports directory exists
    const reportsDir = path.dirname(this.reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save report
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    this.log('=== Dashboard Test Results ===');
    this.log(`Total Tests: ${totalTests}`);
    this.log(`Passed: ${totalPassed}`);
    this.log(`Failed: ${totalFailed}`);
    this.log(`Success Rate: ${report.summary.successRate}%`);
    this.log(`Execution Time: ${totalTime}ms`);
    this.log(`Report saved to: ${this.reportPath}`);

    return report;
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

    if (this.testResults.unit.passed === 0 && this.testResults.unit.total > 0) {
      recommendations.push({
        category: 'Test Setup',
        priority: 'critical',
        action: 'Check test configuration and ensure all dependencies are installed'
      });
    }

    return recommendations;
  }

  async run() {
    this.log('🚀 Starting Agent-OS Dashboard Test Suite');
    
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

    // Generate and display report
    const report = this.generateReport();

    // Exit with appropriate code
    const exitCode = report.summary.totalFailed > 0 ? 1 : 0;
    process.exit(exitCode);
  }
}

// Run the test suite
const runner = new DashboardTestRunner();
runner.run().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
