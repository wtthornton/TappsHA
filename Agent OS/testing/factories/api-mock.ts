import { vi } from 'vitest';

/**
 * Creates a mock API client that matches the actual behavior
 * where response.data is already unwrapped
 */
export function createApiClientMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };
}

/**
 * Creates a mock API client with predefined responses
 */
export function createApiClientMockWithResponses(responses: Record<string, any>) {
  return {
    get: vi.fn().mockImplementation((url: string) => {
      if (url in responses) {
        return Promise.resolve(responses[url]);
      }
      return Promise.reject(new Error(`No mock response for GET ${url}`));
    }),
    post: vi.fn().mockImplementation((url: string, data?: any) => {
      if (url in responses) {
        return Promise.resolve(responses[url]);
      }
      return Promise.reject(new Error(`No mock response for POST ${url}`));
    }),
    put: vi.fn().mockImplementation((url: string, data?: any) => {
      if (url in responses) {
        return Promise.resolve(responses[url]);
      }
      return Promise.reject(new Error(`No mock response for PUT ${url}`));
    }),
    delete: vi.fn().mockImplementation((url: string) => {
      if (url in responses) {
        return Promise.resolve(responses[url]);
      }
      return Promise.reject(new Error(`No mock response for DELETE ${url}`));
    }),
    patch: vi.fn().mockImplementation((url: string, data?: any) => {
      if (url in responses) {
        return Promise.resolve(responses[url]);
      }
      return Promise.reject(new Error(`No mock response for PATCH ${url}`));
    }),
  };
}

/**
 * Helper to create error responses
 */
export function createApiError(status: number, message: string, code?: string) {
  const error = new Error(message) as any;
  error.response = {
    status,
    data: {
      error: message,
      code,
    },
  };
  return error;
}