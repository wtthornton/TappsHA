/**
 * Mock Factories for Agent OS Testing
 * Extracted from testing-analysis.md lessons learned
 * 
 * Provides standardized mock factories for common testing patterns
 * to prevent the 40% time waste on mock setup issues.
 */

const { vi } = require('vitest');

/**
 * API Client Mock Factory
 * Handles the common issue of response.data wrapping inconsistencies
 */
export const createApiClientMock = (mockResponses = {}) => {
  return {
    get: vi.fn().mockImplementation((url) => {
      const response = mockResponses[url] || { data: 'default response' };
      // API client already unwraps response.data, so return data directly
      return Promise.resolve(response);
    }),
    
    post: vi.fn().mockImplementation((url, data) => {
      const response = mockResponses[url] || { data: 'default response' };
      return Promise.resolve(response);
    }),
    
    put: vi.fn().mockImplementation((url, data) => {
      const response = mockResponses[url] || { data: 'default response' };
      return Promise.resolve(response);
    }),
    
    delete: vi.fn().mockImplementation((url) => {
      const response = mockResponses[url] || { data: 'default response' };
      return Promise.resolve(response);
    }),
    
    // Helper to setup specific URL responses
    setupResponse: (url, response) => {
      mockResponses[url] = response;
    },
    
    // Helper to verify calls
    getCalls: (method) => {
      return mockResponses[method]?.mock?.calls || [];
    }
  };
};

/**
 * Singleton Service Mock Factory
 * Handles Vitest hoisting and singleton pattern incompatibility
 */
export const mockSingleton = (modulePath, className, mockMethods) => {
  return vi.mock(modulePath, () => ({
    [className]: {
      getInstance: vi.fn(() => mockMethods)
    }
  }));
};

/**
 * Browser Environment Mock Setup
 * Handles localStorage, sessionStorage, and other browser APIs
 */
export const setupBrowserMocks = () => {
  // localStorage mock
  const localStorageMap = new Map();
  global.localStorage = {
    getItem: vi.fn((key) => localStorageMap.get(key) || null),
    setItem: vi.fn((key, value) => localStorageMap.set(key, value)),
    removeItem: vi.fn((key) => localStorageMap.delete(key)),
    clear: vi.fn(() => localStorageMap.clear()),
    get length() { return localStorageMap.size; },
    key: vi.fn((index) => Array.from(localStorageMap.keys())[index] || null)
  };

  // sessionStorage mock
  const sessionStorageMap = new Map();
  global.sessionStorage = {
    getItem: vi.fn((key) => sessionStorageMap.get(key) || null),
    setItem: vi.fn((key, value) => sessionStorageMap.set(key, value)),
    removeItem: vi.fn((key) => sessionStorageMap.delete(key)),
    clear: vi.fn(() => sessionStorageMap.clear()),
    get length() { return sessionStorageMap.size; },
    key: vi.fn((index) => Array.from(sessionStorageMap.keys())[index] || null)
  };

  // window.location mock
  delete global.window;
  global.window = {
    location: {
      href: 'http://localhost:3000/',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: ''
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };

  return {
    localStorageMap,
    sessionStorageMap,
    resetStorage: () => {
      localStorageMap.clear();
      sessionStorageMap.clear();
    }
  };
};

/**
 * Auth Service Mock Factory
 * Common authentication service patterns
 */
export const createAuthServiceMock = (initialState = {}) => {
  const defaultState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    ...initialState
  };

  return {
    login: vi.fn().mockImplementation(async (credentials) => {
      const response = { user: { id: 1, email: credentials.email }, tokens: { access: 'mock-token' } };
      return Promise.resolve(response);
    }),
    
    logout: vi.fn().mockImplementation(async () => {
      return Promise.resolve({ success: true });
    }),
    
    refreshToken: vi.fn().mockImplementation(async () => {
      return Promise.resolve({ tokens: { access: 'new-mock-token' } });
    }),
    
    getCurrentUser: vi.fn().mockImplementation(() => {
      return Promise.resolve(defaultState.user);
    }),
    
    isAuthenticated: vi.fn().mockImplementation(() => {
      return defaultState.isAuthenticated;
    }),
    
    getTokens: vi.fn().mockImplementation(() => {
      return defaultState.tokens;
    }),
    
    // Helper to change mock state
    setState: (newState) => {
      Object.assign(defaultState, newState);
    },
    
    // Helper to reset mock
    reset: () => {
      Object.assign(defaultState, {
        isAuthenticated: false,
        user: null,
        tokens: null
      });
    }
  };
};

/**
 * Home Assistant Service Mock Factory
 * Specific to TappHA project but follows general patterns
 */
