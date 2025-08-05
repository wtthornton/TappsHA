/**
 * Sets up browser API mocks for testing
 */
export function setupBrowserMocks() {
  // LocalStorage mock
  const localStorageMap = new Map<string, string>();
  
  global.localStorage = {
    getItem: (key: string) => localStorageMap.get(key) || null,
    setItem: (key: string, value: string) => localStorageMap.set(key, value),
    removeItem: (key: string) => localStorageMap.delete(key),
    clear: () => localStorageMap.clear(),
    get length() {
      return localStorageMap.size;
    },
    key: (index: number) => {
      const keys = Array.from(localStorageMap.keys());
      return keys[index] || null;
    },
  } as Storage;

  // SessionStorage mock
  const sessionStorageMap = new Map<string, string>();
  
  global.sessionStorage = {
    getItem: (key: string) => sessionStorageMap.get(key) || null,
    setItem: (key: string, value: string) => sessionStorageMap.set(key, value),
    removeItem: (key: string) => sessionStorageMap.delete(key),
    clear: () => sessionStorageMap.clear(),
    get length() {
      return sessionStorageMap.size;
    },
    key: (index: number) => {
      const keys = Array.from(sessionStorageMap.keys());
      return keys[index] || null;
    },
  } as Storage;

  // Window.matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // IntersectionObserver mock
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  // ResizeObserver mock
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  // Window.alert mock
  window.alert = () => {};

  // Window.confirm mock
  window.confirm = () => true;

  // Window.prompt mock
  window.prompt = () => null;

  // Crypto mock for UUID generation
  if (!global.crypto) {
    global.crypto = {
      randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },
    } as any;
  }
}

/**
 * Clears all browser mocks
 */
export function clearBrowserMocks() {
  localStorage.clear();
  sessionStorage.clear();
}