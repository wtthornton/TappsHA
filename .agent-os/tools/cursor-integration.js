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
    
    // Enhanced HTML escaping function for template literals
    const escapeHtml = (str) => {
      if (typeof str !== 'string') return String(str);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    
    // Enhanced path resolution for cross-platform compatibility
    const resolvePath = (filePath) => {
      if (!filePath) return '';
      return filePath.replace(/\\/g, '/').replace(/\/+/g, '/');
    };
    
    // Enhanced data validation and fallbacks
    const safeGet = (obj, path, defaultValue = '') => {
      try {
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
          if (result && typeof result === 'object' && key in result) {
            result = result[key];
          } else {
            return defaultValue;
          }
        }
        return result !== undefined && result !== null ? result : defaultValue;
      } catch (error) {
        return defaultValue;
      }
    };
    
    // Enhanced array mapping with error handling
    const safeMap = (array, callback, fallback = '') => {
      try {
        if (!Array.isArray(array)) return fallback;
        return array.map(callback).join('');
      } catch (error) {
        console.warn('Error in safeMap:', error.message);
        return fallback;
      }
    };
    
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
            <div class="score ${safeGet(report, 'complianceScore', 0) >= 90 ? 'success' : safeGet(report, 'complianceScore', 0) >= 70 ? 'warning' : 'critical'}">
                ${escapeHtml(safeGet(report, 'complianceScore', 0))}%
            </div>
            <p style="text-align: center; margin: 0;">Overall Compliance Score</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">📁 Files Checked</div>
                <div class="metric-value">${escapeHtml(safeGet(report, 'totalChecks', 0))}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">🚨 Critical Issues</div>
                <div class="metric-value critical">${escapeHtml(safeGet(report, 'summary.critical', 0))}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">⚠️ Warnings</div>
                <div class="metric-value warning">${escapeHtml(safeGet(report, 'summary.warnings', 0))}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">⚡ Execution Time</div>
                <div class="metric-value info">${escapeHtml(safeGet(analytics, 'executionTime', 0))}ms</div>
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
                <button class="chart-btn" onclick="switchChart('trends')">Trend Analysis</button>
                <button class="chart-btn" onclick="switchChart('forecasts')">Forecast Charts</button>
                <button class="chart-btn" onclick="switchChart('timeline')">Violation Timeline</button>
                <button class="chart-btn" onclick="switchChart('comparison')">Trend Comparison</button>
            </div>
            
            <canvas id="mainChart" class="chart-canvas"></canvas>
            <div id="chartLegend" class="chart-legend"></div>
        </div>
        
        <div class="chart-tooltip" id="tooltip"></div>
        
        ${safeGet(analytics, 'averageFileProcessingTime') && typeof safeGet(analytics, 'averageFileProcessingTime') === 'object' ? `
        <div class="analytics-section">
            <h2>📊 File Processing Performance</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-title">Overall Average</div>
                    <div class="metric-value">${escapeHtml(safeGet(analytics, 'averageFileProcessingTime.overallAverage', 0))}ms</div>
                    <div>${escapeHtml(safeGet(analytics, 'averageFileProcessingTime.totalFiles', 0))} files processed</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Total Processing Time</div>
                    <div class="metric-value">${escapeHtml(safeGet(analytics, 'averageFileProcessingTime.totalTime', 0))}ms</div>
                </div>
            </div>
            
            ${safeGet(analytics, 'averageFileProcessingTime.fileTypePerformance') ? `
            <h3>📈 Performance by File Type</h3>
            <div class="file-type-stats">
                ${safeMap(Object.entries(safeGet(analytics, 'averageFileProcessingTime.fileTypePerformance', {})), ([fileType, stats]) => `
                <div class="file-type-card">
                    <div style="font-weight: bold; font-size: 1.2em;">${escapeHtml(fileType)}</div>
                    <div>${escapeHtml(safeGet(stats, 'averageTime', 0))}ms avg</div>
                    <div>${escapeHtml(safeGet(stats, 'count', 0))} files</div>
                    <div>${escapeHtml(safeGet(stats, 'averageSize', 0))} bytes avg</div>
                </div>
                `, '')}
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        ${safeGet(stats, 'violationPatterns.patterns') && safeGet(stats, 'violationPatterns.patterns').length > 0 ? `
        <div class="analytics-section">
            <h2>🔍 Violation Patterns Detected</h2>
            ${safeMap(safeGet(stats, 'violationPatterns.patterns', []), pattern => `
            <div class="issue-item">
                <strong>${escapeHtml(safeGet(pattern, 'type', 'Unknown'))}</strong><br>
                ${escapeHtml(safeGet(pattern, 'description', 'No description available'))}
            </div>
            `, '')}
        </div>
        ` : ''}
        
        ${safeGet(stats, 'recurringIssues.recurringIssues') && safeGet(stats, 'recurringIssues.recurringIssues').length > 0 ? `
        <div class="analytics-section">
            <h2>⚠️ Recurring Compliance Issues</h2>
            ${safeMap(safeGet(stats, 'recurringIssues.recurringIssues', []), issue => `
            <div class="issue-item severity-${escapeHtml(safeGet(issue, 'severity', 'medium').toLowerCase())}">
                <strong>[${escapeHtml(safeGet(issue, 'severity', 'Unknown'))}] ${escapeHtml(safeGet(issue, 'type', 'Unknown'))}</strong><br>
                ${escapeHtml(safeGet(issue, 'description', 'No description available'))}<br>
                <em>Recommendation: ${escapeHtml(safeGet(issue, 'recommendation', 'No recommendation available'))}</em>
            </div>
            `, '')}
            
            <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 4px;">
                <strong>Summary:</strong> ${escapeHtml(safeGet(stats, 'recurringIssues.totalIssues', 0))} recurring issues detected
                ${safeGet(stats, 'recurringIssues.criticalIssues', 0) > 0 ? `<br>🚨 Critical: ${escapeHtml(safeGet(stats, 'recurringIssues.criticalIssues', 0))}` : ''}
                ${safeGet(stats, 'recurringIssues.highIssues', 0) > 0 ? `<br>⚠️ High: ${escapeHtml(safeGet(stats, 'recurringIssues.highIssues', 0))}` : ''}
                ${safeGet(stats, 'recurringIssues.mediumIssues', 0) > 0 ? `<br>📊 Medium: ${escapeHtml(safeGet(stats, 'recurringIssues.mediumIssues', 0))}` : ''}
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
        
        <!-- Progress Tracking Dashboard -->
        <div class="analytics-section">
            <h2>📈 Progress Tracking Dashboard</h2>
            
            <!-- Overall Progress -->
            <div class="progress-section">
                <h3>🎯 Overall Compliance Progress</h3>
                <div class="progress-metrics">
                    <div class="progress-card">
                        <div class="progress-title">Current Score</div>
                        <div class="progress-value ${report.complianceScore >= 80 ? 'success' : report.complianceScore >= 60 ? 'warning' : 'critical'}">${report.complianceScore}%</div>
                        <div class="progress-trend">
                            ${analytics.violationTrends && analytics.violationTrends.trend !== 'insufficient_data' ? 
                                `Trend: ${analytics.violationTrends.trend === 'improving' ? '↗️ Improving' : analytics.violationTrends.trend === 'declining' ? '↘️ Declining' : '→ Stable'}` : 
                                'Trend: Insufficient data'
                            }
                        </div>
                    </div>
                    
                    <div class="progress-card">
                        <div class="progress-title">Violation Reduction</div>
                        <div class="progress-value ${report.summary.critical === 0 ? 'success' : report.summary.critical <= 2 ? 'warning' : 'critical'}">${report.summary.critical} Critical</div>
                        <div class="progress-subtitle">${report.summary.warnings} Warnings</div>
                    </div>
                    
                    <div class="progress-card">
                        <div class="progress-title">Files Processed</div>
                        <div class="progress-value info">${report.totalChecks}</div>
                        <div class="progress-subtitle">${report.passedChecks} Passed</div>
                    </div>
                </div>
            </div>
            
            <!-- Standards Progress -->
            ${stats.standardsEffectiveness && Object.keys(stats.standardsEffectiveness).length > 0 ? `
            <div class="progress-section">
                <h3>📋 Standards Compliance Progress</h3>
                <div class="standards-progress">
                    ${Object.entries(stats.standardsEffectiveness).map(([standard, data]) => `
                    <div class="standard-progress-card">
                        <div class="standard-name">${standard}</div>
                        <div class="standard-compliance ${data.complianceRate >= 80 ? 'high' : data.complianceRate >= 60 ? 'medium' : 'low'}">
                            ${Math.round(data.complianceRate)}% compliant
                        </div>
                        <div class="standard-trend">
                            ${data.trend === 'IMPROVING' ? '↗️' : data.trend === 'DECLINING' ? '↘️' : '→'} ${data.trend}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Performance Progress -->
            ${analytics.averageFileProcessingTime ? `
            <div class="progress-section">
                <h3>⚡ Performance Progress</h3>
                <div class="performance-progress">
                    <div class="performance-card">
                        <div class="performance-title">Processing Speed</div>
                        <div class="performance-value">${analytics.averageFileProcessingTime.overallAverage}ms avg</div>
                        <div class="performance-subtitle">${analytics.averageFileProcessingTime.totalFiles} files</div>
                    </div>
                    
                    <div class="performance-card">
                        <div class="performance-title">Execution Time</div>
                        <div class="performance-value">${analytics.executionTime || 0}ms</div>
                        <div class="performance-subtitle">Total runtime</div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Improvement Suggestions -->
            ${report.improvementSuggestions && report.improvementSuggestions.length > 0 ? `
            <div class="progress-section">
                <h3>💡 Improvement Opportunities</h3>
                <div class="improvement-list">
                    ${report.improvementSuggestions.slice(0, 5).map(suggestion => `
                    <div class="improvement-item ${suggestion.priority.toLowerCase()}">
                        <div class="improvement-priority">${suggestion.priority}</div>
                        <div class="improvement-message">${suggestion.message}</div>
                        <div class="improvement-action">${suggestion.action}</div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
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
            fileTypes: ${JSON.stringify(analytics.averageFileProcessingTime?.fileTypePerformance || {})},
            trends: ${JSON.stringify(stats.forecasts || {})},
            forecasts: ${JSON.stringify(stats.forecasts || {})},
            timeline: ${JSON.stringify(analytics.historicalData || [])}
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
                case 'trends':
                    drawTrendsChart();
                    break;
                case 'forecasts':
                    drawForecastsChart();
                    break;
                case 'timeline':
                    drawTimelineChart();
                    break;
                case 'comparison':
                    drawComparisonChart();
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
        
        function drawTrendsChart() {
            const data = chartData.trends;
            if (!data || !data.forecasts || data.forecasts.length === 0) {
                drawNoDataMessage('Trend analysis data not available');
                return;
            }
            
            const forecasts = data.forecasts;
            const maxForecasts = Math.max(...forecasts.map(f => f.forecast.length));
            const chartWidth = canvas.width - 80;
            const chartHeight = canvas.height - 100;
            const barWidth = chartWidth / (maxForecasts + 1);
            
            // Draw trend lines for each forecast
            const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
            
            forecasts.forEach((forecast, index) => {
                const color = colors[index % colors.length];
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                
                // Draw trend line
                forecast.forecast.forEach((value, i) => {
                    const x = 60 + (i + 1) * barWidth;
                    const y = canvas.height - 80 - (value / Math.max(...forecast.forecast)) * chartHeight;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
                
                // Draw data points
                forecast.forecast.forEach((value, i) => {
                    const x = 60 + (i + 1) * barWidth;
                    const y = canvas.height - 80 - (value / Math.max(...forecast.forecast)) * chartHeight;
                    
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fill();
                });
            });
            
            // Draw axis labels
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            // X-axis labels
            for (let i = 0; i <= maxForecasts; i++) {
                const x = 60 + i * barWidth;
                ctx.fillText('T+' + i, x, canvas.height - 50);
            }
            
            // Y-axis label
            ctx.save();
            ctx.translate(30, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Forecast Values', 0, 0);
            ctx.restore();
            
            updateLegend(forecasts.map((forecast, index) => ({
                label: forecast.metric,
                color: colors[index % colors.length]
            })));
        }
        
        function drawForecastsChart() {
            const data = chartData.forecasts;
            if (!data || !data.forecasts || data.forecasts.length === 0) {
                drawNoDataMessage('Forecast data not available');
                return;
            }
            
            const forecasts = data.forecasts;
            const chartWidth = canvas.width - 80;
            const chartHeight = canvas.height - 100;
            const barWidth = chartWidth / (forecasts.length + 1);
            
            // Draw forecast bars
            forecasts.forEach((forecast, index) => {
                const x = 60 + (index + 1) * barWidth;
                const currentValue = forecast.currentValue;
                const predictedValue = forecast.forecast[forecast.forecast.length - 1];
                const maxValue = Math.max(currentValue, predictedValue);
                
                // Draw current value bar
                const currentHeight = (currentValue / maxValue) * chartHeight;
                const currentY = canvas.height - 80 - currentHeight;
                
                ctx.fillStyle = '#007bff';
                ctx.fillRect(x - barWidth/3, currentY, barWidth/1.5, currentHeight);
                
                // Draw predicted value bar
                const predictedHeight = (predictedValue / maxValue) * chartHeight;
                const predictedY = canvas.height - 80 - predictedHeight;
                
                ctx.fillStyle = '#28a745';
                ctx.fillRect(x + barWidth/6, predictedY, barWidth/1.5, predictedHeight);
                
                // Draw labels
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(forecast.metric.split(' ')[0], x, canvas.height - 50);
                ctx.fillText(currentValue, x - barWidth/6, currentY - 10);
                ctx.fillText(predictedValue, x + barWidth/2, predictedY - 10);
            });
            
            updateLegend([
                { label: 'Current Value', color: '#007bff' },
                { label: 'Predicted Value', color: '#28a745' }
            ]);
        }
        
        function drawTimelineChart() {
            const data = chartData.timeline;
            if (!data || data.length === 0) {
                drawNoDataMessage('Timeline data not available');
                return;
            }
            
            const timelineData = data.slice(-10); // Last 10 entries
            const chartWidth = canvas.width - 80;
            const chartHeight = canvas.height - 100;
            const barWidth = chartWidth / (timelineData.length + 1);
            
            // Draw timeline bars
            timelineData.forEach((entry, index) => {
                const x = 60 + (index + 1) * barWidth;
                const complianceScore = entry.complianceScore || 0;
                const violations = entry.violations || 0;
                const criticalViolations = entry.criticalViolations || 0;
                
                // Calculate bar heights
                const maxScore = 100;
                const maxViolations = Math.max(...timelineData.map(e => e.violations || 0));
                const maxCritical = Math.max(...timelineData.map(e => e.criticalViolations || 0));
                
                // Draw compliance score bar
                const scoreHeight = (complianceScore / maxScore) * chartHeight * 0.4;
                const scoreY = canvas.height - 80 - scoreHeight;
                
                ctx.fillStyle = complianceScore >= 80 ? '#28a745' : complianceScore >= 60 ? '#ffc107' : '#dc3545';
                ctx.fillRect(x - barWidth/3, scoreY, barWidth/1.5, scoreHeight);
                
                // Draw violation count bar
                const violationHeight = violations > 0 ? (violations / maxViolations) * chartHeight * 0.3 : 0;
                const violationY = canvas.height - 80 - violationHeight;
                
                ctx.fillStyle = '#007bff';
                ctx.fillRect(x + barWidth/6, violationY, barWidth/1.5, violationHeight);
                
                // Draw critical violation indicator
                if (criticalViolations > 0) {
                    const criticalHeight = (criticalViolations / maxCritical) * chartHeight * 0.2;
                    const criticalY = canvas.height - 80 - criticalHeight;
                    
                    ctx.fillStyle = '#dc3545';
                    ctx.fillRect(x + barWidth/2, criticalY, barWidth/1.5, criticalHeight);
                }
                
                // Draw labels
                ctx.fillStyle = '#333';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                
                // Format timestamp
                const timestamp = new Date(entry.timestamp);
                const timeLabel = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString().slice(0, 5);
                ctx.fillText(timeLabel, x, canvas.height - 50);
                
                // Draw values
                ctx.fillText(complianceScore, x - barWidth/6, scoreY - 5);
                if (violations > 0) ctx.fillText(violations, x + barWidth/2, violationY - 5);
                if (criticalViolations > 0) ctx.fillText(criticalViolations, x + barWidth, criticalY - 5);
            });
            
            // Draw axis labels
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Timeline', canvas.width / 2, canvas.height - 20);
            
            updateLegend([
                { label: 'Compliance Score', color: '#28a745' },
                { label: 'Violations', color: '#007bff' },
                { label: 'Critical Violations', color: '#dc3545' }
            ]);
        }
        
        function drawComparisonChart() {
            const data = chartData.timeline;
            if (!data || data.length < 4) {
                drawNoDataMessage('Insufficient data for trend comparison (minimum 4 data points required)');
                return;
            }
            
            const timelineData = data.slice(-8); // Last 8 entries for comparison
            const chartWidth = canvas.width - 80;
            const chartHeight = canvas.height - 100;
            const barWidth = chartWidth / (timelineData.length + 1);
            
            // Calculate trends for comparison
            const complianceScores = timelineData.map(entry => entry.complianceScore || 0);
            const violationCounts = timelineData.map(entry => entry.violations || 0);
            const criticalCounts = timelineData.map(entry => entry.criticalViolations || 0);
            
            // Split data into two periods for comparison
            const midPoint = Math.floor(timelineData.length / 2);
            const period1 = timelineData.slice(0, midPoint);
            const period2 = timelineData.slice(midPoint);
            
            const period1Avg = {
                compliance: period1.reduce((sum, entry) => sum + (entry.complianceScore || 0), 0) / period1.length,
                violations: period1.reduce((sum, entry) => sum + (entry.violations || 0), 0) / period1.length,
                critical: period1.reduce((sum, entry) => sum + (entry.criticalViolations || 0), 0) / period1.length
            };
            
            const period2Avg = {
                compliance: period2.reduce((sum, entry) => sum + (entry.complianceScore || 0), 0) / period2.length,
                violations: period2.reduce((sum, entry) => sum + (entry.violations || 0), 0) / period2.length,
                critical: period2.reduce((sum, entry) => sum + (entry.criticalViolations || 0), 0) / period2.length
            };
            
            // Draw comparison bars
            const metrics = ['compliance', 'violations', 'critical'];
            const colors = ['#28a745', '#007bff', '#dc3545'];
            const maxValues = {
                compliance: Math.max(period1Avg.compliance, period2Avg.compliance),
                violations: Math.max(period1Avg.violations, period2Avg.violations),
                critical: Math.max(period1Avg.critical, period2Avg.critical)
            };
            
            metrics.forEach((metric, index) => {
                const x = 60 + (index + 1) * (chartWidth / 4);
                const period1Height = (period1Avg[metric] / maxValues[metric]) * chartHeight * 0.3;
                const period2Height = (period2Avg[metric] / maxValues[metric]) * chartHeight * 0.3;
                
                // Draw period 1 bar
                const period1Y = canvas.height - 80 - period1Height;
                ctx.fillStyle = colors[index];
                ctx.fillRect(x - barWidth/3, period1Y, barWidth/1.5, period1Height);
                
                // Draw period 2 bar
                const period2Y = canvas.height - 80 - period2Height;
                ctx.fillStyle = colors[index] + '80'; // Add transparency
                ctx.fillRect(x + barWidth/6, period2Y, barWidth/1.5, period2Height);
                
                // Draw labels
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(metric.charAt(0).toUpperCase() + metric.slice(1), x, canvas.height - 50);
                ctx.fillText(Math.round(period1Avg[metric]), x - barWidth/6, period1Y - 10);
                ctx.fillText(Math.round(period2Avg[metric]), x + barWidth/2, period2Y - 10);
            });
            
            // Draw comparison indicators
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Period 1 vs Period 2 Comparison', canvas.width / 2, 30);
            
            // Calculate and display trends
            const complianceTrend = period2Avg.compliance > period1Avg.compliance ? '↗️ Improving' : 
                                  period2Avg.compliance < period1Avg.compliance ? '↘️ Declining' : '→ Stable';
            const violationTrend = period2Avg.violations < period1Avg.violations ? '↗️ Improving' : 
                                 period2Avg.violations > period1Avg.violations ? '↘️ Declining' : '→ Stable';
            const criticalTrend = period2Avg.critical < period1Avg.critical ? '↗️ Improving' : 
                                period2Avg.critical > period1Avg.critical ? '↘️ Declining' : '→ Stable';
            
            ctx.font = '12px Arial';
            ctx.fillText('Compliance: ' + complianceTrend, canvas.width / 2, 50);
            ctx.fillText('Violations: ' + violationTrend, canvas.width / 2, 65);
            ctx.fillText('Critical: ' + criticalTrend, canvas.width / 2, 80);
            
            updateLegend([
                { label: 'Period 1', color: '#007bff' },
                { label: 'Period 2', color: '#007bff' + '80' }
            ]);
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

  /**
   * Generate Cursor rules from .md lessons learned files
   */
  generateRulesFromLessons() {
    console.log('📚 Generating Cursor rules from lessons learned...');
    
    const lessonsDir = path.join(__dirname, '..', 'lessons-learned');
    const rulesDir = path.join(__dirname, '..', 'cursor-rules');
    
    console.log(`📁 Lessons directory: ${lessonsDir}`);
    console.log(`📁 Rules directory: ${rulesDir}`);
    
    // Ensure rules directory exists
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir, { recursive: true });
      console.log(`📁 Created rules directory: ${rulesDir}`);
    }
    
    const generatedRules = [];
    const processedFiles = [];
    
    try {
      // Process all .md files in lessons-learned directory
      this.processLessonsDirectory(lessonsDir, rulesDir, generatedRules, processedFiles);
      
      // Generate summary report
      const summary = {
        timestamp: new Date().toISOString(),
        totalLessonsProcessed: processedFiles.length,
        totalRulesGenerated: generatedRules.length,
        rulesByCategory: this.categorizeRules(generatedRules),
        processedFiles: processedFiles
      };
      
      // Save summary to JSON
      const summaryPath = path.join(__dirname, '..', 'reports', 'rule-generation-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`✅ Generated ${generatedRules.length} rules from ${processedFiles.length} lesson files`);
      console.log('📄 Rule generation summary saved to:', summaryPath);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Error generating rules from lessons:', error.message);
      return null;
    }
  }

  /**
   * Process lessons directory recursively
   */
  processLessonsDirectory(dirPath, rulesDir, generatedRules, processedFiles) {
    console.log(`📁 Processing directory: ${dirPath}`);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`❌ Directory does not exist: ${dirPath}`);
      return;
    }
    
    const items = fs.readdirSync(dirPath);
    console.log(`📄 Found ${items.length} items in directory`);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        console.log(`📁 Processing subdirectory: ${item}`);
        // Recursively process subdirectories
        this.processLessonsDirectory(fullPath, rulesDir, generatedRules, processedFiles);
      } else if (item.endsWith('.md') && !item.startsWith('README')) {
        console.log(`📖 Found lesson file: ${item}`);
        // Process .md files (excluding README files)
        this.processLessonFile(fullPath, rulesDir, generatedRules, processedFiles);
      } else {
        console.log(`⏭️  Skipping file: ${item}`);
      }
    }
  }

  /**
   * Process individual lesson file and generate rules
   */
  processLessonFile(filePath, rulesDir, generatedRules, processedFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, '.md');
      
      console.log(`📖 Processing lesson: ${fileName}`);
      
      // Extract lesson metadata
      const metadata = this.extractLessonMetadata(content);
      
      // Generate rules based on lesson content
      const rules = this.generateRulesFromContent(content, metadata);
      
      if (rules.length > 0) {
        // Save rules to file
        const ruleFileName = `${fileName}-rules.mdc`;
        const ruleFilePath = path.join(rulesDir, ruleFileName);
        
        const ruleContent = this.formatRulesForCursor(rules, metadata);
        fs.writeFileSync(ruleFilePath, ruleContent);
        
        generatedRules.push(...rules);
        processedFiles.push({
          file: fileName,
          rulesGenerated: rules.length,
          ruleFile: ruleFileName
        });
        
        console.log(`  ✅ Generated ${rules.length} rules for ${fileName}`);
      } else {
        processedFiles.push({
          file: fileName,
          rulesGenerated: 0,
          ruleFile: null
        });
        console.log(`  ⚠️  No rules generated for ${fileName}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Extract metadata from lesson content
   */
  extractLessonMetadata(content) {
    const metadata = {
      title: '',
      date: '',
      project: '',
      phase: '',
      priority: '',
      tags: [],
      keyInsights: [],
      recommendations: []
    };
    
    // Extract title
    const titleMatch = content.match(/^# (.+)$/m);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }
    
    // Extract date from filename or content
    const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      metadata.date = dateMatch[1];
    }
    
    // Extract project (default to Agent OS)
    metadata.project = 'Agent OS';
    
    // Extract phase from content
    if (content.includes('Development') || content.includes('development')) {
      metadata.phase = 'Development';
    } else if (content.includes('Testing') || content.includes('testing')) {
      metadata.phase = 'Testing';
    } else if (content.includes('Architecture') || content.includes('architecture')) {
      metadata.phase = 'Architecture';
    } else {
      metadata.phase = 'General';
    }
    
    // Extract priority based on content
    if (content.includes('CRITICAL') || content.includes('critical')) {
      metadata.priority = 'High';
    } else if (content.includes('HIGH') || content.includes('high')) {
      metadata.priority = 'High';
    } else if (content.includes('MEDIUM') || content.includes('medium')) {
      metadata.priority = 'Medium';
    } else {
      metadata.priority = 'Medium';
    }
    
    // Extract tags from content
    const tagPatterns = [
      /#([a-zA-Z0-9-]+)/g,
      /`([a-zA-Z0-9-]+)`/g
    ];
    
    tagPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        metadata.tags.push(...matches.map(tag => tag.replace(/[`#]/g, '')));
      }
    });
    
    // Extract key insights from various sections
    const insightSections = [
      /### Key Insights?\n([\s\S]*?)(?=###|$)/i,
      /### Technical Insights?\n([\s\S]*?)(?=###|$)/i,
      /### Lessons Learned?\n([\s\S]*?)(?=###|$)/i,
      /### Insights?\n([\s\S]*?)(?=###|$)/i
    ];
    
    insightSections.forEach(pattern => {
      const match = content.match(pattern);
      if (match) {
        const insights = match[1].match(/- (.+?)(?=\n|$)/g);
        if (insights) {
          metadata.keyInsights.push(...insights.map(insight => insight.replace(/- /, '')));
        }
      }
    });
    
    // Extract recommendations from various sections
    const recommendationSections = [
      /### Immediate Actions?\n([\s\S]*?)(?=###|$)/i,
      /### Recommendations?\n([\s\S]*?)(?=###|$)/i,
      /### Next Steps?\n([\s\S]*?)(?=###|$)/i,
      /### Actions?\n([\s\S]*?)(?=###|$)/i
    ];
    
    recommendationSections.forEach(pattern => {
      const match = content.match(pattern);
      if (match) {
        const recommendations = match[1].match(/- \[?\]? \[?([^\]]+)\]?/g);
        if (recommendations) {
          metadata.recommendations.push(...recommendations.map(rec => rec.replace(/- \[?\]? \[?|\]?/g, '')));
        }
      }
    });
    
    return metadata;
  }

  /**
   * Generate rules from lesson content
   */
  generateRulesFromContent(content, metadata) {
    const rules = [];
    
    // Rule 1: Always follow lesson recommendations
    if (metadata.recommendations.length > 0) {
      rules.push({
        type: 'recommendation',
        title: `Follow ${metadata.title} Recommendations`,
        description: `Always implement the recommendations from lesson: ${metadata.title}`,
        content: `**ALWAYS** follow these recommendations from lesson "${metadata.title}":\n${metadata.recommendations.map(rec => `- ${rec}`).join('\n')}`,
        priority: metadata.priority || 'Medium',
        tags: metadata.tags
      });
    }
    
    // Rule 2: Apply key insights
    if (metadata.keyInsights.length > 0) {
      rules.push({
        type: 'insight',
        title: `Apply ${metadata.title} Insights`,
        description: `Apply key insights from lesson: ${metadata.title}`,
        content: `**ALWAYS** apply these insights from lesson "${metadata.title}":\n${metadata.keyInsights.map(insight => `- ${insight}`).join('\n')}`,
        priority: metadata.priority || 'Medium',
        tags: metadata.tags
      });
    }
    
    // Rule 3: Technology stack compliance
    if (metadata.tags.some(tag => tag.includes('tech') || tag.includes('stack'))) {
      rules.push({
        type: 'technology',
        title: `Technology Stack Compliance - ${metadata.title}`,
        description: `Ensure technology stack compliance based on lesson: ${metadata.title}`,
        content: `**ALWAYS** ensure technology stack compliance based on lesson "${metadata.title}":\n- Use only approved technologies from .agent-os standards\n- Follow established patterns and conventions\n- Maintain consistency across the project`,
        priority: metadata.priority || 'Medium',
        tags: metadata.tags
      });
    }
    
    // Rule 4: Code quality standards
    if (metadata.tags.some(tag => tag.includes('code') || tag.includes('quality'))) {
      rules.push({
        type: 'quality',
        title: `Code Quality Standards - ${metadata.title}`,
        description: `Maintain code quality standards based on lesson: ${metadata.title}`,
        content: `**ALWAYS** maintain code quality standards based on lesson "${metadata.title}":\n- Follow established coding conventions\n- Ensure proper error handling\n- Maintain code readability and maintainability`,
        priority: metadata.priority || 'Medium',
        tags: metadata.tags
      });
    }
    
    return rules;
  }

  /**
   * Format rules for Cursor .mdc files
   */
  formatRulesForCursor(rules, metadata) {
    let content = `# Cursor Rules Generated from Lesson: ${metadata.title}\n\n`;
    content += `**Source**: ${metadata.project || 'Agent OS'} - ${metadata.date || 'Unknown Date'}\n`;
    content += `**Priority**: ${metadata.priority || 'Medium'}\n`;
    content += `**Tags**: ${metadata.tags.join(', ')}\n\n`;
    
    content += `## Generated Rules\n\n`;
    
    rules.forEach((rule, index) => {
      content += `### ${index + 1}. ${rule.title}\n\n`;
      content += `**Type**: ${rule.type}\n`;
      content += `**Priority**: ${rule.priority}\n`;
      content += `**Description**: ${rule.description}\n\n`;
      content += `${rule.content}\n\n`;
    });
    
    content += `## Usage Guidelines\n\n`;
    content += `- These rules were automatically generated from lesson: ${metadata.title}\n`;
    content += `- Apply these rules consistently across the project\n`;
    content += `- Review and update rules as needed based on new lessons\n`;
    content += `- Report rule effectiveness to improve future generation\n\n`;
    
    return content;
  }

  /**
   * Categorize rules by type
   */
  categorizeRules(rules) {
    const categories = {};
    
    rules.forEach(rule => {
      if (!categories[rule.type]) {
        categories[rule.type] = [];
      }
      categories[rule.type].push(rule.title);
    });
    
    return categories;
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
      
    case 'generate-rules':
      integration.generateRulesFromLessons();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node cursor-integration.js check [file-path]  - Check specific file or entire codebase');
      console.log('  node cursor-integration.js watch              - Start file watching mode');
      console.log('  node cursor-integration.js generate-rules     - Generate Cursor rules from lessons learned');
      break;
  }
}

module.exports = CursorIntegration; 