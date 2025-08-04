#!/usr/bin/env node

/**
 * Real-Time Cursor Integration for Standards Compliance
 * Provides immediate feedback on standards violations during development
 */

const fs = require('fs');
const path = require('path');
const ComplianceChecker = require('./compliance-checker');

class CursorIntegration {
  constructor() {
    this.checker = new ComplianceChecker();
    this.watchMode = false;
    this.lastReport = null;
  }

  /**
   * Real-time validation when file changes
   */
  onFileChange(filePath, content) {
    console.log(`🔍 Validating ${filePath}...`);
    
    const violations = this.checker.validateCode(filePath, content);
    
    if (violations.length > 0) {
      console.log(`⚠️  Found ${violations.length} violations in ${filePath}:`);
      
      violations.forEach(violation => {
        const icon = violation.type === 'CRITICAL' ? '🚨' : '⚠️';
        console.log(`  ${icon} ${violation.message} (line ${violation.line})`);
      });

      // Provide auto-fix suggestions
      this.suggestFixes(filePath, violations);
    } else {
      console.log(`✅ ${filePath} passes all standards checks`);
    }

    return violations;
  }

  /**
   * Comprehensive check on file save
   */
  onSave(filePath) {
    console.log(`💾 Running comprehensive check on ${filePath}...`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const violations = this.onFileChange(filePath, content);
      
      // Update compliance dashboard
      this.updateComplianceDashboard();
      
      // Generate improvement suggestions
      this.generateImprovementSuggestions(filePath, violations);
      
      return violations;
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error.message);
      return [];
    }
  }

  /**
   * Suggest automatic fixes for violations
   */
  suggestFixes(filePath, violations) {
    console.log('\n🔧 Auto-fix suggestions:');
    
    violations.forEach(violation => {
      switch (violation.category) {
        case 'Code Style':
          this.suggestCodeStyleFixes(filePath, violation);
          break;
        case 'Security':
          this.suggestSecurityFixes(filePath, violation);
          break;
        case 'Architecture':
          this.suggestArchitectureFixes(filePath, violation);
          break;
        case 'Technology Stack':
          this.suggestTechnologyStackFixes(filePath, violation);
          break;
      }
    });
  }

  suggestCodeStyleFixes(filePath, violation) {
    if (violation.message.includes('100 character limit')) {
      console.log(`  📝 Split long line at ${violation.line} into multiple lines`);
    }
    
    if (violation.message.includes('2-space indentation')) {
      console.log(`  📝 Replace tabs with 2 spaces at line ${violation.line}`);
    }
  }

  suggestSecurityFixes(filePath, violation) {
    if (violation.message.includes('Hardcoded secrets')) {
      console.log(`  🔐 Replace hardcoded secrets with environment variables`);
      console.log(`     Example: process.env.API_KEY instead of "your-api-key"`);
    }
    
    if (violation.message.includes('SQL injection')) {
      console.log(`  🔐 Use @Param annotation for dynamic queries`);
      console.log(`     Example: @Query("SELECT u FROM User u WHERE u.name = :name")`);
    }
  }

  suggestArchitectureFixes(filePath, violation) {
    if (violation.message.includes('@RestController')) {
      console.log(`  🏗️  Add @RestController and @RequestMapping annotations`);
      console.log(`     Example: @RestController @RequestMapping("/api/v1")`);
    }
    
    if (violation.message.includes('@Service')) {
      console.log(`  🏗️  Add @Service annotation to service class`);
    }
    
    if (violation.message.includes('@Repository')) {
      console.log(`  🏗️  Add @Repository annotation or extend JpaRepository`);
    }
  }

  suggestTechnologyStackFixes(filePath, violation) {
    if (violation.message.includes('Spring Boot')) {
      console.log(`  🔧 Update to Spring Boot 3.3+ in pom.xml`);
      console.log(`     Example: <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.3.0</version></parent>`);
    }
    
    if (violation.message.includes('React version')) {
      console.log(`  🔧 Update React to version 19.x in package.json`);
      console.log(`     Example: "react": "^19.0.0"`);
    }
  }

  /**
   * Generate improvement suggestions
   */
  generateImprovementSuggestions(filePath, violations) {
    if (violations.length === 0) return;

    console.log('\n💡 Improvement suggestions:');
    
    const criticalCount = violations.filter(v => v.type === 'CRITICAL').length;
    const warningCount = violations.filter(v => v.type === 'WARNING').length;
    
    if (criticalCount > 0) {
      console.log(`  🚨 Address ${criticalCount} critical issues first`);
    }
    
    if (warningCount > 0) {
      console.log(`  ⚠️  Consider fixing ${warningCount} warnings for better code quality`);
    }
    
    // Suggest specific improvements based on file type
    const fileExt = path.extname(filePath);
    switch (fileExt) {
      case '.java':
        this.suggestJavaImprovements(filePath);
        break;
      case '.ts':
      case '.tsx':
        this.suggestTypeScriptImprovements(filePath);
        break;
      case '.xml':
        this.suggestXmlImprovements(filePath);
        break;
    }
  }

  suggestJavaImprovements(filePath) {
    console.log(`  ☕ Java-specific improvements:`);
    console.log(`     - Add comprehensive unit tests`);
    console.log(`     - Implement proper exception handling`);
    console.log(`     - Add logging with SLF4J`);
    console.log(`     - Use Spring Boot Actuator for monitoring`);
  }

  suggestTypeScriptImprovements(filePath) {
    console.log(`  📘 TypeScript-specific improvements:`);
    console.log(`     - Add proper TypeScript types`);
    console.log(`     - Use functional components with hooks`);
    console.log(`     - Implement proper error boundaries`);
    console.log(`     - Add accessibility attributes`);
  }

  suggestXmlImprovements(filePath) {
    console.log(`  📄 XML-specific improvements:`);
    console.log(`     - Validate XML structure`);
    console.log(`     - Add proper documentation`);
    console.log(`     - Use consistent formatting`);
  }

  /**
   * Update compliance dashboard
   */
  updateComplianceDashboard() {
    const dashboardPath = '.agent-os/dashboard/compliance-dashboard.json';
    const dashboardDir = path.dirname(dashboardPath);
    
    if (!fs.existsSync(dashboardDir)) {
      fs.mkdirSync(dashboardDir, { recursive: true });
    }

    const dashboard = {
      lastUpdated: new Date().toISOString(),
      overallScore: this.checker.complianceScore,
      totalFiles: this.checker.totalChecks,
      violations: this.checker.violations,
      trends: this.calculateTrends()
    };

    fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
  }

  calculateTrends() {
    // Simple trend calculation based on recent violations
    const recentViolations = this.checker.violations.filter(v => 
      new Date() - new Date(v.timestamp || Date.now()) < 24 * 60 * 60 * 1000
    );

    return {
      dailyViolations: recentViolations.length,
      criticalTrend: recentViolations.filter(v => v.type === 'CRITICAL').length,
      warningTrend: recentViolations.filter(v => v.type === 'WARNING').length
    };
  }

  /**
   * Start file watching mode
   */
  startWatchMode() {
    console.log('👀 Starting file watch mode...');
    this.watchMode = true;
    
    // Watch for file changes in the project
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([
      '**/*.java',
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.xml',
      '**/*.json'
    ], {
      ignored: ['node_modules/**', 'target/**', 'dist/**', '.git/**'],
      persistent: true
    });

    watcher.on('change', (filePath) => {
      console.log(`\n📝 File changed: ${filePath}`);
      this.onSave(filePath);
    });

    console.log('✅ File watch mode active. Press Ctrl+C to stop.');
  }

  /**
   * Generate comprehensive report
   */
  generateComprehensiveReport() {
    console.log('📊 Generating comprehensive compliance report...');
    
    const result = this.checker.validateCodebase('.');
    const report = this.checker.generateReport();
    
    // Generate HTML dashboard
    this.generateHtmlDashboard(report);
    
    return report;
  }

  // Enhanced: Generate comprehensive HTML dashboard with analytics
  generateHtmlDashboard(report) {
    const analytics = report.analytics || {};
    const stats = analytics.statisticalAnalysis || {};
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Compliance Dashboard</title>
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
        }
        .score { 
            font-size: 3em; 
            font-weight: bold; 
            text-align: center;
            margin: 20px 0;
        }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .success { color: #28a745; }
        .info { color: #17a2b8; }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metric-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #495057;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .violation { 
            margin: 10px 0; 
            padding: 15px; 
            border-left: 4px solid; 
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .critical { border-color: #dc3545; background: #f8d7da; }
        .warning { border-color: #ffc107; background: #fff3cd; }
        
        .analytics-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px 0;
        }
        
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px 0;
            position: relative;
        }
        
        .chart-canvas {
            width: 100%;
            height: 300px;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            background: #f8f9fa;
        }
        
        .chart-controls {
            margin-top: 15px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .chart-btn {
            padding: 8px 16px;
            border: 1px solid #007bff;
            background: white;
            color: #007bff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.2s;
        }
        
        .chart-btn:hover {
            background: #007bff;
            color: white;
        }
        
        .chart-btn.active {
            background: #007bff;
            color: white;
        }
        
        .chart-legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.9em;
        }
        
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }
        
        .issue-item {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 4px solid #007bff;
        }
        
        .severity-critical { border-left-color: #dc3545; }
        .severity-high { border-left-color: #fd7e14; }
        .severity-medium { border-left-color: #ffc107; }
        
        .file-type-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        
        .file-type-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
        }
        
        .trend-indicator {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .trend-improving { background: #d4edda; color: #155724; }
        .trend-declining { background: #f8d7da; color: #721c24; }
        .trend-stable { background: #fff3cd; color: #856404; }
        
        .chart-tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.9em;
            pointer-events: none;
            z-index: 1000;
            display: none;
        }
        
        @media (max-width: 768px) {
            .metrics-grid { grid-template-columns: 1fr; }
            .file-type-stats { grid-template-columns: 1fr; }
            .chart-controls { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Enhanced Compliance Dashboard</h1>
            <div class="score ${report.complianceScore >= 90 ? 'success' : report.complianceScore >= 70 ? 'warning' : 'critical'}">
                ${report.complianceScore}%
            </div>
            <p style="text-align: center; margin: 0;">Overall Compliance Score</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">📁 Files Checked</div>
                <div class="metric-value">${report.totalChecks}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">🚨 Critical Issues</div>
                <div class="metric-value critical">${report.summary.critical}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">⚠️ Warnings</div>
                <div class="metric-value warning">${report.summary.warnings}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">⚡ Execution Time</div>
                <div class="metric-value info">${analytics.executionTime || 0}ms</div>
            </div>
        </div>
        
        <!-- Interactive Charts Section -->
        <div class="chart-container">
            <h2>📊 Interactive Analytics Charts</h2>
            <div class="chart-controls">
                <button class="chart-btn active" onclick="switchChart('compliance')">Compliance Trend</button>
                <button class="chart-btn" onclick="switchChart('violations')">Violation Distribution</button>
                <button class="chart-btn" onclick="switchChart('performance')">Performance Metrics</button>
                <button class="chart-btn" onclick="switchChart('fileTypes')">File Type Analysis</button>
            </div>
            
            <canvas id="mainChart" class="chart-canvas"></canvas>
            <div id="chartLegend" class="chart-legend"></div>
        </div>
        
        <div class="chart-tooltip" id="tooltip"></div>
        
        ${analytics.averageFileProcessingTime && typeof analytics.averageFileProcessingTime === 'object' ? `
        <div class="analytics-section">
            <h2>📊 File Processing Performance</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-title">Overall Average</div>
                    <div class="metric-value">${analytics.averageFileProcessingTime.overallAverage}ms</div>
                    <div>${analytics.averageFileProcessingTime.totalFiles} files processed</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Total Processing Time</div>
                    <div class="metric-value">${analytics.averageFileProcessingTime.totalTime}ms</div>
                </div>
            </div>
            
            ${analytics.averageFileProcessingTime.fileTypePerformance ? `
            <h3>📈 Performance by File Type</h3>
            <div class="file-type-stats">
                ${Object.entries(analytics.averageFileProcessingTime.fileTypePerformance).map(([fileType, stats]) => `
                <div class="file-type-card">
                    <div style="font-weight: bold; font-size: 1.2em;">${fileType}</div>
                    <div>${stats.averageTime}ms avg</div>
                    <div>${stats.count} files</div>
                    <div>${stats.averageSize} bytes avg</div>
                </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        ${stats.violationPatterns && stats.violationPatterns.patterns.length > 0 ? `
        <div class="analytics-section">
            <h2>🔍 Violation Patterns Detected</h2>
            ${stats.violationPatterns.patterns.map(pattern => `
            <div class="issue-item">
                <strong>${pattern.type}</strong><br>
                ${pattern.description}
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${stats.recurringIssues && stats.recurringIssues.recurringIssues.length > 0 ? `
        <div class="analytics-section">
            <h2>⚠️ Recurring Compliance Issues</h2>
            ${stats.recurringIssues.recurringIssues.map(issue => `
            <div class="issue-item severity-${issue.severity.toLowerCase()}">
                <strong>[${issue.severity}] ${issue.type}</strong><br>
                ${issue.description}<br>
                <em>Recommendation: ${issue.recommendation}</em>
            </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 4px;">
                <strong>Summary:</strong> ${stats.recurringIssues.totalIssues} recurring issues detected
                ${stats.recurringIssues.criticalIssues > 0 ? `<br>🚨 Critical: ${stats.recurringIssues.criticalIssues}` : ''}
                ${stats.recurringIssues.highIssues > 0 ? `<br>⚠️ High: ${stats.recurringIssues.highIssues}` : ''}
                ${stats.recurringIssues.mediumIssues > 0 ? `<br>📊 Medium: ${stats.recurringIssues.mediumIssues}` : ''}
            </div>
        </div>
        ` : ''}
        
        ${stats.violationClustering && stats.violationClustering.clusters.length > 0 ? `
        <div class="analytics-section">
            <h2>🔍 Violation Clustering Analysis</h2>
            
            ${stats.violationClustering.clusters.length > 0 ? `
            <h3>📊 Detected Violation Clusters</h3>
            ${stats.violationClustering.clusters.map((cluster, index) => `
            <div class="issue-item severity-${cluster.severity.toLowerCase()}">
                <strong>[${cluster.type}] ${cluster.category}</strong><br>
                ${cluster.description}<br>
                <em>Recommendation: ${cluster.recommendation}</em>
            </div>
            `).join('')}
            ` : ''}
            
            ${stats.violationClustering.patterns.length > 0 ? `
            <h3>📈 Detected Patterns</h3>
            ${stats.violationClustering.patterns.map((pattern, index) => `
            <div class="issue-item">
                <strong>[${pattern.type}] ${pattern.trend}</strong><br>
                ${pattern.description}<br>
                <em>Recommendation: ${pattern.recommendation}</em>
            </div>
            `).join('')}
            ` : ''}
            
            ${stats.violationClustering.insights.length > 0 ? `
            <h3>💡 Clustering Insights</h3>
            ${stats.violationClustering.insights.map((insight, index) => `
            <div class="issue-item severity-${insight.priority.toLowerCase()}">
                <strong>[${insight.type}] ${insight.priority}</strong><br>
                ${insight.message}<br>
                <em>Action: ${insight.action}</em>
            </div>
            `).join('')}
            ` : ''}
            
            <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 4px;">
                <strong>Clustering Summary:</strong><br>
                🔍 Total Clusters: ${stats.violationClustering.totalClusters}<br>
                📈 Total Patterns: ${stats.violationClustering.totalPatterns}<br>
                💡 Total Insights: ${stats.violationClustering.totalInsights}
                ${stats.violationClustering.highSeverityClusters > 0 ? `<br>🚨 High Severity Clusters: ${stats.violationClustering.highSeverityClusters}` : ''}
                ${stats.violationClustering.fileTypeClusters > 0 ? `<br>📁 File Type Clusters: ${stats.violationClustering.fileTypeClusters}` : ''}
                ${stats.violationClustering.severityClusters > 0 ? `<br>⚠️ Severity Clusters: ${stats.violationClustering.severityClusters}` : ''}
            </div>
        </div>
        ` : ''}
        
        ${stats.issuePredictions && stats.issuePredictions.predictions.length > 0 ? `
        <div class="analytics-section">
            <h2>🔮 Compliance Issue Predictions</h2>
            ${stats.issuePredictions.predictions.map((prediction, index) => `
            <div class="issue-item severity-${prediction.probability.toLowerCase()}">
                <strong>[${prediction.type}] ${prediction.issue}</strong><br>
                ${prediction.description} (${prediction.confidence}% confidence)<br>
                <em>Recommendation: ${prediction.recommendation}</em>
            </div>
            `).join('')}
            
            <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 4px;">
                <strong>Prediction Summary:</strong><br>
                🔮 Total Predictions: ${stats.issuePredictions.totalPredictions}<br>
                🚨 High Probability: ${stats.issuePredictions.highProbabilityPredictions}<br>
                ⚠️ Medium Probability: ${stats.issuePredictions.mediumProbabilityPredictions}<br>
                📊 Low Probability: ${stats.issuePredictions.lowProbabilityPredictions}<br>
                🚨 Critical Predictions: ${stats.issuePredictions.criticalPredictions}<br>
                📈 Overall Confidence: ${stats.issuePredictions.confidence}%
            </div>
        </div>
        ` : ''}
        
        ${analytics.validationPerformance ? `
        <div class="analytics-section">
            <h2>⚡ Validation Performance</h2>
            <div class="file-type-stats">
                ${Object.entries(analytics.validationPerformance).map(([validationType, stats]) => `
                <div class="file-type-card">
                    <div style="font-weight: bold; font-size: 1.2em;">${validationType}</div>
                    <div>${stats.averageTime}ms avg</div>
                    <div>${stats.count} checks</div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${analytics.violationTrends && analytics.violationTrends.trend !== 'insufficient_data' ? `
        <div class="analytics-section">
            <h2>📈 Compliance Trends</h2>
            <div class="trend-indicator trend-${analytics.violationTrends.trend}">
                ${analytics.violationTrends.trend.toUpperCase()}
            </div>
            ${analytics.violationTrends.change !== 0 ? `
            <div style="margin-top: 10px;">
                Score Change: ${analytics.violationTrends.change > 0 ? '+' : ''}${analytics.violationTrends.change}%
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        ${report.violations.length > 0 ? `
        <div class="analytics-section">
            <h2>🚨 Violations</h2>
            ${report.violations.map(v => `
            <div class="violation ${v.type.toLowerCase()}">
                <strong>${v.file}:${v.line}</strong> - ${v.message}
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${analytics.improvementSuggestions && analytics.improvementSuggestions.length > 0 ? `
        <div class="analytics-section">
            <h2>💡 Improvement Suggestions</h2>
            ${analytics.improvementSuggestions.map(suggestion => `
            <div class="issue-item">
                <strong>[${suggestion.priority}] ${suggestion.category}</strong><br>
                ${suggestion.message}<br>
                <em>Action: ${suggestion.action}</em>
            </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
    
    <script>
        // Chart data from analytics
        const chartData = {
            compliance: ${JSON.stringify(analytics.violationTrends || {})},
            violations: {
                critical: ${report.summary.critical || 0},
                warnings: ${report.summary.warnings || 0},
                passed: ${report.passedChecks || 0}
            },
            performance: ${JSON.stringify(analytics.averageFileProcessingTime || {})},
            fileTypes: ${JSON.stringify(analytics.averageFileProcessingTime?.fileTypePerformance || {})}
        };
        
        let currentChart = 'compliance';
        let canvas, ctx, tooltip;
        
        // Initialize chart
        document.addEventListener('DOMContentLoaded', function() {
            canvas = document.getElementById('mainChart');
            ctx = canvas.getContext('2d');
            tooltip = document.getElementById('tooltip');
            
            // Set canvas size
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            // Draw initial chart
            drawChart(currentChart);
            
            // Add canvas event listeners
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', hideTooltip);
            
            // Auto-refresh dashboard every 30 seconds
            setTimeout(() => {
                window.location.reload();
            }, 30000);
            
            // Add interactive features for sections
            const sections = document.querySelectorAll('.analytics-section');
            sections.forEach(section => {
                const title = section.querySelector('h2');
                if (title) {
                    title.style.cursor = 'pointer';
                    title.addEventListener('click', () => {
                        const content = section.querySelectorAll('div:not(:first-child)');
                        content.forEach(el => {
                            el.style.display = el.style.display === 'none' ? 'block' : 'none';
                        });
                    });
                }
            });
        });
        
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        
        function switchChart(type) {
            currentChart = type;
            
            // Update button states
            document.querySelectorAll('.chart-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            drawChart(type);
        }
        
        function drawChart(type) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            switch(type) {
                case 'compliance':
                    drawComplianceChart();
                    break;
                case 'violations':
                    drawViolationsChart();
                    break;
                case 'performance':
                    drawPerformanceChart();
                    break;
                case 'fileTypes':
                    drawFileTypesChart();
                    break;
            }
        }
        
        function drawComplianceChart() {
            const data = chartData.compliance;
            if (!data || data.trend === 'insufficient_data') {
                drawNoDataMessage('Compliance trend data not available');
                return;
            }
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) * 0.6;
            
            // Draw gauge chart
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#e9ecef';
            ctx.lineWidth = 20;
            ctx.stroke();
            
            // Draw score arc
            const score = ${report.complianceScore || 0};
            const angle = (score / 100) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI/2, -Math.PI/2 + angle);
            ctx.strokeStyle = score >= 90 ? '#28a745' : score >= 70 ? '#ffc107' : '#dc3545';
            ctx.lineWidth = 20;
            ctx.stroke();
            
            // Draw score text
            ctx.fillStyle = '#333';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(score + '%', centerX, centerY + 10);
            
            // Draw trend indicator
            ctx.font = '16px Arial';
            ctx.fillText(data.trend || 'stable', centerX, centerY + 50);
            
            updateLegend([
                { label: 'Compliance Score', color: score >= 90 ? '#28a745' : score >= 70 ? '#ffc107' : '#dc3545' },
                { label: 'Trend: ' + (data.trend || 'stable'), color: '#6c757d' }
            ]);
        }
        
        function drawViolationsChart() {
            const data = chartData.violations;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) * 0.6;
            
            const total = data.critical + data.warnings + data.passed;
            if (total === 0) {
                drawNoDataMessage('No violation data available');
                return;
            }
            
            let currentAngle = -Math.PI / 2;
            const colors = ['#dc3545', '#ffc107', '#28a745'];
            const labels = ['Critical', 'Warnings', 'Passed'];
            const values = [data.critical, data.warnings, data.passed];
            
            values.forEach((value, index) => {
                if (value > 0) {
                    const sliceAngle = (value / total) * 2 * Math.PI;
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                    ctx.closePath();
                    ctx.fillStyle = colors[index];
                    ctx.fill();
                    
                    currentAngle += sliceAngle;
                }
            });
            
            // Draw center text
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Total: ' + total, centerX, centerY);
            
            updateLegend([
                { label: 'Critical (' + data.critical + ')', color: '#dc3545' },
                { label: 'Warnings (' + data.warnings + ')', color: '#ffc107' },
                { label: 'Passed (' + data.passed + ')', color: '#28a745' }
            ]);
        }
        
        function drawPerformanceChart() {
            const data = chartData.performance;
            if (!data || !data.fileTypePerformance) {
                drawNoDataMessage('Performance data not available');
                return;
            }
            
            const fileTypes = Object.keys(data.fileTypePerformance);
            if (fileTypes.length === 0) {
                drawNoDataMessage('No file type performance data');
                return;
            }
            
            const maxTime = Math.max(...fileTypes.map(type => data.fileTypePerformance[type].averageTime));
            const barWidth = canvas.width / (fileTypes.length + 1);
            const maxBarHeight = canvas.height * 0.6;
            
            fileTypes.forEach((type, index) => {
                const time = data.fileTypePerformance[type].averageTime;
                const barHeight = (time / maxTime) * maxBarHeight;
                const x = (index + 1) * barWidth;
                const y = canvas.height - barHeight - 60;
                
                // Draw bar
                ctx.fillStyle = '#007bff';
                ctx.fillRect(x - barWidth/3, y, barWidth/1.5, barHeight);
                
                // Draw label
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(type, x, canvas.height - 40);
                ctx.fillText(time + 'ms', x, y - 10);
            });
            
            updateLegend([
                { label: 'Average Processing Time', color: '#007bff' }
            ]);
        }
        
        function drawFileTypesChart() {
            const data = chartData.fileTypes;
            if (!data || Object.keys(data).length === 0) {
                drawNoDataMessage('File type data not available');
                return;
            }
            
            const fileTypes = Object.keys(data);
            const maxCount = Math.max(...fileTypes.map(type => data[type].count));
            const barWidth = canvas.width / (fileTypes.length + 1);
            const maxBarHeight = canvas.height * 0.6;
            
            fileTypes.forEach((type, index) => {
                const count = data[type].count;
                const barHeight = (count / maxCount) * maxBarHeight;
                const x = (index + 1) * barWidth;
                const y = canvas.height - barHeight - 60;
                
                // Draw bar
                ctx.fillStyle = '#28a745';
                ctx.fillRect(x - barWidth/3, y, barWidth/1.5, barHeight);
                
                // Draw label
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(type, x, canvas.height - 40);
                ctx.fillText(count + ' files', x, y - 10);
            });
            
            updateLegend([
                { label: 'File Count', color: '#28a745' }
            ]);
        }
        
        function drawNoDataMessage(message) {
            ctx.fillStyle = '#6c757d';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        }
        
        function updateLegend(items) {
            const legend = document.getElementById('chartLegend');
            legend.innerHTML = items.map(item => 
                '<div class="legend-item">' +
                '<div class="legend-color" style="background-color: ' + item.color + ';"></div>' +
                '<span>' + item.label + '</span>' +
                '</div>'
            ).join('');
        }
        
        function handleMouseMove(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Simple tooltip for chart interaction
            if (currentChart === 'performance' || currentChart === 'fileTypes') {
                const barWidth = canvas.width / (Object.keys(chartData[currentChart]).length + 1);
                const barIndex = Math.floor(x / barWidth) - 1;
                const fileTypes = Object.keys(chartData[currentChart]);
                
                if (barIndex >= 0 && barIndex < fileTypes.length) {
                    const type = fileTypes[barIndex];
                    const data = chartData[currentChart][type];
                    
                    tooltip.style.display = 'block';
                    tooltip.style.left = event.clientX + 10 + 'px';
                    tooltip.style.top = event.clientY - 30 + 'px';
                    tooltip.innerHTML = '<strong>' + type + '</strong><br>' +
                        (currentChart === 'performance' ? 
                            'Avg Time: ' + data.averageTime + 'ms<br>Count: ' + data.count + ' files' :
                            'Count: ' + data.count + ' files<br>Avg Size: ' + data.averageSize + ' bytes');
                } else {
                    hideTooltip();
                }
            }
        }
        
        function hideTooltip() {
            tooltip.style.display = 'none';
        }
    </script>
</body>
</html>`;

    // Ensure dashboard directory exists
    const dashboardDir = '.agent-os/dashboard';
    if (!fs.existsSync(dashboardDir)) {
      fs.mkdirSync(dashboardDir, { recursive: true });
    }
    
    fs.writeFileSync('.agent-os/dashboard/compliance-dashboard.html', html);
    console.log('📄 Enhanced HTML dashboard with interactive charts saved to: .agent-os/dashboard/compliance-dashboard.html');
  }
}

// CLI execution
if (require.main === module) {
  const integration = new CursorIntegration();
  
  const command = process.argv[2];
  const filePath = process.argv[3];
  
  switch (command) {
    case 'check':
      if (filePath) {
        integration.onSave(filePath);
      } else {
        integration.generateComprehensiveReport();
      }
      break;
      
    case 'watch':
      integration.startWatchMode();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node cursor-integration.js check [file-path]  - Check specific file or entire codebase');
      console.log('  node cursor-integration.js watch              - Start file watching mode');
      break;
  }
}

module.exports = CursorIntegration; 