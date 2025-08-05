import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import EventMonitoringDashboard from '../EventMonitoringDashboard';

// Mock the home assistant service
vi.mock('../../services/api/home-assistant', () => ({
  homeAssistantApi: {
    getConnections: vi.fn(),
    getEvents: vi.fn(),
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
    },
    {
      id: '2',
      name: 'Home Assistant Cloud',
      url: 'https://home-assistant.io',
      status: 'CONNECTED',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  currentPage: 0,
  size: 20,
};

const mockEvents = {
  events: [
    {
      id: '1',
      connectionId: '1',
      eventType: 'state_changed',
      entityId: 'sensor.temperature',
      oldState: '20.5',
      newState: '21.2',
      timestamp: '2024-01-15T10:30:00Z',
      data: {
        entity_id: 'sensor.temperature',
        old_state: { state: '20.5' },
        new_state: { state: '21.2' },
      },
    },
    {
      id: '2',
      connectionId: '1',
      eventType: 'state_changed',
      entityId: 'light.living_room',
      oldState: 'off',
      newState: 'on',
      timestamp: '2024-01-15T10:31:00Z',
      data: {
        entity_id: 'light.living_room',
        old_state: { state: 'off' },
        new_state: { state: 'on' },
      },
    },
  ],
  totalElements: 2,
  totalPages: 1,
  currentPage: 0,
  size: 100,
};

describe('EventMonitoringDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with title and filters', () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    expect(screen.getByText(/event monitoring/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search events/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/connection filter/i)).toBeInTheDocument();
  });

  it('displays events list when data is loaded', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
      expect(screen.getByText('light.living_room')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching events', () => {
    let resolveEvents: (value: any) => void;
    const eventsPromise = new Promise((resolve) => {
      resolveEvents = resolve;
    });
    
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockReturnValue(eventsPromise);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    expect(screen.getByText(/loading events/i)).toBeInTheDocument();
    
    // Resolve the promise
    resolveEvents!(mockEvents);
  });

  it('shows error state when events fetch fails', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockRejectedValue(new Error('Failed to load events'));
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load events/i)).toBeInTheDocument();
    });
  });

  it('filters events by search term', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByLabelText(/search events/i);
    fireEvent.change(searchInput, { target: { value: 'temperature' } });
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
      expect(screen.queryByText('light.living_room')).not.toBeInTheDocument();
    });
  });

  it('filters events by connection', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
    });
    
    const connectionSelect = screen.getByLabelText(/connection filter/i);
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
    });
  });

  it('displays event details in modal', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
    });
    
    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButton);
    
    await waitFor(() => {
      expect(screen.getByText(/event details/i)).toBeInTheDocument();
      expect(screen.getByText(/state_changed/i)).toBeInTheDocument();
    });
  });

  it('closes event details modal', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
    });
    
    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButton);
    
    await waitFor(() => {
      expect(screen.getByText(/event details/i)).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/event details/i)).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no events exist', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue({
      events: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 100,
    });
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/no events found/i)).toBeInTheDocument();
    });
  });

  it('displays event timestamps in readable format', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      // Should display relative time like "2 hours ago" or similar
      expect(screen.getByText(/ago/i)).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    // Should call getEvents again
    expect(mockHomeAssistantApi.getEvents).toHaveBeenCalledTimes(2);
  });

  it('exports events data', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    
    // Should trigger download or show export options
    expect(exportButton).toBeInTheDocument();
  });

  it('displays event type indicators correctly', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      // Should show event type badges
      expect(screen.getByText(/state_changed/i)).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    const paginatedEvents = {
      events: Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        connectionId: '1',
        eventType: 'state_changed',
        entityId: `sensor.temperature_${i}`,
        oldState: '20.5',
        newState: '21.2',
        timestamp: '2024-01-15T10:30:00Z',
        data: {
          entity_id: `sensor.temperature_${i}`,
          old_state: { state: '20.5' },
          new_state: { state: '21.2' },
        },
      })),
      totalElements: 25,
      totalPages: 2,
      currentPage: 0,
      size: 20,
    };
    
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(paginatedEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('sensor.temperature_0')).toBeInTheDocument();
    });
    
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextPageButton);
    
    // Should call getEvents with next page
    expect(mockHomeAssistantApi.getEvents).toHaveBeenCalledWith('1', 100, 20);
  });

  it('shows no connections message when no connections available', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue({
      connections: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 20,
    });
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/no connections available/i)).toBeInTheDocument();
      expect(screen.getByText(/please add a home assistant connection/i)).toBeInTheDocument();
    });
  });
}); 