/**
 * Agent OS Standard API Client Mock
 * 
 * This template provides a standardized way to mock API clients
 * based on lessons learned from multiple projects.
 * 
 * Key Features:
 * - Consistent response format handling
 * - Automatic data unwrapping (no response.data nesting in mocks)
 * - Error response simulation
 * - Type-safe mock responses
 * - Singleton pattern support
 */

import { vi } from 'vitest';

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface ApiClient {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
  patch<T>(url: string, data?: any, config?: any): Promise<T>;
}

// ============================================================================
// Mock Response Storage
// ============================================================================

const mockResponses = new Map<string, any>();
const mockErrors = new Map<string, { status: number; message: string }>();

// ============================================================================
// Mock API Client Implementation
// ============================================================================

export const createApiClientMock = (): ApiClient => {
  const mockApiClient = {
    get: vi.fn().mockImplementation(async <T>(url: string): Promise<T> => {
      // Check if there's a mock error for this URL
      if (mockErrors.has(url)) {
        const error = mockErrors.get(url)!;
        throw new Error(`HTTP ${error.status}: ${error.message}`);
      }
      
      // Return mock response directly (no wrapping in response.data)
      const response = mockResponses.get(url) || {};
      return Promise.resolve(response);
    }),
    
    post: vi.fn().mockImplementation(async <T>(url: string, data?: any): Promise<T> => {
      if (mockErrors.has(url)) {
        const error = mockErrors.get(url)!;
        throw new Error(`HTTP ${error.status}: ${error.message}`);
      }
      
      const response = mockResponses.get(url) || {};
      return Promise.resolve(response);
    }),
    
    put: vi.fn().mockImplementation(async <T>(url: string, data?: any): Promise<T> => {
      if (mockErrors.has(url)) {
        const error = mockErrors.get(url)!;
        throw new Error(`HTTP ${error.status}: ${error.message}`);
      }
      
      const response = mockResponses.get(url) || {};
      return Promise.resolve(response);
    }),
    
    delete: vi.fn().mockImplementation(async <T>(url: string): Promise<T> => {
      if (mockErrors.has(url)) {
        const error = mockErrors.get(url)!;
        throw new Error(`HTTP ${error.status}: ${error.message}`);
      }
      
      const response = mockResponses.get(url) || {};
      return Promise.resolve(response);
    }),
    
    patch: vi.fn().mockImplementation(async <T>(url: string, data?: any): Promise<T> => {
      if (mockErrors.has(url)) {
        const error = mockErrors.get(url)!;
        throw new Error(`HTTP ${error.status}: ${error.message}`);
      }
      
      const response = mockResponses.get(url) || {};
      return Promise.resolve(response);
    }),
  };
  
  return mockApiClient;
};

// ============================================================================
// Mock Configuration Helpers
// ============================================================================

export const setMockResponse = (url: string, response: any): void => {
  mockResponses.set(url, response);
};

export const setMockError = (url: string, status: number, message: string): void => {
  mockErrors.set(url, { status, message });
};

export const clearMockResponse = (url: string): void => {
  mockResponses.delete(url);
  mockErrors.delete(url);
};

export const clearAllMockResponses = (): void => {
  mockResponses.clear();
  mockErrors.clear();
};

// ============================================================================
// Singleton Service Mock Helper
// ============================================================================

export const createSingletonServiceMock = <T extends Record<string, any>>(
  serviceName: string,
  methods: Partial<T>
): T => {
  const mockInstance = {} as T;
  
  // Create mock implementations for all provided methods
  Object.keys(methods).forEach(methodName => {
    mockInstance[methodName as keyof T] = vi.fn().mockImplementation(methods[methodName]);
  });
  
  // Mock the module with singleton pattern
  vi.mock(`../services/${serviceName}`, () => ({
    [serviceName]: {
      getInstance: vi.fn(() => mockInstance)
    },
    default: {
      getInstance: vi.fn(() => mockInstance)
    }
  }));
  
  return mockInstance;
};

// ============================================================================
// Common Mock Responses
// ============================================================================

export const commonMockResponses = {
  // Authentication responses
  login: {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    },
    expiresIn: 3600
  },
  
  logout: {
    message: 'Logged out successfully'
  },
  
  refreshToken: {
    token: 'new-mock-jwt-token',
    expiresIn: 3600
  },
  
  userProfile: {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  
  // Generic responses
  success: {
    success: true,
    message: 'Operation completed successfully'
  },
  
  notFound: {
    success: false,
    message: 'Resource not found',
    errors: ['The requested resource does not exist']
  },
  
  unauthorized: {
    success: false,
    message: 'Unauthorized access',
    errors: ['Authentication required']
  },
  
  validationError: {
    success: false,
    message: 'Validation failed',
    errors: ['Invalid input data']
  }
};

// ============================================================================
// Test Setup Helpers
// ============================================================================

export const setupStandardMocks = (): void => {
  // Set up common API endpoints
  setMockResponse('/auth/login', commonMockResponses.login);
  setMockResponse('/auth/logout', commonMockResponses.logout);
  setMockResponse('/auth/refresh', commonMockResponses.refreshToken);
  setMockResponse('/auth/me', commonMockResponses.userProfile);
};

export const setupErrorMocks = (): void => {
  // Set up common error scenarios
  setMockError('/auth/login', 401, 'Invalid credentials');
  setMockError('/auth/refresh', 401, 'Token expired');
  setMockError('/protected', 403, 'Access denied');
  setMockError('/notfound', 404, 'Resource not found');
};

// ============================================================================
// Usage Examples
// ============================================================================

/*
// Basic usage in a test file:

import { createApiClientMock, setMockResponse, setupStandardMocks } from '../test-utils/api-client-mock';

// Mock the API client module
vi.mock('../services/api-client', () => ({
  apiClient: createApiClientMock()
}));

// In your test:
describe('Auth Service', () => {
  beforeEach(() => {
    setupStandardMocks();
  });
  
  it('should login successfully', async () => {
    const authService = new AuthService();
    const result = await authService.login('user@example.com', 'password');
    
    expect(result).toEqual(commonMockResponses.login);
  });
  
  it('should handle login error', async () => {
    setMockError('/auth/login', 401, 'Invalid credentials');
    
    const authService = new AuthService();
    
    await expect(authService.login('user@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });
});

// Singleton service mocking:
const mockAuthService = createSingletonServiceMock('AuthService', {
  login: async () => commonMockResponses.login,
  logout: async () => commonMockResponses.logout,
  getCurrentUser: async () => commonMockResponses.userProfile
});
*/