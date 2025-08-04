#!/usr/bin/env node

/**
 * Automated Standards Compliance Checker
 * Validates code against all .agent-os standards
 * 
 * Usage: node .agent-os/tools/compliance-checker.js [file-path]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ComplianceChecker {
  constructor() {
    this.standards = this.loadStandards();
    this.violations = [];
    this.complianceScore = 100;
    this.totalChecks = 0;
    this.passedChecks = 0;
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

  validateCode(filePath, content) {
    const violations = [];
    const fileExt = path.extname(filePath);
    
    // Technology Stack Validation
    violations.push(...this.validateTechnologyStack(filePath, content));
    
    // Code Style Validation
    violations.push(...this.validateCodeStyle(filePath, content));
    
    // Security Validation
    violations.push(...this.validateSecurity(filePath, content));
    
    // Architecture Validation
    violations.push(...this.validateArchitecture(filePath, content));
    
    // Testing Validation
    violations.push(...this.validateTesting(filePath, content));

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
      // Check line length (100 chars max)
      if (line.length > 100) {
        violations.push({
          type: 'WARNING',
          category: 'Code Style',
          message: `Line ${index + 1} exceeds 100 character limit (${line.length} chars)`,
          file: filePath,
          line: index + 1
        });
      }

      // Check for proper indentation (2 spaces)
      if (line.startsWith(' ') && !line.startsWith('  ') && line.trim().length > 0) {
        violations.push({
          type: 'WARNING',
          category: 'Code Style',
          message: `Line ${index + 1} should use 2-space indentation`,
          file: filePath,
          line: index + 1
        });
      }
    });

    return violations;
  }

  validateSecurity(filePath, content) {
    const violations = [];
    
    // Skip security checks for test files with proper test constants
    if (filePath.includes('Test.java') && 
        (content.includes('TEST_') || content.includes('test_') || content.includes('placeholder'))) {
      return violations;
    }
    
    // Check for hardcoded secrets (excluding test constants)
    const secretPatterns = [
      /password\s*=\s*["'][^"']+["']/gi,
      /api_key\s*=\s*["'][^"']+["']/gi,
      /secret\s*=\s*["'][^"']+["']/gi,
      /token\s*=\s*["'][^"']+["']/gi
    ];

    secretPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        // Skip if it's a test constant
        const isTestConstant = matches.some(match => 
          match.toLowerCase().includes('test_') || 
          match.toLowerCase().includes('placeholder') ||
          match.toLowerCase().includes('constant')
        );
        
        if (!isTestConstant) {
          violations.push({
            type: 'CRITICAL',
            category: 'Security',
            message: 'Hardcoded secrets detected - use environment variables',
            file: filePath,
            line: 1
          });
        }
      }
    });

    // Check for SQL injection vulnerabilities
    if (content.includes('@Query') && content.includes('SELECT') && !content.includes('@Param')) {
      violations.push({
        type: 'CRITICAL',
        category: 'Security',
        message: 'Potential SQL injection - use @Param for dynamic queries',
        file: filePath,
        line: 1
      });
    }

    return violations;
  }

  validateArchitecture(filePath, content) {
    const violations = [];
    
    // Check for Controller → Service → Repository pattern
    if (filePath.includes('Controller.java')) {
      if (!content.includes('@RestController') || !content.includes('@RequestMapping')) {
        violations.push({
          type: 'WARNING',
          category: 'Architecture',
          message: 'Controller should use @RestController and @RequestMapping',
          file: filePath,
          line: 1
        });
      }
    }

    if (filePath.includes('Service.java')) {
      if (!content.includes('@Service')) {
        violations.push({
          type: 'WARNING',
          category: 'Architecture',
          message: 'Service should use @Service annotation',
          file: filePath,
          line: 1
        });
      }
    }

    if (filePath.includes('Repository.java')) {
      if (!content.includes('@Repository') && !content.includes('extends JpaRepository')) {
        violations.push({
          type: 'WARNING',
          category: 'Architecture',
          message: 'Repository should use @Repository or extend JpaRepository',
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
    if (filePath.includes('Test.java') || filePath.includes('.test.')) {
      if (!content.includes('@Test')) {
        violations.push({
          type: 'WARNING',
          category: 'Testing',
          message: 'Test file should contain @Test annotations',
          file: filePath,
          line: 1
        });
      }
    }

    // Check for coverage requirements
    if (filePath.includes('pom.xml') && content.includes('jacoco')) {
      if (!content.includes('85%')) {
        violations.push({
          type: 'WARNING',
          category: 'Testing',
          message: 'Test coverage should be ≥85%',
          file: filePath,
          line: 1
        });
      }
    }

    return violations;
  }

  validateCodebase(codebasePath = '.') {
    console.log('🔍 Running comprehensive compliance check...');
    
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

    this.passedChecks = this.totalChecks - totalViolations;
    this.complianceScore = Math.max(0, Math.round((this.passedChecks / this.totalChecks) * 100));

    return {
      totalFiles,
      totalViolations,
      complianceScore: this.complianceScore,
      violations: this.violations
    };
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
      }
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