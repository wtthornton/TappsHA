#!/usr/bin/env node

/**
 * Simple Compliance Check Tool
 * Basic validation against .agent-os standards
 * 
 * Usage: node .agent-os/tools/simple-compliance-check.js
 */

const fs = require('fs');
const path = require('path');

class SimpleComplianceCheck {
  constructor() {
    this.results = {
      overall: {
        score: 0,
        status: 'unknown',
        criticalViolations: 0,
        warnings: 0,
        passed: 0,
        total: 0
      },
      categories: {
        technologyStack: { score: 0, violations: [], status: 'unknown' },
        codeStyle: { score: 0, violations: [], status: 'unknown' },
        security: { score: 0, violations: [], status: 'unknown' },
        architecture: { score: 0, violations: [], status: 'unknown' },
        testing: { score: 0, violations: [], status: 'unknown' },
        performance: { score: 0, violations: [], status: 'unknown' }
      },
      recommendations: [],
      timestamp: new Date().toISOString()
    };
  }

  async run() {
    console.log('🔍 Starting Simple Compliance Check...\n');
    
    try {
      // Check project structure
      this.checkProjectStructure();
      
      // Check technology stack
      this.checkTechnologyStack();
      
      // Check code style
      this.checkCodeStyle();
      
      // Check security
      this.checkSecurity();
      
      // Check architecture
      this.checkArchitecture();
      
      // Check testing
      this.checkTesting();
      
      // Calculate overall results
      this.calculateOverallResults();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Display results
      this.displayResults();
      
      // Save results
      this.saveResults();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Compliance check failed:', error.message);
      this.results.overall.status = 'error';
      this.results.overall.score = 0;
      return this.results;
    }
  }

