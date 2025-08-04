/**
 * Code Validator Module
 * Handles all code validation logic for different file types and standards
 * 
 * @module CodeValidator
 */

const fs = require('fs');
const path = require('path');

class CodeValidator {
  constructor() {
    this.standards = {};
    this.violations = [];
    this.totalChecks = 0;
    this.passedChecks = 0;
  }

  /**
   * Set standards for validation
   * @param {Object} standards - Standards object loaded from files
   */
  setStandards(standards) {
    this.standards = standards;
  }

  /**
   * Validate code against all applicable standards
   * @param {string} filePath - Path to the file being validated
   * @param {string} content - File content to validate
   * @returns {Array} Array of validation violations
   */
  validateCode(filePath, content) {
    const violations = [];
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // Reset counters for this validation run
    this.totalChecks = 0;
    this.passedChecks = 0;

    try {
      // Technology stack validation
      const techStackViolations = this.validateTechnologyStack(filePath, content);
      violations.push(...techStackViolations);

      // Code style validation
      const codeStyleViolations = this.validateCodeStyle(filePath, content);
      violations.push(...codeStyleViolations);

      // Security validation
      const securityViolations = this.validateSecurity(filePath, content);
      violations.push(...securityViolations);

      // Architecture validation
      const architectureViolations = this.validateArchitecture(filePath, content);
      violations.push(...architectureViolations);

      // Testing validation
      const testingViolations = this.validateTesting(filePath, content);
      violations.push(...testingViolations);

    } catch (error) {
      violations.push({
        file: filePath,
        line: 0,
        type: 'ERROR',
        category: 'VALIDATION_ERROR',
        message: `Validation error: ${error.message}`,
        standard: 'GENERAL',
        severity: 'CRITICAL'
      });
    }

    return violations;
  }

  /**
   * Validate technology stack compliance
   * @param {string} filePath - Path to the file being validated
   * @param {string} content - File content to validate
   * @returns {Array} Array of technology stack violations
   */
  validateTechnologyStack(filePath, content) {
    const violations = [];
    const fileExtension = path.extname(filePath).toLowerCase();

    // Check for correct technology stack usage
    if (fileExtension === '.js' || fileExtension === '.ts') {
      this.totalChecks++;
      
      // Check for Node.js version requirement
      if (content.includes('require(') && !content.includes('"engines"')) {
        violations.push({
          file: filePath,
          line: this.findLineNumber(content, 'require('),
          type: 'WARNING',
          category: 'TECH_STACK',
          message: 'Missing Node.js engine specification in package.json',
          standard: 'tech-stack',
          severity: 'MEDIUM'
        });
      } else {
        this.passedChecks++;
      }

      // Check for TypeScript usage
      if (fileExtension === '.js' && content.includes('interface') || content.includes('type ')) {
        violations.push({
          file: filePath,
          line: this.findLineNumber(content, 'interface') || this.findLineNumber(content, 'type '),
          type: 'WARNING',
          category: 'TECH_STACK',
          message: 'TypeScript syntax detected in .js file. Consider using .ts extension',
          standard: 'tech-stack',
          severity: 'MEDIUM'
        });
      } else {
        this.passedChecks++;
      }
    }

    return violations;
  }

