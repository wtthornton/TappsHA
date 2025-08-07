import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BatchStatusIndicator from '../BatchStatusIndicator';

// Mock the API service
jest.mock('../../services/api/ai-suggestions', () => ({
  aiSuggestionsService: {
    getBatchStatus: jest.fn(),
  },
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BatchStatusIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders batch processing status when active batch exists', () => {
    renderWithQueryClient(<BatchStatusIndicator />);
    
    expect(screen.getByText('Batch Processing')).toBeInTheDocument();
    expect(screen.getByText('65 of 100 items processed')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
  });

  it('displays progress bar with correct percentage', () => {
    renderWithQueryClient(<BatchStatusIndicator />);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
    
    // Check that progress text is displayed
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('shows batch details when expanded', () => {
    renderWithQueryClient(<BatchStatusIndicator />);
    
    // Click to expand
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    // Check for detailed information
    expect(screen.getByText('Batch ID:')).toBeInTheDocument();
    expect(screen.getByText('batch-123')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();
    expect(screen.getByText('Processed:')).toBeInTheDocument();
    expect(screen.getByText('65 / 100')).toBeInTheDocument();
  });

  it('displays correct status colors', () => {
    renderWithQueryClient(<BatchStatusIndicator />);
    
    const statusBadge = screen.getByText('processing');
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('shows error information when errors exist', () => {
    // Mock a batch with errors
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['batch-status', null], {
      batchId: 'batch-123',
      status: 'failed',
      progress: 50,
      totalItems: 100,
      processedItems: 50,
      errors: ['Error 1', 'Error 2'],
      createdAt: '2023-01-01T00:00:00Z'
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BatchStatusIndicator />
      </QueryClientProvider>
    );
    
    // Expand to see errors
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('shows action buttons for failed batches', () => {
    // Mock a failed batch
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['batch-status', null], {
      batchId: 'batch-123',
      status: 'failed',
      progress: 50,
      totalItems: 100,
      processedItems: 50,
      errors: ['Error occurred'],
      createdAt: '2023-01-01T00:00:00Z'
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BatchStatusIndicator />
      </QueryClientProvider>
    );
    
    // Expand to see actions
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    expect(screen.getByText('Retry Batch')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('does not render when no active batch', () => {
    // Mock no active batch
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['batch-status', null], {
      batchId: 'batch-123',
      status: 'completed',
      progress: 100,
      totalItems: 100,
      processedItems: 100,
      errors: [],
      createdAt: '2023-01-01T00:00:00Z',
      completedAt: '2023-01-01T01:00:00Z'
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BatchStatusIndicator />
      </QueryClientProvider>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('handles different status types correctly', () => {
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    
    statuses.forEach(status => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(['batch-status', null], {
        batchId: 'batch-123',
        status,
        progress: 50,
        totalItems: 100,
        processedItems: 50,
        errors: [],
        createdAt: '2023-01-01T00:00:00Z'
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BatchStatusIndicator />
        </QueryClientProvider>
      );
      
      if (status === 'completed' || status === 'failed') {
        // Should not render for completed/failed statuses
        expect(screen.queryByText('Batch Processing')).not.toBeInTheDocument();
      } else {
        // Should render for pending/processing statuses
        expect(screen.getByText('Batch Processing')).toBeInTheDocument();
        expect(screen.getByText(status)).toBeInTheDocument();
      }
      
      unmount();
    });
  });

  it('formats dates correctly', () => {
    renderWithQueryClient(<BatchStatusIndicator />);
    
    // Expand to see dates
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    expect(screen.getByText('Started:')).toBeInTheDocument();
    // The actual date format will depend on the locale, so we just check it exists
    expect(screen.getByText(/1\/1\/2023/)).toBeInTheDocument();
  });

  it('handles completed batch with completion date', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['batch-status', null], {
      batchId: 'batch-123',
      status: 'processing', // Keep as processing to show the component
      progress: 100,
      totalItems: 100,
      processedItems: 100,
      errors: [],
      createdAt: '2023-01-01T00:00:00Z',
      completedAt: '2023-01-01T01:00:00Z'
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BatchStatusIndicator />
      </QueryClientProvider>
    );
    
    // Expand to see completion date
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    expect(screen.getByText('Completed:')).toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    renderWithQueryClient(<BatchStatusIndicator className="custom-class" />);
    
    const container = screen.getByText('Batch Processing').closest('div');
    expect(container?.parentElement).toHaveClass('custom-class');
  });

  it('handles empty errors array', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['batch-status', null], {
      batchId: 'batch-123',
      status: 'processing',
      progress: 50,
      totalItems: 100,
      processedItems: 50,
      errors: [],
      createdAt: '2023-01-01T00:00:00Z'
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BatchStatusIndicator />
      </QueryClientProvider>
    );
    
    // Expand to see details
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    // Should not show errors section when errors array is empty
    expect(screen.queryByText('Errors')).not.toBeInTheDocument();
  });

  it('handles missing optional fields', () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['batch-status', null], {
      batchId: 'batch-123',
      status: 'processing',
      progress: 50,
      totalItems: 100,
      processedItems: 50,
      errors: [],
      createdAt: '2023-01-01T00:00:00Z'
      // No completedAt field
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BatchStatusIndicator />
      </QueryClientProvider>
    );
    
    // Expand to see details
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    // Should not show completed date when not present
    expect(screen.queryByText('Completed:')).not.toBeInTheDocument();
  });

  it('updates progress bar width based on progress', () => {
    renderWithQueryClient(<BatchStatusIndicator />);
    
    // Expand to see progress bar
    const header = screen.getByText('Batch Processing').closest('div');
    fireEvent.click(header!);
    
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    const progressFill = progressBar.querySelector('div');
    
    // Check that the progress fill has the correct width
    expect(progressFill).toHaveStyle('width: 65%');
  });

  it('handles click events on header', () => {
    renderWithQueryClient(<BatchStatusIndicator />);
    
    const header = screen.getByText('Batch Processing').closest('div');
    
    // Initially collapsed
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(header!);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(header!);
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
  });

  it('shows correct status icon for different statuses', () => {
    const statusIconTests = [
      { status: 'completed', shouldShow: false },
      { status: 'failed', shouldShow: false },
      { status: 'processing', shouldShow: true },
      { status: 'pending', shouldShow: true }
    ];
    
    statusIconTests.forEach(({ status, shouldShow }) => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(['batch-status', null], {
        batchId: 'batch-123',
        status,
        progress: 50,
        totalItems: 100,
        processedItems: 50,
        errors: [],
        createdAt: '2023-01-01T00:00:00Z'
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BatchStatusIndicator />
        </QueryClientProvider>
      );
      
      if (shouldShow) {
        expect(screen.getByText('Batch Processing')).toBeInTheDocument();
      } else {
        expect(screen.queryByText('Batch Processing')).not.toBeInTheDocument();
      }
      
      unmount();
    });
  });
}); 