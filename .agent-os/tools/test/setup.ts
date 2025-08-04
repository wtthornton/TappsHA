/**
 * Test setup file for Vitest
 * Configures global test environment and utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Global test utilities
export const createTempFile = (content: string, filename: string = 'test.js'): string => {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
};

export const cleanupTempFiles = (): void => {
  const tempDir = path.join(__dirname, '../temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

export const createMockStandards = () => ({
  'tech-stack': '# Technology Stack\n- Node.js 18+\n- TypeScript 5+',
  'code-style': '# Code Style\n- Use 2 spaces for indentation\n- Use camelCase for functions',
  'security-compliance': '# Security\n- No hardcoded secrets\n- Use parameterized queries',
  'best-practices': '# Best Practices\n- Use proper error handling\n- Follow layered architecture',
  'testing-strategy': '# Testing\n- Use describe/it blocks\n- Include assertions'
});

// Global setup
beforeAll(() => {
  // Create temp directory for tests
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
});

// Global cleanup
afterAll(() => {
  cleanupTempFiles();
});

// Per-test cleanup
afterEach(() => {
  // Clean up any files created during individual tests
  const tempDir = path.join(__dirname, '../temp');
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  }
});

// Mock console methods to reduce noise in tests
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

beforeEach(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Global test helpers
export const expectViolation = (violations: any[], category: string, message?: string) => {
  const filtered = violations.filter(v => v.category === category);
  expect(filtered.length).toBeGreaterThan(0);
  
  if (message) {
    expect(filtered.some(v => v.message.includes(message))).toBe(true);
  }
  
  return filtered;
};

export const expectNoViolations = (violations: any[], category: string) => {
  const filtered = violations.filter(v => v.category === category);
  expect(filtered.length).toBe(0);
};

export const createTestFile = (content: string, extension: string = 'js'): string => {
  return createTempFile(content, `test.${extension}`);
};

// Export test utilities
export {
  createTempFile,
  cleanupTempFiles,
  createMockStandards,
  expectViolation,
  expectNoViolations,
  createTestFile
}; 