  checkProjectStructure() {
    console.log('📁 Checking project structure...');
    
    const requiredDirs = [
      '.agent-os',
      '.agent-os/standards',
      '.agent-os/checklists',
      '.agent-os/product',
      '.agent-os/tools',
      '.agent-os/internal',
      '.agent-os/reports',
      'backend',
      'frontend',
      '.cursor/rules'
    ];
    
    const requiredFiles = [
      'tasks.md',
      'README.md',
      '.agent-os/agent-improvements/tech-stack.md',
      '.agent-os/standards/tech-stack.md',
      '.agent-os/standards/enforcement.md'
    ];
    
    let passed = 0;
    let total = requiredDirs.length + requiredFiles.length;
    
    // Check directories
    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        passed++;
      } else {
        this.results.categories.architecture.violations.push({
          type: 'WARNING',
          message: `Missing required directory: ${dir}`,
          file: dir,
          standard: 'project-structure'
        });
      }
    });
    
    // Check files
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        passed++;
      } else {
        this.results.categories.architecture.violations.push({
          type: 'WARNING',
          message: `Missing required file: ${file}`,
          file: file,
          standard: 'project-structure'
        });
      }
    });
    
    this.results.categories.architecture.score = Math.round((passed / total) * 100);
    this.results.overall.passed += passed;
    this.results.overall.total += total;
  }

  checkTechnologyStack() {
    console.log('🔧 Checking technology stack...');
    
    let passed = 0;
    let total = 0;
    
    // Check backend technology
    if (fs.existsSync('backend/pom.xml')) {
      const pomContent = fs.readFileSync('backend/pom.xml', 'utf8');
      total += 3;
      
      if (pomContent.includes('spring-boot')) {
        passed++;
      } else {
        this.results.categories.technologyStack.violations.push({
          type: 'CRITICAL',
          message: 'Backend should use Spring Boot',
          file: 'backend/pom.xml',
          standard: 'tech-stack'
        });
      }
      
      if (pomContent.includes('java.version') && pomContent.includes('21')) {
        passed++;
      } else {
        this.results.categories.technologyStack.violations.push({
          type: 'WARNING',
          message: 'Backend should use Java 21',
          file: 'backend/pom.xml',
          standard: 'tech-stack'
        });
      }
      
      if (pomContent.includes('postgresql')) {
        passed++;
      } else {
        this.results.categories.technologyStack.violations.push({
          type: 'WARNING',
          message: 'Backend should use PostgreSQL',
          file: 'backend/pom.xml',
          standard: 'tech-stack'
        });
      }
    }
    
    // Check frontend technology
    if (fs.existsSync('frontend/package.json')) {
      const packageContent = fs.readFileSync('frontend/package.json', 'utf8');
      total += 2;
      
      if (packageContent.includes('react')) {
        passed++;
      } else {
        this.results.categories.technologyStack.violations.push({
          type: 'CRITICAL',
          message: 'Frontend should use React',
          file: 'frontend/package.json',
          standard: 'tech-stack'
        });
      }
      
      if (packageContent.includes('typescript')) {
        passed++;
      } else {
        this.results.categories.technologyStack.violations.push({
          type: 'WARNING',
          message: 'Frontend should use TypeScript',
          file: 'frontend/package.json',
          standard: 'tech-stack'
        });
      }
    }
    
    this.results.categories.technologyStack.score = total > 0 ? Math.round((passed / total) * 100) : 0;
    this.results.overall.passed += passed;
    this.results.overall.total += total;
  }

  checkCodeStyle() {
    console.log('🎨 Checking code style...');
    
    let passed = 0;
    let total = 0;
    
    // Check for ESLint configuration
    if (fs.existsSync('frontend/.eslintrc') || fs.existsSync('frontend/.eslintrc.js')) {
      passed++;
      total++;
    } else {
      this.results.categories.codeStyle.violations.push({
        type: 'WARNING',
        message: 'Frontend should have ESLint configuration',
        file: 'frontend/.eslintrc',
        standard: 'code-style'
      });
      total++;
    }
    
    // Check for Prettier configuration
    if (fs.existsSync('frontend/.prettierrc') || fs.existsSync('frontend/.prettierrc.js')) {
      passed++;
      total++;
    } else {
      this.results.categories.codeStyle.violations.push({
        type: 'WARNING',
        message: 'Frontend should have Prettier configuration',
        file: 'frontend/.prettierrc',
        standard: 'code-style'
      });
      total++;
    }
    
    // Check for TypeScript configuration
    if (fs.existsSync('frontend/tsconfig.json')) {
      passed++;
      total++;
    } else {
      this.results.categories.codeStyle.violations.push({
        type: 'WARNING',
        message: 'Frontend should have TypeScript configuration',
        file: 'frontend/tsconfig.json',
        standard: 'code-style'
      });
      total++;
    }
    
    this.results.categories.codeStyle.score = total > 0 ? Math.round((passed / total) * 100) : 0;
    this.results.overall.passed += passed;
    this.results.overall.total += total;
  }

  checkSecurity() {
    console.log('🔒 Checking security...');
    
    let passed = 0;
    let total = 0;
    
    // Check for .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      total += 2;
      
      if (gitignoreContent.includes('node_modules')) {
        passed++;
      } else {
        this.results.categories.security.violations.push({
          type: 'WARNING',
          message: '.gitignore should exclude node_modules',
          file: '.gitignore',
          standard: 'security'
        });
      }
      
      if (gitignoreContent.includes('.env') || gitignoreContent.includes('*.env')) {
        passed++;
      } else {
        this.results.categories.security.violations.push({
          type: 'CRITICAL',
          message: '.gitignore should exclude environment files',
          file: '.gitignore',
          standard: 'security'
        });
      }
    }
    
    // Check for Docker security
    if (fs.existsSync('docker-compose.yml')) {
      passed++;
      total++;
    } else {
      this.results.categories.security.violations.push({
        type: 'WARNING',
        message: 'Project should have Docker configuration',
        file: 'docker-compose.yml',
        standard: 'security'
      });
      total++;
    }
    
    this.results.categories.security.score = total > 0 ? Math.round((passed / total) * 100) : 0;
    this.results.overall.passed += passed;
    this.results.overall.total += total;
  }

  checkArchitecture() {
    console.log('🏗️  Checking architecture...');
    
    let passed = 0;
    let total = 0;
    
    // Check for layered architecture in backend
    if (fs.existsSync('backend/src/main/java')) {
      const javaDir = 'backend/src/main/java';
      total += 2;
      
      if (fs.existsSync(path.join(javaDir, 'controller')) || 
          fs.existsSync(path.join(javaDir, 'service')) ||
          fs.existsSync(path.join(javaDir, 'repository'))) {
        passed++;
      } else {
        this.results.categories.architecture.violations.push({
          type: 'WARNING',
          message: 'Backend should follow layered architecture (Controller/Service/Repository)',
          file: javaDir,
          standard: 'architecture'
        });
      }
      
      if (fs.existsSync(path.join(javaDir, 'config'))) {
        passed++;
      } else {
        this.results.categories.architecture.violations.push({
          type: 'WARNING',
          message: 'Backend should have configuration package',
          file: javaDir,
          standard: 'architecture'
        });
      }
    }
    
    // Check for component structure in frontend
    if (fs.existsSync('frontend/src/components')) {
      passed++;
      total++;
    } else {
      this.results.categories.architecture.violations.push({
        type: 'WARNING',
        message: 'Frontend should have components directory',
        file: 'frontend/src/components',
        standard: 'architecture'
      });
      total++;
    }
    
    this.results.categories.architecture.score = total > 0 ? Math.round((passed / total) * 100) : 0;
    this.results.overall.passed += passed;
    this.results.overall.total += total;
  }

  checkTesting() {
    console.log('🧪 Checking testing...');
    
    let passed = 0;
    let total = 0;
    
    // Check for backend tests
    if (fs.existsSync('backend/src/test')) {
      passed++;
      total++;
    } else {
      this.results.categories.testing.violations.push({
        type: 'WARNING',
        message: 'Backend should have test directory',
        file: 'backend/src/test',
        standard: 'testing'
      });
      total++;
    }
    
    // Check for frontend tests
    if (fs.existsSync('frontend/src/__tests__') || 
        fs.existsSync('frontend/src/**/*.test.ts') ||
        fs.existsSync('frontend/src/**/*.test.tsx')) {
      passed++;
      total++;
    } else {
      this.results.categories.testing.violations.push({
        type: 'WARNING',
        message: 'Frontend should have test files',
        file: 'frontend/src/__tests__',
        standard: 'testing'
      });
      total++;
    }
    
    this.results.categories.testing.score = total > 0 ? Math.round((passed / total) * 100) : 0;
    this.results.overall.passed += passed;
    this.results.overall.total += total;
  }

  calculateOverallResults() {
    // Calculate overall score
    if (this.results.overall.total > 0) {
      this.results.overall.score = Math.round((this.results.overall.passed / this.results.overall.total) * 100);
    }
    
    // Count violations
    Object.values(this.results.categories).forEach(category => {
      this.results.overall.criticalViolations += category.violations.filter(v => v.type === 'CRITICAL').length;
      this.results.overall.warnings += category.violations.filter(v => v.type === 'WARNING').length;
    });
    
    // Determine overall status
    if (this.results.overall.criticalViolations > 0) {
      this.results.overall.status = 'critical';
    } else if (this.results.overall.score >= 85) {
      this.results.overall.status = 'pass';
    } else if (this.results.overall.score >= 70) {
      this.results.overall.status = 'warning';
    } else {
      this.results.overall.status = 'fail';
    }
    
    // Update category statuses
    Object.keys(this.results.categories).forEach(category => {
      const cat = this.results.categories[category];
      const criticalViolations = cat.violations.filter(v => v.type === 'CRITICAL').length;
      
      if (criticalViolations > 0) {
        cat.status = 'critical';
      } else if (cat.score >= 85) {
        cat.status = 'pass';
      } else if (cat.score >= 70) {
        cat.status = 'warning';
      } else {
        cat.status = 'fail';
      }
    });
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Overall score recommendations
    if (this.results.overall.score < 85) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        message: `Overall compliance score is ${this.results.overall.score}% - target is 85%`,
        action: 'Review and fix violations to improve compliance score'
      });
    }
    
    // Critical violations
    if (this.results.overall.criticalViolations > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'critical',
        message: `${this.results.overall.criticalViolations} critical violations detected`,
        action: 'Fix critical violations immediately - they block development'
      });
    }
    
    // Category-specific recommendations
    Object.entries(this.results.categories).forEach(([category, data]) => {
      if (data.status === 'critical') {
        recommendations.push({
          priority: 'critical',
          category,
          message: `${category} has critical violations`,
          action: `Fix critical ${category} violations immediately`
        });
      } else if (data.status === 'fail') {
        recommendations.push({
          priority: 'high',
          category,
          message: `${category} compliance is failing (${data.score}%)`,
          action: `Improve ${category} compliance to reach 85% target`
        });
      } else if (data.status === 'warning') {
        recommendations.push({
          priority: 'medium',
          category,
          message: `${category} compliance needs improvement (${data.score}%)`,
          action: `Address ${category} violations to reach 85% target`
        });
      }
    });
    
    this.results.recommendations = recommendations;
  }

  displayResults() {
    console.log('\n📊 Simple Compliance Check Results\n');
    console.log('=' .repeat(50));
    
    // Overall status
    const statusEmoji = {
      'pass': '✅',
      'warning': '⚠️',
      'fail': '❌',
      'critical': '🚨',
      'error': '💥'
    };
    
    console.log(`${statusEmoji[this.results.overall.status]} Overall Status: ${this.results.overall.status.toUpperCase()}`);
    console.log(`📈 Compliance Score: ${this.results.overall.score}%`);
    console.log(`🔍 Total Checks: ${this.results.overall.total}`);
    console.log(`✅ Passed: ${this.results.overall.passed}`);
    console.log(`🚨 Critical Violations: ${this.results.overall.criticalViolations}`);
    console.log(`⚠️  Warnings: ${this.results.overall.warnings}`);
    
    console.log('\n📋 Category Breakdown:');
    console.log('-'.repeat(30));
    
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const emoji = statusEmoji[data.status] || '❓';
      console.log(`${emoji} ${category}: ${data.score}% (${data.violations.length} violations)`);
    });
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      console.log('-'.repeat(30));
      
      this.results.recommendations.forEach((rec, index) => {
        const priorityEmoji = {
          'critical': '🚨',
          'high': '🔴',
          'medium': '🟡',
          'low': '🟢'
        };
        
        console.log(`${index + 1}. ${priorityEmoji[rec.priority]} ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Final verdict
    if (this.results.overall.status === 'pass') {
      console.log('🎉 Compliance check PASSED! Your project meets standards.');
    } else if (this.results.overall.status === 'critical') {
      console.log('🚨 CRITICAL: Fix violations immediately before continuing development.');
    } else {
      console.log('⚠️  Compliance check needs attention. Review recommendations above.');
    }
  }

  saveResults() {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `simple-compliance-report-${timestamp}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the compliance check if this file is executed directly
if (require.main === module) {
  const checker = new SimpleComplianceCheck();
  checker.run().catch(error => {
    console.error('❌ Simple compliance check failed:', error);
    process.exit(1);
  });
}

module.exports = SimpleComplianceCheck; 