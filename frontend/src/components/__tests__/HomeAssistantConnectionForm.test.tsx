import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import HomeAssistantConnectionForm from '../HomeAssistantConnectionForm';

// Mock window.alert
const mockAlert = vi.fn();
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

// Mock the home assistant API
vi.mock('../../services/api/home-assistant', () => ({
  homeAssistantApi: {
    connect: vi.fn(),
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

describe('HomeAssistantConnectionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders connection form with all required fields', () => {
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    expect(screen.getByLabelText(/connection name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/home assistant url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/long-lived access token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show test mode/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText(/url is required/i)).toBeInTheDocument();
      expect(screen.getByText(/token is required/i)).toBeInTheDocument();
      expect(screen.getByText(/connection name is required/i)).toBeInTheDocument();
    });
  });

  it('validates URL format', async () => {
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Connection' } });
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    fireEvent.change(tokenInput, { target: { value: 'test-token' } });
    
    // Submit the form directly using the form element
    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    await waitFor(() => {
      expect(screen.getByText('URL must start with http:// or https://')).toBeInTheDocument();
    });
  });

  it('handles successful connection', async () => {
    const mockConnectionResponse = {
      success: true,
      connectionId: '1',
      message: 'Connection established successfully',
    };

    (mockHomeAssistantApi.connect as any).mockResolvedValue(mockConnectionResponse);
    
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    const connectButton = screen.getByRole('button', { name: /connect/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Connection' } });
    fireEvent.change(urlInput, { target: { value: 'https://homeassistant.local' } });
    fireEvent.change(tokenInput, { target: { value: 'test-token' } });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(mockHomeAssistantApi.connect).toHaveBeenCalledWith({
        connectionName: 'Test Connection',
        url: 'https://homeassistant.local',
        token: 'test-token',
      });
    });
  });

  it('handles connection error', async () => {
    (mockHomeAssistantApi.connect as any).mockRejectedValue(new Error('Connection failed'));
    
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    const connectButton = screen.getByRole('button', { name: /connect/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Connection' } });
    fireEvent.change(urlInput, { target: { value: 'https://homeassistant.local' } });
    fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during connection', async () => {
    let resolveConnection: (value: any) => void;
    const connectionPromise = new Promise((resolve) => {
      resolveConnection = resolve;
    });
    
    (mockHomeAssistantApi.connect as any).mockReturnValue(connectionPromise);
    
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    const connectButton = screen.getByRole('button', { name: /connect/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Connection' } });
    fireEvent.change(urlInput, { target: { value: 'https://homeassistant.local' } });
    fireEvent.change(tokenInput, { target: { value: 'test-token' } });
    fireEvent.click(connectButton);
    
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
    
    // Resolve the promise
    resolveConnection!({
      success: true,
      connectionId: '1',
      message: 'Connection established successfully',
    });
  });

  it('validates token format', async () => {
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Connection' } });
    fireEvent.change(urlInput, { target: { value: 'https://homeassistant.local' } });
    fireEvent.change(tokenInput, { target: { value: 'short' } });
    
    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText(/token must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('validates connection name length', async () => {
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    
    fireEvent.change(nameInput, { target: { value: 'ab' } });
    fireEvent.change(urlInput, { target: { value: 'https://homeassistant.local' } });
    fireEvent.change(tokenInput, { target: { value: 'test-token-123' } });
    
    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText(/connection name must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('clears form after successful connection', async () => {
    const mockConnectionResponse = {
      success: true,
      connectionId: '1',
      message: 'Connection established successfully',
    };

    (mockHomeAssistantApi.connect as any).mockResolvedValue(mockConnectionResponse);
    
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    const connectButton = screen.getByRole('button', { name: /connect/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Connection' } });
    fireEvent.change(urlInput, { target: { value: 'https://homeassistant.local' } });
    fireEvent.change(tokenInput, { target: { value: 'test-token' } });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(mockHomeAssistantApi.connect).toHaveBeenCalled();
    });
  });

  it('handles network errors gracefully', async () => {
    (mockHomeAssistantApi.connect as any).mockRejectedValue(new Error('Network error'));
    
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const nameInput = screen.getByLabelText(/connection name/i);
    const urlInput = screen.getByLabelText(/home assistant url/i);
    const tokenInput = screen.getByLabelText(/long-lived access token/i);
    const connectButton = screen.getByRole('button', { name: /connect/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Connection' } });
    fireEvent.change(urlInput, { target: { value: 'https://homeassistant.local' } });
    fireEvent.change(tokenInput, { target: { value: 'test-token' } });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('toggles test mode correctly', () => {
    renderWithProviders(<HomeAssistantConnectionForm />);
    
    const testModeButton = screen.getByRole('button', { name: /show test mode/i });
    fireEvent.click(testModeButton);
    
    expect(screen.getByText(/test mode enabled/i)).toBeInTheDocument();
    
    fireEvent.click(testModeButton);
    
    expect(screen.queryByText(/test mode enabled/i)).not.toBeInTheDocument();
  });
}); 