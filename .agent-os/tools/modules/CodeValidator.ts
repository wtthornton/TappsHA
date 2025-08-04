/**
 * Code Validator Module
 * Handles all code validation logic for different file types and standards
 * 
 * @module CodeValidator
 */

import * as fs from 'fs';
import * as path from 'path';
import { Violation, Standards, ValidationStatistics } from '../types';
import { 
  errorHandler, 
  ValidationError, 
  ERROR_CODES, 
  ERROR_SEVERITY 
} from './ErrorHandler';

class CodeValidator {
  private standards: Standards = {};
  private violations: Violation[] = [];
  private totalChecks: number = 0;
  private passedChecks: number = 0;

  /**
   * Set standards for validation
   * @param standards - Standards object loaded from files
   */
  setStandards(standards: Standards): void {
    this.standards = standards;
  }

  /**
   * Validate code against all applicable standards
   * @param filePath - Path to the file being validated
   * @param content - File content to validate
   * @returns Array of validation violations
   */
  validateCode(filePath: string, content: string): Violation[] {
    const violations: Violation[] = [];
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // Reset counters for this validation run
    this.totalChecks = 0;
    this.passedChecks = 0;

    try {
      // Validate file type
      if (!this.isSupportedFileType(fileExtension)) {
        throw errorHandler.createError(
          ValidationError,
          `Unsupported file type: ${fileExtension}`,
          ERROR_CODES.INVALID_FILE_TYPE,
          { file: filePath, category: 'VALIDATION' }
        );
      }

      // Validate file size
      if (content.length > 10 * 1024 * 1024) { // 10MB limit
        throw errorHandler.createError(
          ValidationError,
          `File too large: ${(content.length / 1024 / 1024).toFixed(2)}MB`,
          ERROR_CODES.FILE_TOO_LARGE,
          { file: filePath, category: 'VALIDATION' }
        );
      }

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
      // Log the error
      errorHandler.handleError(error, 'VALIDATION', ERROR_SEVERITY.MEDIUM);
      
      // Create violation for the error
      violations.push({
        file: filePath,
        line: 0,
        type: 'ERROR',
        category: 'VALIDATION_ERROR',
        message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        standard: 'GENERAL',
        severity: 'CRITICAL'
      });
    }

    return violations;
  }

  /**
   * Check if file type is supported
   * @param fileExtension - File extension to check
   * @returns True if supported
   */
  private isSupportedFileType(fileExtension: string): boolean {
    const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yml', '.yaml'];
    return supportedExtensions.includes(fileExtension);
  }

  /**
   * Validate technology stack compliance
   * @param filePath - Path to the file being validated
   * @param content - File content to validate
   * @returns Array of technology stack violations
   */
  private validateTechnologyStack(filePath: string, content: string): Violation[] {
    const violations: Violation[] = [];
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
      if (fileExtension === '.js' && (content.includes('interface') || content.includes('type '))) {
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
   * @param filePath - Path to the file being validated
   * @param content - File content to validate
   * @returns Array of code style violations
   */
  private validateCodeStyle(filePath: string, content: string): Violation[] {
    const violations: Violation[] = [];
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
   * @param filePath - Path to the file being validated
   * @param content - File content to validate
   * @returns Array of security violations
   */
  private validateSecurity(filePath: string, content: string): Violation[] {
    const violations: Violation[] = [];
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
   * @param filePath - Path to the file being validated
   * @param content - File content to validate
   * @returns Array of architecture violations
   */
  private validateArchitecture(filePath: string, content: string): Violation[] {
    const violations: Violation[] = [];
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
   * @param filePath - Path to the file being validated
   * @param content - File content to validate
   * @returns Array of testing violations
   */
  private validateTesting(filePath: string, content: string): Violation[] {
    const violations: Violation[] = [];
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
   * @param content - File content
   * @param pattern - Pattern to search for
   * @returns Line number (1-indexed)
   */
  private findLineNumber(content: string, pattern: string): number {
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
   * @returns Statistics object
   */
  getStatistics(): ValidationStatistics {
    return {
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      failedChecks: this.totalChecks - this.passedChecks,
      successRate: this.totalChecks > 0 ? (this.passedChecks / this.totalChecks) * 100 : 100
    };
  }
}

export default CodeValidator; 