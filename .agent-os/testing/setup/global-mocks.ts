import { setupBrowserMocks } from './browser-mocks';

/**
 * Global test setup that runs before all tests
 */
export function setupGlobalMocks() {
  // Set up browser API mocks
  setupBrowserMocks();

  // Suppress console warnings in tests
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: any[]) => {
    // Suppress React warnings in tests
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('ReactDOM.render')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    // Suppress expected errors in tests
    if (
      args[0]?.includes?.('Warning:') ||
      args[0]?.includes?.('ReactDOM.render') ||
      args[0]?.includes?.('Not implemented')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // Set up fetch mock
  global.fetch = vi.fn();

  // Set up URL mock
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Set up performance mock
  global.performance.mark = vi.fn();
  global.performance.measure = vi.fn();
}

// Run setup
setupGlobalMocks();