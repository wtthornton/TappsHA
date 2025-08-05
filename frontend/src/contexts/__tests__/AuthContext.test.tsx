import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the auth service
const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  validateToken: vi.fn(),
  getUserInfo: vi.fn(),
  isAuthenticated: vi.fn(),
  hasRole: vi.fn(),
  hasAnyRole: vi.fn(),
};

vi.mock('../../services/api/auth', () => ({
  authService: mockAuthService,
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.username : 'No User'}</div>
      <button onClick={() => login({ username: 'test', password: 'test' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

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

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides authentication state', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('handles successful login', async () => {
    const mockLoginResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      },
    };

    mockAuthService.login.mockResolvedValue(mockLoginResponse);
    
    renderWithProviders(<TestComponent />);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'test',
        password: 'test',
      });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('handles login error', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Login failed'));
    
    renderWithProviders(<TestComponent />);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalled();
    });
    
    // Should remain unauthenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('handles logout', async () => {
    mockAuthService.logout.mockResolvedValue({ success: true });
    
    renderWithProviders(<TestComponent />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
    
    // Should be unauthenticated after logout
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('handles logout error', async () => {
    mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));
    
    renderWithProviders(<TestComponent />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  it('validates stored token on mount', async () => {
    // Mock stored token
    const mockToken = 'stored-token';
    const mockUser = {
      id: '1',
      username: 'storeduser',
      email: 'stored@example.com',
      role: 'USER',
    };
    
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    mockAuthService.validateToken.mockResolvedValue({ valid: true, user: mockUser });
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(mockToken);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('storeduser');
    });
  });

  it('handles invalid stored token', async () => {
    // Mock stored token
    const mockToken = 'invalid-token';
    localStorage.setItem('auth_token', mockToken);
    
    mockAuthService.validateToken.mockResolvedValue({ valid: false });
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(mockToken);
    });
    
    // Should clear invalid token and remain unauthenticated
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
  });

  it('handles token validation error', async () => {
    // Mock stored token
    const mockToken = 'stored-token';
    localStorage.setItem('auth_token', mockToken);
    
    mockAuthService.validateToken.mockRejectedValue(new Error('Validation failed'));
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(mockToken);
    });
    
    // Should clear token on error and remain unauthenticated
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
  });

  it('refreshes token when needed', async () => {
    // Mock stored refresh token
    const mockRefreshToken = 'stored-refresh-token';
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'USER',
    };
    
    localStorage.setItem('auth_refresh_token', mockRefreshToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    const mockRefreshResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: mockUser,
    };
    
    mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockRefreshToken);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('handles refresh token error', async () => {
    // Mock stored refresh token
    const mockRefreshToken = 'stored-refresh-token';
    localStorage.setItem('auth_refresh_token', mockRefreshToken);
    
    mockAuthService.refreshToken.mockRejectedValue(new Error('Refresh failed'));
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockRefreshToken);
    });
    
    // Should clear tokens on refresh error
    expect(localStorage.getItem('auth_refresh_token')).toBeNull();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
  });

  it('shows loading state during authentication', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    
    mockAuthService.login.mockReturnValue(loginPromise);
    
    renderWithProviders(<TestComponent />);
    
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });
    
    // Resolve the promise
    resolveLogin!({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'USER' },
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  it('clears all auth data on logout', async () => {
    // Set up some stored auth data
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_refresh_token', 'test-refresh');
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', username: 'test' }));
    
    mockAuthService.logout.mockResolvedValue({ success: true });
    
    renderWithProviders(<TestComponent />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
    
    // Should clear all auth data
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_refresh_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
}); 