  /**
   * Validate code style compliance
   * @param {string} filePath - Path to the file being validated
   * @param {string} content - File content to validate
   * @returns {Array} Array of code style violations
   */
  validateCodeStyle(filePath, content) {
    const violations = [];
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === '.js' || fileExtension === '.ts') {
      this.totalChecks++;

      // Check for proper indentation (2 spaces)
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() && !line.startsWith(' ') && line.includes('{')) {
          // This is a line that should be indented
          const nextLine = lines[i + 1];
          if (nextLine && !nextLine.startsWith('  ') && nextLine.trim()) {
            violations.push({
              file: filePath,
              line: i + 2,
              type: 'WARNING',
              category: 'CODE_STYLE',
              message: 'Inconsistent indentation. Use 2 spaces for indentation',
              standard: 'code-style',
              severity: 'LOW'
            });
            break;
          }
        }
      }

      // Check for proper naming conventions
      const functionMatches = content.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
      if (functionMatches) {
        functionMatches.forEach(match => {
          const funcName = match.replace('function ', '');
          if (!/^[a-z][a-zA-Z0-9]*$/.test(funcName)) {
            violations.push({
              file: filePath,
              line: this.findLineNumber(content, match),
              type: 'WARNING',
              category: 'CODE_STYLE',
              message: `Function name '${funcName}' should use camelCase`,
              standard: 'code-style',
              severity: 'LOW'
            });
          }
        });
      }

      this.passedChecks++;
    }

    return violations;
  }

  /**
   * Validate security compliance
   * @param {string} filePath - Path to the file being validated
   * @param {string} content - File content to validate
   * @returns {Array} Array of security violations
   */
  validateSecurity(filePath, content) {
    const violations = [];
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === '.js' || fileExtension === '.ts') {
      this.totalChecks++;

      // Check for hardcoded secrets
      const secretPatterns = [
        /password\s*[:=]\s*['"][^'"]+['"]/gi,
        /api_key\s*[:=]\s*['"][^'"]+['"]/gi,
        /secret\s*[:=]\s*['"][^'"]+['"]/gi,
        /token\s*[:=]\s*['"][^'"]+['"]/gi
      ];

      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          violations.push({
            file: filePath,
            line: this.findLineNumber(content, matches[0]),
            type: 'CRITICAL',
            category: 'SECURITY',
            message: 'Hardcoded secrets detected. Use environment variables instead',
            standard: 'security-compliance',
            severity: 'HIGH'
          });
        }
      });

      // Check for SQL injection vulnerabilities
      if (content.includes('query(') && content.includes('${') && !content.includes('parameterized')) {
        violations.push({
          file: filePath,
          line: this.findLineNumber(content, 'query('),
          type: 'CRITICAL',
          category: 'SECURITY',
          message: 'Potential SQL injection vulnerability. Use parameterized queries',
          standard: 'security-compliance',
          severity: 'HIGH'
        });
      }

      this.passedChecks++;
    }

    return violations;
  }

  /**
   * Validate architecture compliance
   * @param {string} filePath - Path to the file being validated
   * @param {string} content - File content to validate
   * @returns {Array} Array of architecture violations
   */
  validateArchitecture(filePath, content) {
    const violations = [];
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === '.js' || fileExtension === '.ts') {
      this.totalChecks++;

      // Check for proper separation of concerns
      if (content.includes('@Controller') && content.includes('@Service') && content.includes('@Repository')) {
        // This looks like a proper layered architecture
        this.passedChecks++;
      } else if (content.includes('require(') && content.includes('module.exports')) {
        // This is a Node.js module, check for proper structure
        if (content.includes('class') || content.includes('function')) {
          this.passedChecks++;
        } else {
          violations.push({
            file: filePath,
            line: 1,
            type: 'WARNING',
            category: 'ARCHITECTURE',
            message: 'Consider using classes or functions for better code organization',
            standard: 'best-practices',
            severity: 'MEDIUM'
          });
        }
      }

      // Check for proper error handling
      if (content.includes('try') && content.includes('catch')) {
        this.passedChecks++;
      } else if (content.includes('async') || content.includes('Promise')) {
        violations.push({
          file: filePath,
          line: this.findLineNumber(content, 'async') || this.findLineNumber(content, 'Promise'),
          type: 'WARNING',
          category: 'ARCHITECTURE',
          message: 'Async code detected without proper error handling',
          standard: 'best-practices',
          severity: 'MEDIUM'
        });
      }
    }

    return violations;
  }

  /**
   * Validate testing compliance
   * @param {string} filePath - Path to the file being validated
   * @param {string} content - File content to validate
   * @returns {Array} Array of testing violations
   */
  validateTesting(filePath, content) {
    const violations = [];
    const fileExtension = path.extname(filePath).toLowerCase();

    // Only validate test files or files that should have tests
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      this.totalChecks++;

      // Check for proper test structure
      if (content.includes('describe(') || content.includes('it(') || content.includes('test(')) {
        this.passedChecks++;
      } else {
        violations.push({
          file: filePath,
          line: 1,
          type: 'WARNING',
          category: 'TESTING',
          message: 'Test file should contain proper test structure (describe, it, test)',
          standard: 'testing-strategy',
          severity: 'MEDIUM'
        });
      }

      // Check for assertions
      if (content.includes('expect(') || content.includes('assert(')) {
        this.passedChecks++;
      } else {
        violations.push({
          file: filePath,
          line: 1,
          type: 'WARNING',
          category: 'TESTING',
          message: 'Test file should contain assertions (expect, assert)',
          standard: 'testing-strategy',
          severity: 'MEDIUM'
        });
      }
    }

    return violations;
  }

  /**
   * Find the line number where a pattern occurs
   * @param {string} content - File content
   * @param {string} pattern - Pattern to search for
   * @returns {number} Line number (1-indexed)
   */
  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get validation statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    return {
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      failedChecks: this.totalChecks - this.passedChecks,
      successRate: this.totalChecks > 0 ? (this.passedChecks / this.totalChecks) * 100 : 100
    };
  }
}

module.exports = CodeValidator; 