export const createHomeAssistantServiceMock = () => {
  return {
    connect: vi.fn().mockImplementation(async (connectionData) => {
      return Promise.resolve({
        id: 'mock-connection-id',
        name: connectionData.name,
        url: connectionData.url,
        status: 'connected'
      });
    }),
    
    disconnect: vi.fn().mockImplementation(async (connectionId) => {
      return Promise.resolve({ success: true });
    }),
    
    getConnections: vi.fn().mockImplementation(async () => {
      return Promise.resolve([
        { id: '1', name: 'Test HA', url: 'http://localhost:8123', status: 'connected' }
      ]);
    }),
    
    testConnection: vi.fn().mockImplementation(async (url, token) => {
      return Promise.resolve({ valid: true, version: '2023.12.0' });
    }),
    
    getEvents: vi.fn().mockImplementation(async (connectionId, options = {}) => {
      return Promise.resolve({
        events: [
          { id: '1', type: 'state_changed', data: { entity_id: 'light.living_room' } }
        ],
        pagination: { page: 1, totalPages: 1 }
      });
    })
  };
};

/**
 * Form Testing Utilities
 * Common form interaction patterns with proper async handling
 */
export const createFormTestUtils = (screen, fireEvent, waitFor) => {
  return {
    fillInput: async (labelText, value) => {
      const input = screen.getByLabelText(labelText);
      fireEvent.change(input, { target: { value } });
      await waitFor(() => {
        expect(input.value).toBe(value);
      });
    },
    
    submitFormAndWaitForResult: async (submitButtonText, expectedResultText) => {
      const submitButton = screen.getByRole('button', { name: submitButtonText });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(expectedResultText)).toBeInTheDocument();
      });
    },
    
    submitFormAndWaitForError: async (submitButtonText, errorText) => {
      const submitButton = screen.getByRole('button', { name: submitButtonText });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorElement = typeof errorText === 'string' 
          ? screen.getByText(errorText)
          : screen.getByText(errorText);
        expect(errorElement).toBeInTheDocument();
      });
    },
    
    waitForFormValidation: async (inputLabel, errorMessage) => {
      const input = screen.getByLabelText(inputLabel);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    }
  };
};

/**
 * Contract Testing Utilities
 * Generate tests that validate service contracts
 */
export const createContractTest = (serviceName, contract) => {
  return contract.methods.map(method => ({
    name: `${serviceName}.${method.name} contract test`,
    test: async (implementation) => {
      // Validate input schema if provided
      if (method.input && method.mockInput) {
        const result = method.input.safeParse(method.mockInput);
        expect(result.success).toBe(true);
      }
      
      // Execute method
      const output = await implementation[method.name](method.mockInput);
      
      // Validate output schema if provided
      if (method.output) {
        const result = method.output.safeParse(output);
        expect(result.success).toBe(true);
      }
      
      return output;
    }
  }));
};

/**
 * Test Debugging Utilities
 * Helper functions for debugging test failures
 */
export const testDebugUtils = {
  logMockCalls: (mock, label) => {
    console.log(`=== ${label} Mock Calls ===`);
    if (mock.mock && mock.mock.calls) {
      mock.mock.calls.forEach((call, index) => {
        console.log(`Call ${index}:`, call);
      });
    } else {
      console.log('No calls recorded');
    }
  },
  
  logComponentState: (screen) => {
    console.log('=== Component State ===');
    console.log(screen.debug());
  },
  
  logLocalStorage: () => {
    console.log('=== LocalStorage ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    }
  },
  
  logMockHistory: (mockObject) => {
    console.log('=== All Mock Call History ===');
    Object.keys(mockObject).forEach(methodName => {
      if (mockObject[methodName].mock) {
        console.log(`${methodName}:`, mockObject[methodName].mock.calls);
      }
    });
  }
};

/**
 * Mock Validation Utilities
 * Validate that mocks match service signatures
 */
export const validateMocks = {
  checkServiceMethodsCovered: (service, mockObject, serviceName = 'Service') => {
    const serviceMethods = Object.getOwnPropertyNames(service.prototype || service)
      .filter(name => typeof service[name] === 'function' && name !== 'constructor');
    
    const mockMethods = Object.keys(mockObject);
    const missing = serviceMethods.filter(method => !mockMethods.includes(method));
    
    if (missing.length > 0) {
      console.warn(`⚠️  ${serviceName} missing mocks for: ${missing.join(', ')}`);
      return false;
    }
    
    console.log(`✅ ${serviceName} all methods mocked`);
    return true;
  },
  
  checkMockCallSignatures: (mockObject, expectedSignatures) => {
    const issues = [];
    
    Object.entries(expectedSignatures).forEach(([methodName, expectedArgs]) => {
      const mock = mockObject[methodName];
      if (mock && mock.mock && mock.mock.calls.length > 0) {
        mock.mock.calls.forEach((call, index) => {
          if (call.length !== expectedArgs.length) {
            issues.push(`${methodName} call ${index}: expected ${expectedArgs.length} args, got ${call.length}`);
          }
        });
      }
    });
    
    return issues;
  }
};

export default {
  createApiClientMock,
  mockSingleton,
  setupBrowserMocks,
  createAuthServiceMock,
  createHomeAssistantServiceMock,
  createFormTestUtils,
  createContractTest,
  testDebugUtils,
  validateMocks
};