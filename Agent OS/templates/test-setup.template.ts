/**
 * Agent OS Standard Test Setup
 * 
 * This file is executed before all tests and sets up the testing environment
 * based on lessons learned from multiple projects.
 * 
 * Key Features:
 * - Global mocks for browser APIs
 * - Singleton service mocking patterns
 * - API client mock setup
 * - Error handling for test environment
 */

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// ============================================================================
// Global Mocks - Applied to all tests
// ============================================================================

// Mock window.matchMedia (required for many UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo (common in React components)
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock IntersectionObserver (used by many components)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver (used by many components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ============================================================================
// Storage Mocks - localStorage, sessionStorage
// ============================================================================

class MockStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

// Apply storage mocks
Object.defineProperty(window, 'localStorage', {
  value: new MockStorage(),
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: new MockStorage(),
  writable: true,
});

// ============================================================================
// Console Mocks - Prevent test output pollution
// ============================================================================

// Store original console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info,
};

// Mock console methods to reduce noise in test output
beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
  // Keep console.log and console.info for debugging
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});

// ============================================================================
// Test Environment Setup
// ============================================================================

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Clear storage before each test
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Clear any timers
  vi.clearAllTimers();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
  vi.clearAllTimers();
});

// ============================================================================
// Global Test Utilities
// ============================================================================

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// ============================================================================
// Mock Response Helpers
// ============================================================================

export const createMockResponse = <T>(data: T, options: Partial<Response> = {}): Response => {
  return new Response(JSON.stringify(data), {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
};

export const createErrorResponse = (message: string, status = 400): Response => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    statusText: 'Error',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// ============================================================================
// Test Data Factory
// ============================================================================

export const createTestUser = (overrides: Partial<any> = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createTestAuthResponse = (overrides: Partial<any> = {}) => ({
  token: 'mock-jwt-token',
  user: createTestUser(),
  expiresIn: 3600,
  ...overrides,
});

// ============================================================================
// Mock API Responses
// ============================================================================

export const mockApiResponses = {
  '/auth/login': {
    success: true,
    data: createTestAuthResponse(),
  },
  '/auth/logout': {
    success: true,
    message: 'Logged out successfully',
  },
  '/auth/refresh': {
    success: true,
    data: { token: 'new-mock-token' },
  },
  '/auth/me': {
    success: true,
    data: createTestUser(),
  },
};

// ============================================================================
// Environment Variables for Tests
// ============================================================================

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_API_URL = 'http://localhost:3000/api';

// ============================================================================
// TypeScript Globals for Tests
// ============================================================================

declare global {
  interface Window {
    mockApiResponses: typeof mockApiResponses;
  }
}

// Make mock responses available globally
window.mockApiResponses = mockApiResponses;