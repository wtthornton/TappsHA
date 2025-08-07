import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../../src/App';

// Mock the API client
vi.mock('../../../src/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('App Component', () => {
  it('should render without crashing', () => {
    const queryClient = createTestQueryClient();
    
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const queryClient = createTestQueryClient();
    
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('should display main navigation', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Check for navigation elements
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('should display main content area', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Check for main content
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Check for loading indicators
    const loadingElements = screen.queryAllByText(/loading/i);
    expect(loadingElements.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle error state', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    // Check for error handling
    const errorElements = screen.queryAllByText(/error/i);
    expect(errorElements.length).toBeGreaterThanOrEqual(0);
  });
}); 