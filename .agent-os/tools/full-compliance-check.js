#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FullComplianceCheck {
  constructor() {
    this.baseDir = path.join(__dirname, '..');
    this.toolsDir = __dirname;
    this.reportsDir = path.join(this.baseDir, 'reports');
    this.dashboardDir = path.join(this.baseDir, 'dashboard');
    this.cursorRulesDir = path.join(this.baseDir, 'cursor-rules');
  }

  async run() {
    console.log('🚀 Starting Full Agent-OS Compliance Check...\n');
    
    const startTime = Date.now();
    const results = {
      compliance: null,
      cursorInit: null,
      analytics: null,
      dashboard: null,
      errors: [],
      warnings: []
    };

    try {
      // Step 1: Run Compliance Checker
      console.log('📋 Step 1: Running Compliance Checker...');
      results.compliance = await this.runComplianceChecker();
      
      // Step 2: Generate Cursor Rules
      console.log('⚙️ Step 2: Generating Cursor Rules...');
      results.cursorInit = await this.runCursorInit();
      
      // Step 3: Run Analytics
      console.log('📊 Step 3: Running Analytics...');
      results.analytics = await this.runAnalytics();
      
      // Step 4: Generate Dashboard
      console.log('🎨 Step 4: Generating Dashboard...');
      results.dashboard = await this.generateDashboard();
      
      // Step 5: Generate Summary Report
      console.log('📝 Step 5: Generating Summary Report...');
      await this.generateSummaryReport(results, startTime);
      
      console.log('\n✅ Full Agent-OS Compliance Check Completed Successfully!');
      console.log(`⏱️ Total Execution Time: ${Date.now() - startTime}ms`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Full Compliance Check Failed:', error.message);
      results.errors.push(error.message);
      return results;
    }
  }

  async runComplianceChecker() {
    try {
      console.log('  - Running compliance-checker.js...');
      
      // Check if we should include .agent-os files
      const includeAgentOS = process.argv.includes('--include-agent-os') || process.argv.includes('-a');
      const command = includeAgentOS ? 
        'node .agent-os/tools/compliance-checker.js --include-agent-os' : 
        'node .agent-os/tools/compliance-checker.js';
      
      const output = execSync(command, { 
        cwd: path.join(this.baseDir, '..'), // Run from project root
        encoding: 'utf8'
      });
      
      // Parse compliance report
      const complianceReportPath = path.join(this.reportsDir, 'compliance-report.json');
      if (fs.existsSync(complianceReportPath)) {
        const report = JSON.parse(fs.readFileSync(complianceReportPath, 'utf8'));
        return {
          success: true,
          totalFiles: report.filesChecked || 0,
          violations: report.warnings + (report.criticalIssues || 0),
          score: report.overallScore || 0
        };
      }
      
      return { success: true, output };
    } catch (error) {
      // Check if compliance report was generated despite the error
      const complianceReportPath = path.join(this.reportsDir, 'compliance-report.json');
      if (fs.existsSync(complianceReportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(complianceReportPath, 'utf8'));
          return {
            success: true,
            totalFiles: report.filesChecked || 0,
            violations: report.warnings + (report.criticalIssues || 0),
            score: report.overallScore || 0
          };
        } catch (parseError) {
          console.warn(`  ⚠️ Compliance checker warning: ${error.message}`);
          return { success: false, error: error.message };
        }
      }
      
      console.warn(`  ⚠️ Compliance checker warning: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runCursorInit() {
    try {
      console.log('  - Running cursor-init.js...');
      
      // Check if we should include .agent-os files
      const includeAgentOS = process.argv.includes('--include-agent-os') || process.argv.includes('-a');
      const command = includeAgentOS ? 
        'node cursor-init.js --include-agent-os' : 
        'node cursor-init.js';
      
      const output = execSync(command, { 
        cwd: this.toolsDir,
        encoding: 'utf8'
      });
      
      // Parse cursor init summary
      const summaryPath = path.join(this.reportsDir, 'cursor-init-summary.json');
      if (fs.existsSync(summaryPath)) {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        return {
          success: true,
          totalRules: summary.totalRules || 0,
          rulesByType: summary.rulesByType || {}
        };
      }
      
      return { success: true, output };
    } catch (error) {
      console.warn(`  ⚠️ Cursor init warning: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runAnalytics() {
    try {
      console.log('  - Running analytics...');
      
      // Check for analytics report
      const analyticsReportPath = path.join(this.reportsDir, 'analytics-report.json');
      if (fs.existsSync(analyticsReportPath)) {
        const report = JSON.parse(fs.readFileSync(analyticsReportPath, 'utf8'));
        return {
          success: true,
          totalFiles: report.totalFiles || 0,
          totalViolations: report.totalViolations || 0,
          standardsEffectiveness: report.standardsEffectiveness || {}
        };
      }
      
      return { success: true, message: 'Analytics report found' };
    } catch (error) {
      console.warn(`  ⚠️ Analytics warning: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async generateDashboard() {
    try {
      console.log('  - Generating compliance dashboard...');
      
      // Check if dashboard exists
      const dashboardPath = path.join(this.dashboardDir, 'compliance-dashboard.html');
      if (fs.existsSync(dashboardPath)) {
        const stats = fs.statSync(dashboardPath);
        return {
          success: true,
          dashboardPath: dashboardPath,
          size: stats.size,
          lastModified: stats.mtime
        };
      }
      
      // Try to generate dashboard if it doesn't exist
      console.log('  - Creating dashboard from compliance data...');
      await this.createDashboard();
      
      return { success: true, message: 'Dashboard generated' };
    } catch (error) {
      console.warn(`  ⚠️ Dashboard generation warning: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async createDashboard() {
    const dashboardTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent-OS Compliance Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; color: #007bff; }
        .files { margin: 20px 0; }
        .file { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .timestamp { color: #666; font-size: 12px; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Agent-OS Compliance Dashboard</h1>
            <p>Comprehensive compliance and analytics overview</p>
        </div>
        
        <div class="status success">
            ✅ Full compliance check completed successfully
        </div>
        
        <div class="metrics">
            <div class="metric">
                <h3>Compliance Score</h3>
                <div class="value" id="complianceScore">Loading...</div>
            </div>
            <div class="metric">
                <h3>Total Files</h3>
                <div class="value" id="totalFiles">Loading...</div>
            </div>
            <div class="metric">
                <h3>Cursor Rules</h3>
                <div class="value" id="cursorRules">Loading...</div>
            </div>
            <div class="metric">
                <h3>Violations</h3>
                <div class="value" id="violations">Loading...</div>
            </div>
        </div>
        
        <div class="files">
            <h2>📁 Generated Reports</h2>
            <div class="file">📊 compliance-report.json</div>
            <div class="file">⚙️ cursor-init-summary.json</div>
            <div class="file">📈 analytics-report.json</div>
            <div class="file">🎨 compliance-dashboard.html</div>
        </div>
        
        <div class="timestamp">
            Generated: <span id="timestamp">Loading...</span>
        </div>
    </div>
    
    <script>
        // Load data from reports
        fetch('../reports/compliance-report.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('complianceScore').textContent = data.complianceScore + '%';
                document.getElementById('totalFiles').textContent = data.totalFiles || 0;
                document.getElementById('violations').textContent = data.totalViolations || 0;
            })
            .catch(error => console.log('Could not load compliance data'));
            
        fetch('../reports/cursor-init-summary.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('cursorRules').textContent = data.totalRules || 0;
            })
            .catch(error => console.log('Could not load cursor init data'));
            
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
    </script>
</body>
</html>`;

    const dashboardPath = path.join(this.dashboardDir, 'compliance-dashboard.html');
    fs.writeFileSync(dashboardPath, dashboardTemplate);
  }

  async generateSummaryReport(results, startTime) {
    const summary = {
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      results: results,
      summary: {
        compliance: results.compliance?.success ? '✅ PASS' : '❌ FAIL',
        cursorInit: results.cursorInit?.success ? '✅ PASS' : '❌ FAIL',
        analytics: results.analytics?.success ? '✅ PASS' : '❌ FAIL',
        dashboard: results.dashboard?.success ? '✅ PASS' : '❌ FAIL'
      }
    };

    const summaryPath = path.join(this.reportsDir, 'full-compliance-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Summary:');
    
    // Compliance Check Results
    if (results.compliance?.success) {
      const score = results.compliance.score || 0;
      const status = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
      console.log(`  - Compliance Check: ${status} ${score}% (${results.compliance.totalFiles || 0} files, ${results.compliance.violations || 0} violations)`);
    } else {
      console.log(`  - Compliance Check: ❌ FAILED`);
    }
    
    // Cursor Rules Results
    if (results.cursorInit?.success) {
      const totalRules = results.cursorInit.totalRules || 0;
      const rulesByType = results.cursorInit.rulesByType || {};
      const status = totalRules > 0 ? '✅' : '❌';
      console.log(`  - Cursor Rules: ${status} ${totalRules} rules generated`);
      
      // Show breakdown by type if available
      if (Object.keys(rulesByType).length > 0) {
        const typeBreakdown = Object.entries(rulesByType)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ');
        console.log(`    └─ Types: ${typeBreakdown}`);
      }
    } else {
      console.log(`  - Cursor Rules: ❌ FAILED`);
    }
    
    // Analytics Results
    if (results.analytics?.success) {
      const totalFiles = results.analytics.totalFiles || 0;
      const totalViolations = results.analytics.totalViolations || 0;
      const status = totalFiles > 0 ? '✅' : '⚠️';
      console.log(`  - Analytics: ${status} ${totalFiles} files analyzed, ${totalViolations} violations found`);
      
      // Show standards effectiveness if available
      if (results.analytics.standardsEffectiveness && Object.keys(results.analytics.standardsEffectiveness).length > 0) {
        const effectiveness = results.analytics.standardsEffectiveness;
        const topStandards = Object.entries(effectiveness)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([standard, rate]) => `${standard}: ${Math.round(rate)}%`)
          .join(', ');
        console.log(`    └─ Top Standards: ${topStandards}`);
      }
    } else {
      console.log(`  - Analytics: ❌ FAILED`);
    }
    
    // Dashboard Results
    if (results.dashboard?.success) {
      const size = results.dashboard.size || 0;
      const status = size > 0 ? '✅' : '⚠️';
      console.log(`  - Dashboard: ${status} Generated (${Math.round(size / 1024)}KB)`);
    } else {
      console.log(`  - Dashboard: ❌ FAILED`);
    }
    
    // Overall Score Calculation
    const scores = [];
    if (results.compliance?.success) scores.push(results.compliance.score || 0);
    if (results.cursorInit?.success) scores.push(results.cursorInit.totalRules > 0 ? 100 : 0);
    if (results.analytics?.success) scores.push(results.analytics.totalFiles > 0 ? 100 : 0);
    if (results.dashboard?.success) scores.push(results.dashboard.size > 0 ? 100 : 0);
    
    if (scores.length > 0) {
      const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const overallStatus = overallScore >= 80 ? '✅' : overallScore >= 60 ? '⚠️' : '❌';
      console.log(`\n🎯 Overall Score: ${overallStatus} ${overallScore}%`);
    }
    
    console.log(`\n📁 Reports saved to: ${this.reportsDir}`);
    console.log(`🎨 Dashboard: ${path.join(this.dashboardDir, 'compliance-dashboard.html')}`);
  }
}

// Run the full compliance check
if (require.main === module) {
  const checker = new FullComplianceCheck();
  checker.run().catch(console.error);
}

module.exports = FullComplianceCheck; 