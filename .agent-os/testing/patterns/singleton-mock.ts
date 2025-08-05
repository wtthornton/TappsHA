import { vi } from 'vitest';

/**
 * Creates a mock for singleton services with getInstance pattern
 * @param modulePath - Path to the module to mock
 * @param className - Name of the class to mock
 * @param mockMethods - Object containing mock implementations
 */
export function mockSingleton<T>(
  modulePath: string,
  className: string,
  mockMethods: Partial<T>
) {
  return vi.mock(modulePath, () => ({
    [className]: {
      getInstance: vi.fn(() => mockMethods),
    },
  }));
}

/**
 * Creates a mock for singleton services that also need constructor mocking
 */
export function mockSingletonWithConstructor<T>(
  modulePath: string,
  className: string,
  mockMethods: Partial<T>
) {
  const mockInstance = mockMethods;
  
  return vi.mock(modulePath, () => ({
    [className]: vi.fn(() => mockInstance),
    default: {
      getInstance: vi.fn(() => mockInstance),
    },
  }));
}

/**
 * Helper to create a singleton mock with spy functions
 */
export function createSingletonMock<T extends Record<string, any>>(
  methods: Array<keyof T>
): T {
  const mock = {} as T;
  
  methods.forEach((method) => {
    mock[method] = vi.fn() as any;
  });
  
  return mock;
}