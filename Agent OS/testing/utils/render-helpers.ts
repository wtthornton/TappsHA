import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

/**
 * Creates a test query client with sensible defaults
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component that provides all necessary providers
 */
interface ProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

function AllTheProviders({ children, queryClient }: ProvidersProps) {
  const client = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) {
  const { queryClient, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Re-export everything from testing library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';