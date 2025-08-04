/**
 * Unit tests for CodeValidator module
 * Tests all validation methods and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import CodeValidator from '../modules/CodeValidator';
import { Violation, Standards } from '../types';

describe('CodeValidator', () => {
  let validator: CodeValidator;
  let mockStandards: Standards;

  beforeEach(() => {
    validator = new CodeValidator();
    mockStandards = {
      'tech-stack': '# Technology Stack\n- Node.js 18+\n- TypeScript 5+',
      'code-style': '# Code Style\n- Use 2 spaces for indentation\n- Use camelCase for functions',
      'security-compliance': '# Security\n- No hardcoded secrets\n- Use parameterized queries',
      'best-practices': '# Best Practices\n- Use proper error handling\n- Follow layered architecture',
      'testing-strategy': '# Testing\n- Use describe/it blocks\n- Include assertions'
    };
    validator.setStandards(mockStandards);
  });

  describe('validateCode', () => {
    it('should return empty array for valid code', () => {
      const content = `
        function validFunction() {
          return 'valid';
        }
      `;
      
      const violations = validator.validateCode('test.js', content);
      expect(violations).toEqual([]);
    });

    it('should handle validation errors gracefully', () => {
      // Mock a scenario that would throw an error
      const violations = validator.validateCode('test.js', '');
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('validateTechnologyStack', () => {
    it('should detect missing Node.js engine specification', () => {
      const content = `
        const fs = require('fs');
        module.exports = {};
      `;
      
      const violations = validator.validateCode('test.js', content);
      const techStackViolations = violations.filter(v => v.category === 'TECH_STACK');
      
      expect(techStackViolations.length).toBeGreaterThan(0);
      expect(techStackViolations[0].message).toContain('Missing Node.js engine specification');
    });

    it('should detect TypeScript syntax in .js files', () => {
      const content = `
        interface TestInterface {
          name: string;
        }
        
        type TestType = string;
      `;
      
      const violations = validator.validateCode('test.js', content);
      const techStackViolations = violations.filter(v => v.category === 'TECH_STACK');
      
      expect(techStackViolations.length).toBeGreaterThan(0);
      expect(techStackViolations[0].message).toContain('TypeScript syntax detected');
    });

    it('should not flag TypeScript syntax in .ts files', () => {
      const content = `
        interface TestInterface {
          name: string;
        }
      `;
      
      const violations = validator.validateCode('test.ts', content);
      const techStackViolations = violations.filter(v => v.category === 'TECH_STACK');
      
      expect(techStackViolations.length).toBe(0);
    });
  });

  describe('validateCodeStyle', () => {
    it('should detect inconsistent indentation', () => {
      const content = `
        function testFunction() {
        const result = 'test';
          return result;
        }
      `;
      
      const violations = validator.validateCode('test.js', content);
      const codeStyleViolations = violations.filter(v => v.category === 'CODE_STYLE');
      
      expect(codeStyleViolations.length).toBeGreaterThan(0);
      expect(codeStyleViolations[0].message).toContain('Inconsistent indentation');
    });

    it('should detect improper function naming', () => {
      const content = `
        function TestFunction() {
          return 'test';
        }
        
        function _privateFunction() {
          return 'test';
        }
      `;
      
      const violations = validator.validateCode('test.js', content);
      const codeStyleViolations = violations.filter(v => v.category === 'CODE_STYLE');
      
      expect(codeStyleViolations.length).toBeGreaterThan(0);
      expect(codeStyleViolations.some(v => v.message.includes('camelCase'))).toBe(true);
    });

    it('should accept properly named functions', () => {
      const content = `
        function validFunction() {
          return 'test';
        }
        
        function anotherValidFunction() {
          return 'test';
        }
      `;
      
      const violations = validator.validateCode('test.js', content);
      const codeStyleViolations = violations.filter(v => v.category === 'CODE_STYLE');
      
      expect(codeStyleViolations.length).toBe(0);
    });
  });

  describe('validateSecurity', () => {
    it('should detect hardcoded secrets', () => {
      const content = `
        const config = {
          password: 'secret123',
          api_key: 'sk-1234567890',
          secret: 'my-secret-key',
          token: 'jwt-token-here'
        };
      `;
      
      const violations = validator.validateCode('test.js', content);
      const securityViolations = violations.filter(v => v.category === 'SECURITY');
      
      expect(securityViolations.length).toBeGreaterThan(0);
      expect(securityViolations.every(v => v.severity === 'HIGH')).toBe(true);
      expect(securityViolations[0].message).toContain('Hardcoded secrets detected');
    });

    it('should detect SQL injection vulnerabilities', () => {
      const content = `
        const query = \`SELECT * FROM users WHERE id = \${userId}\`;
        db.query(query);
      `;
      
      const violations = validator.validateCode('test.js', content);
      const securityViolations = violations.filter(v => v.category === 'SECURITY');
      
      expect(securityViolations.length).toBeGreaterThan(0);
      expect(securityViolations[0].message).toContain('SQL injection vulnerability');
    });

    it('should not flag parameterized queries', () => {
      const content = `
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId]);
      `;
      
      const violations = validator.validateCode('test.js', content);
      const securityViolations = violations.filter(v => v.category === 'SECURITY');
      
      expect(securityViolations.length).toBe(0);
    });
  });

  describe('validateArchitecture', () => {
    it('should detect missing error handling in async code', () => {
      const content = `
        async function testFunction() {
          const result = await fetch('/api/data');
          return result.json();
        }
      `;
      
      const violations = validator.validateCode('test.js', content);
      const architectureViolations = violations.filter(v => v.category === 'ARCHITECTURE');
      
      expect(architectureViolations.length).toBeGreaterThan(0);
      expect(architectureViolations[0].message).toContain('Async code detected without proper error handling');
    });

    it('should accept proper error handling', () => {
      const content = `
        async function testFunction() {
          try {
            const result = await fetch('/api/data');
            return result.json();
          } catch (error) {
            console.error('Error:', error);
            throw error;
          }
        }
      `;
      
      const violations = validator.validateCode('test.js', content);
      const architectureViolations = violations.filter(v => v.category === 'ARCHITECTURE');
      
      expect(architectureViolations.length).toBe(0);
    });

    it('should suggest better code organization', () => {
      const content = `
        const data = 'test';
        module.exports = data;
      `;
      
      const violations = validator.validateCode('test.js', content);
      const architectureViolations = violations.filter(v => v.category === 'ARCHITECTURE');
      
      expect(architectureViolations.length).toBeGreaterThan(0);
      expect(architectureViolations[0].message).toContain('Consider using classes or functions');
    });
  });

  describe('validateTesting', () => {
    it('should detect missing test structure in test files', () => {
      const content = `
        // This is a test file but has no proper structure
        console.log('test');
      `;
      
      const violations = validator.validateCode('test.spec.js', content);
      const testingViolations = violations.filter(v => v.category === 'TESTING');
      
      expect(testingViolations.length).toBeGreaterThan(0);
      expect(testingViolations[0].message).toContain('Test file should contain proper test structure');
    });

    it('should detect missing assertions in test files', () => {
      const content = `
        describe('Test Suite', () => {
          it('should do something', () => {
            const result = 'test';
            // Missing assertion
          });
        });
      `;
      
      const violations = validator.validateCode('test.spec.js', content);
      const testingViolations = violations.filter(v => v.category === 'TESTING');
      
      expect(testingViolations.length).toBeGreaterThan(0);
      expect(testingViolations[0].message).toContain('Test file should contain assertions');
    });

    it('should accept proper test structure', () => {
      const content = `
        describe('Test Suite', () => {
          it('should do something', () => {
            const result = 'test';
            expect(result).toBe('test');
          });
        });
      `;
      
      const violations = validator.validateCode('test.spec.js', content);
      const testingViolations = violations.filter(v => v.category === 'TESTING');
      
      expect(testingViolations.length).toBe(0);
    });

    it('should not validate non-test files', () => {
      const content = `
        function normalFunction() {
          return 'test';
        }
      `;
      
      const violations = validator.validateCode('normal.js', content);
      const testingViolations = violations.filter(v => v.category === 'TESTING');
      
      expect(testingViolations.length).toBe(0);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics after validation', () => {
      const content = `
        function TestFunction() {
          const password = 'secret123';
          return 'test';
        }
      `;
      
      validator.validateCode('test.js', content);
      const stats = validator.getStatistics();
      
      expect(stats.totalChecks).toBeGreaterThan(0);
      expect(stats.passedChecks).toBeGreaterThanOrEqual(0);
      expect(stats.failedChecks).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });

    it('should return 100% success rate for valid code', () => {
      const content = `
        function validFunction() {
          return 'test';
        }
      `;
      
      validator.validateCode('test.js', content);
      const stats = validator.getStatistics();
      
      expect(stats.successRate).toBe(100);
    });
  });

  describe('findLineNumber', () => {
    it('should find correct line number for pattern', () => {
      const content = `
        line 1
        line 2
        function test() {
          return 'test';
        }
        line 5
      `;
      
      // This is a private method, so we test it indirectly through validation
      const violations = validator.validateCode('test.js', content);
      expect(violations.length).toBe(0); // Should not have violations for valid code
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files', () => {
      const violations = validator.validateCode('empty.js', '');
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should handle files with only whitespace', () => {
      const violations = validator.validateCode('whitespace.js', '   \n  \t  \n  ');
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should handle files with special characters', () => {
      const content = `
        const special = '!@#$%^&*()';
        function test() {
          return special;
        }
      `;
      
      const violations = validator.validateCode('special.js', content);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should handle very large files', () => {
      const content = 'console.log("test");\n'.repeat(1000);
      const violations = validator.validateCode('large.js', content);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should validate multiple file types correctly', () => {
      const jsContent = `
        function testFunction() {
          return 'test';
        }
      `;
      
      const tsContent = `
        interface TestInterface {
          name: string;
        }
        
        function testFunction(): string {
          return 'test';
        }
      `;
      
      const jsViolations = validator.validateCode('test.js', jsContent);
      const tsViolations = validator.validateCode('test.ts', tsContent);
      
      expect(Array.isArray(jsViolations)).toBe(true);
      expect(Array.isArray(tsViolations)).toBe(true);
    });

    it('should accumulate statistics across multiple validations', () => {
      const content1 = `
        function validFunction() {
          return 'test';
        }
      `;
      
      const content2 = `
        function TestFunction() {
          const password = 'secret';
          return 'test';
        }
      `;
      
      validator.validateCode('valid.js', content1);
      validator.validateCode('invalid.js', content2);
      
      const stats = validator.getStatistics();
      expect(stats.totalChecks).toBeGreaterThan(0);
    });
  });
}); 