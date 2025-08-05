import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginForm from '../LoginForm';

// Mock the auth service
vi.mock('../../services/api/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    getUserInfo: vi.fn(),
  },
}));

const mockAuthService = vi.mocked(await import('../../services/api/auth')).authService;

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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock default auth service behavior
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getUserInfo.mockReturnValue(null);
  });

  it('renders login form with all required fields', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm />);
    
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const mockLoginResponse = {
      success: true,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['USER'],
      },
    };

    mockAuthService.login.mockResolvedValue(mockLoginResponse);
    mockAuthService.getUserInfo.mockReturnValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['USER'],
    });
    
    renderWithProviders(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('handles login error', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderWithProviders(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    
    mockAuthService.login.mockReturnValue(loginPromise);
    
    renderWithProviders(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    
    // Resolve the promise
    resolveLogin!({
      success: true,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['USER'],
      },
    });
  });

  it('validates username length', async () => {
    renderWithProviders(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    renderWithProviders(<LoginForm />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('clears form after successful login', async () => {
    const mockLoginResponse = {
      success: true,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['USER'],
      },
    };

    mockAuthService.login.mockResolvedValue(mockLoginResponse);
    mockAuthService.getUserInfo.mockReturnValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['USER'],
    });
    
    renderWithProviders(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalled();
    });
  });

  it('handles network errors gracefully', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Network error'));
    
    renderWithProviders(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
}); 