import { screen } from '@testing-library/react';

/**
 * Debugging utilities for tests
 */
export const debug = {
  /**
   * Logs all mock calls for a given mock or set of mocks
   */
  logMockCalls: (mock: any, label: string) => {
    console.log(`\n=== ${label} Mock Calls ===`);
    if (mock.mock) {
      mock.mock.calls.forEach((call: any[], index: number) => {
        console.log(`Call ${index}:`, call);
      });
      console.log(`Total calls: ${mock.mock.calls.length}`);
    } else {
      console.log('Not a mock function');
    }
  },

  /**
   * Logs all mocks in an object
   */
  logMocks: (mocks: Record<string, any>) => {
    Object.entries(mocks).forEach(([name, mock]) => {
      debug.logMockCalls(mock, name);
    });
  },

  /**
   * Logs the current component tree
   */
  logComponent: () => {
    console.log('\n=== Component Tree ===');
    screen.debug();
  },

  /**
   * Logs all available queries
   */
  logQueries: () => {
    console.log('\n=== Available Queries ===');
    
    try {
      const buttons = screen.getAllByRole('button');
      console.log('Buttons:', buttons.map(b => b.textContent));
    } catch {
      console.log('No buttons found');
    }
    
    try {
      const inputs = screen.getAllByRole('textbox');
      console.log('Inputs:', inputs.map(i => i.getAttribute('name') || i.getAttribute('placeholder')));
    } catch {
      console.log('No text inputs found');
    }
    
    try {
      const links = screen.getAllByRole('link');
      console.log('Links:', links.map(l => l.textContent));
    } catch {
      console.log('No links found');
    }
  },

  /**
   * Logs localStorage contents
   */
  logLocalStorage: () => {
    console.log('\n=== LocalStorage ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    }
    if (localStorage.length === 0) {
      console.log('LocalStorage is empty');
    }
  },

  /**
   * Logs sessionStorage contents
   */
  logSessionStorage: () => {
    console.log('\n=== SessionStorage ===');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        console.log(`${key}:`, sessionStorage.getItem(key));
      }
    }
    if (sessionStorage.length === 0) {
      console.log('SessionStorage is empty');
    }
  },

  /**
   * Logs all storage
   */
  logStorage: () => {
    debug.logLocalStorage();
    debug.logSessionStorage();
  },

  /**
   * Logs form values
   */
  logFormValues: (formElement: HTMLFormElement) => {
    console.log('\n=== Form Values ===');
    const formData = new FormData(formElement);
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
  },

  /**
   * Logs all test IDs
   */
  logTestIds: () => {
    console.log('\n=== Test IDs ===');
    const elements = document.querySelectorAll('[data-testid]');
    elements.forEach(el => {
      console.log(el.getAttribute('data-testid'), ':', el.tagName, el.textContent?.slice(0, 50));
    });
  },

  /**
   * Waits and logs what happens
   */
  waitAndLog: async (ms: number, label: string) => {
    console.log(`\n=== Waiting ${ms}ms: ${label} ===`);
    await new Promise(resolve => setTimeout(resolve, ms));
    debug.logComponent();
  },

  /**
   * Logs React Query state
   */
  logQueryState: (queryClient: any) => {
    console.log('\n=== React Query State ===');
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    queries.forEach((query: any) => {
      console.log('Query:', query.queryKey);
      console.log('State:', query.state.status);
      console.log('Data:', query.state.data);
      console.log('Error:', query.state.error);
      console.log('---');
    });
  },
};