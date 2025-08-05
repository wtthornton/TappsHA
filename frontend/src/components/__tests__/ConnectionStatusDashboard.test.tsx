import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import ConnectionStatusDashboard from '../ConnectionStatusDashboard';

// Mock the home assistant service
vi.mock('../../services/api/home-assistant', () => ({
  homeAssistantApi: {
    getConnections: vi.fn(),
    getConnectionStatus: vi.fn(),
    disconnect: vi.fn(),
  },
}));

const mockHomeAssistantApi = vi.mocked(await import('../../services/api/home-assistant')).homeAssistantApi;

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

const mockConnections = {
  connections: [
    {
      id: '1',
      name: 'Home Assistant Local',
      url: 'http://localhost:8123',
      status: 'CONNECTED',
      lastConnected: '2024-01-15T10:30:00Z',
      eventsProcessed: 1250,
      averageResponseTime: 150,
    },
    {
      id: '2',
      name: 'Home Assistant Cloud',
      url: 'https://home-assistant.io',
      status: 'DISCONNECTED',
      lastConnected: '2024-01-14T15:45:00Z',
      eventsProcessed: 850,
      averageResponseTime: 200,
    },
  ],
  totalElements: 2,
  totalPages: 1,
  currentPage: 0,
  size: 20,
};

describe('ConnectionStatusDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with title and metrics', () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    expect(screen.getByText(/connection status/i)).toBeInTheDocument();
    expect(screen.getByText(/total connections/i)).toBeInTheDocument();
    expect(screen.getByText(/active connections/i)).toBeInTheDocument();
    expect(screen.getByText(/total events processed/i)).toBeInTheDocument();
  });

  it('displays connection list when data is loaded', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Home Assistant Local')).toBeInTheDocument();
      expect(screen.getByText('Home Assistant Cloud')).toBeInTheDocument();
      expect(screen.getByText('http://localhost:8123')).toBeInTheDocument();
      expect(screen.getByText('https://home-assistant.io')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching connections', () => {
    let resolveConnections: (value: any) => void;
    const connectionsPromise = new Promise((resolve) => {
      resolveConnections = resolve;
    });
    
    mockHomeAssistantApi.getConnections.mockReturnValue(connectionsPromise);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    expect(screen.getByText(/loading connections/i)).toBeInTheDocument();
    
    // Resolve the promise
    resolveConnections!(mockConnections);
  });

  it('shows error state when connections fetch fails', async () => {
    mockHomeAssistantApi.getConnections.mockRejectedValue(new Error('Failed to fetch connections'));
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading connections/i)).toBeInTheDocument();
    });
  });

  it('displays no connections message when no data', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue({
      connections: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 20,
    });
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/no connections found/i)).toBeInTheDocument();
    });
  });

  it('displays last connected time in readable format', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      // Should display relative time like "2 hours ago" or similar
      expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Home Assistant Local')).toBeInTheDocument();
    });
    
    // Trigger refresh
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Should call getConnections again
    expect(mockHomeAssistantApi.getConnections).toHaveBeenCalledTimes(2);
  });

  it('displays connection health indicators', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      // Should show health indicators based on response time
      expect(screen.getByText('150ms')).toBeInTheDocument();
    });
  });

  it('handles disconnect functionality', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.disconnect.mockResolvedValue({ success: true, message: 'Disconnected successfully' });
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Home Assistant Local')).toBeInTheDocument();
    });
    
    // Find and click disconnect button
    const disconnectButtons = screen.getAllByRole('button', { name: /disconnect/i });
    fireEvent.click(disconnectButtons[0]);
    
    // Should call disconnect API
    expect(mockHomeAssistantApi.disconnect).toHaveBeenCalledWith('1');
  });

  it('displays connection status badges correctly', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      // Should show status badges
      expect(screen.getByText(/connected/i)).toBeInTheDocument();
      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    });
  });

  it('shows connection metrics correctly', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      // Should show metrics like events processed
      expect(screen.getByText('1,250')).toBeInTheDocument();
      expect(screen.getByText('850')).toBeInTheDocument();
    });
  });

  it('handles empty connections gracefully', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue({
      connections: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 20,
    });
    
    renderWithProviders(<ConnectionStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/no connections found/i)).toBeInTheDocument();
      expect(screen.getByText(/add your first home assistant connection/i)).toBeInTheDocument();
    });
  });
}); 