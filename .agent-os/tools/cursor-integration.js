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

  generateHtmlDashboard(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compliance Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .score { font-size: 2em; font-weight: bold; }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .success { color: #28a745; }
        .violation { margin: 10px 0; padding: 10px; border-left: 4px solid; }
        .critical { border-color: #dc3545; background: #f8d7da; }
        .warning { border-color: #ffc107; background: #fff3cd; }
    </style>
</head>
<body>
    <h1>Standards Compliance Dashboard</h1>
    <div class="score ${report.complianceScore >= 90 ? 'success' : report.complianceScore >= 70 ? 'warning' : 'critical'}">
        Overall Score: ${report.complianceScore}%
    </div>
    <p>Files Checked: ${report.totalChecks}</p>
    <p>Critical Issues: ${report.summary.critical}</p>
    <p>Warnings: ${report.summary.warnings}</p>
    
    <h2>Violations</h2>
    ${report.violations.map(v => `
        <div class="violation ${v.type.toLowerCase()}">
            <strong>${v.file}:${v.line}</strong> - ${v.message}
        </div>
    `).join('')}
</body>
</html>`;

    fs.writeFileSync('.agent-os/dashboard/compliance-dashboard.html', html);
    console.log('📄 HTML dashboard saved to: .agent-os/dashboard/compliance-dashboard.html');
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