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
      connectionId: '1',
      name: 'Home Assistant Local',
      url: 'http://localhost:8123',
      status: 'CONNECTED',
    },
    {
      connectionId: '2',
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
  total: 2,
  totalPages: 1,
  currentPage: 0,
  size: 100,
};

describe('EventMonitoringDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with title and filters', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Event Monitoring')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Connection')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Entity ID')).toBeInTheDocument();
    });
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
      expect(screen.getByText('No Connections Available')).toBeInTheDocument();
      expect(screen.getByText('Please add a Home Assistant connection to monitor events.')).toBeInTheDocument();
    });
  });

  it('shows select connection message when no connection is selected', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Select a Connection')).toBeInTheDocument();
      expect(screen.getByText('Choose a Home Assistant connection to start monitoring events.')).toBeInTheDocument();
    });
  });

  it('displays events when connection is selected', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Recent Events')).toBeInTheDocument();
      expect(screen.getByText('state_changed')).toBeInTheDocument();
      expect(screen.getByText('sensor.temperature')).toBeInTheDocument();
      expect(screen.getByText('light.living_room')).toBeInTheDocument();
    });
  });

  it('displays event timestamps in readable format', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      // Should display formatted timestamp
      expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching events', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockEvents), 100))
    );
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state when events fetch fails', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockRejectedValue(new Error('Failed to fetch events'));
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading events/)).toBeInTheDocument();
    });
  });

  it('shows no events message when no events exist', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue({
      events: [],
      total: 0,
      totalPages: 0,
      currentPage: 0,
      size: 100,
    });
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('No Events')).toBeInTheDocument();
      expect(screen.getByText('No events found for the selected connection and filters.')).toBeInTheDocument();
    });
  });

  it('filters events by event type', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    // Enter event type filter
    const eventTypeInput = screen.getByLabelText('Event Type');
    fireEvent.change(eventTypeInput, { target: { value: 'state_changed' } });
    
    await waitFor(() => {
      expect(mockHomeAssistantApi.getEvents).toHaveBeenCalledWith('1', 100, 0, 'state_changed', '');
    });
  });

  it('filters events by entity ID', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    // Enter entity ID filter
    const entityIdInput = screen.getByLabelText('Entity ID');
    fireEvent.change(entityIdInput, { target: { value: 'sensor.temperature' } });
    
    await waitFor(() => {
      expect(mockHomeAssistantApi.getEvents).toHaveBeenCalledWith('1', 100, 0, '', 'sensor.temperature');
    });
  });

  it('displays event data in expandable details', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('View Event Data')).toBeInTheDocument();
    });
  });

  it('displays event count in header', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('2 events')).toBeInTheDocument();
    });
  });

  it('displays showing events count', async () => {
    mockHomeAssistantApi.getConnections.mockResolvedValue(mockConnections);
    mockHomeAssistantApi.getEvents.mockResolvedValue(mockEvents);
    
    renderWithProviders(<EventMonitoringDashboard />);
    
    // Select a connection
    const connectionSelect = screen.getByLabelText('Select Connection');
    fireEvent.change(connectionSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 events')).toBeInTheDocument();
    });
  });
});
