import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../auth';

// Mock the API client
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../api-client', () => ({
  default: {
    post: mockPost,
    get: mockGet,
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any stored tokens
    authService['tokenStorage'].clearTokens();
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpassword',
      };

      const mockResponse = {
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

      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.login(loginData);

      expect(mockPost).toHaveBeenCalledWith('/v1/auth/login', loginData);
      expect(result).toEqual(mockResponse);
      // Check that tokens are stored in encrypted storage
      expect(authService['tokenStorage'].getTokens()).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('should handle login error', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const mockError = new Error('Invalid credentials');
      mockPost.mockRejectedValue(mockError);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(mockPost).toHaveBeenCalledWith('/v1/auth/login', loginData);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Set up tokens in encrypted storage
      authService['tokenStorage'].setTokens('test-token', 'test-refresh-token');

      const mockResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/v1/auth/logout', {
        refreshToken: 'test-refresh-token',
      });
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
      // Check that tokens are cleared
      expect(authService['tokenStorage'].getTokens()).toBeNull();
    });

    it('should handle logout error', async () => {
      // Set up tokens in encrypted storage
      authService['tokenStorage'].setTokens('test-token', 'test-refresh-token');

      const mockError = new Error('Logout failed');
      mockPost.mockRejectedValue(mockError);

      const result = await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/v1/auth/logout', {
        refreshToken: 'test-refresh-token',
      });
      // Should still return success even if API call fails
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
      // Check that tokens are still cleared
      expect(authService['tokenStorage'].getTokens()).toBeNull();
    });

    it('should clear local storage even if API call fails', async () => {
      // Set up tokens in encrypted storage
      authService['tokenStorage'].setTokens('test-token', 'test-refresh-token');

      const mockError = new Error('Logout failed');
      mockPost.mockRejectedValue(mockError);

      const result = await authService.logout();

      // Should still return success even if API call fails
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
      // Should still clear encrypted storage
      expect(authService['tokenStorage'].getTokens()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Set up tokens in localStorage
      const mockTokens = {
        accessToken: 'old-token',
        refreshToken: 'test-refresh-token',
        timestamp: Date.now(),
      };
      localStorage.setItem('tappha_auth_tokens', btoa(JSON.stringify(mockTokens)));

      const mockResponse = {
        success: true,
        accessToken: 'new-access-token',
        expiresIn: 3600,
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(mockPost).toHaveBeenCalledWith('/v1/auth/refresh', {
        refreshToken: 'test-refresh-token',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle refresh token error', async () => {
      // Set up tokens in localStorage
      const mockTokens = {
        accessToken: 'old-token',
        refreshToken: 'invalid-refresh-token',
        timestamp: Date.now(),
      };
      localStorage.setItem('tappha_auth_tokens', btoa(JSON.stringify(mockTokens)));

      const mockError = new Error('Refresh token invalid');
      mockPost.mockRejectedValue(mockError);

      await expect(authService.refreshToken()).rejects.toThrow('Refresh token invalid');
    });

    it('should throw error when no refresh token available', async () => {
      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });
  });

  describe('SecureTokenStorage', () => {
    it('should store and retrieve tokens securely', () => {
      const token = 'test-access-token';
      const refreshToken = 'test-refresh-token';

      // Store tokens
      authService['tokenStorage'].setTokens(token, refreshToken);

      // Retrieve tokens
      const retrievedTokens = authService['tokenStorage'].getTokens();
      expect(retrievedTokens).toEqual({
        accessToken: token,
        refreshToken: refreshToken,
      });
    });

    it('should clear all stored data', () => {
      const token = 'test-access-token';
      const refreshToken = 'test-refresh-token';

      // Store tokens
      authService['tokenStorage'].setTokens(token, refreshToken);

      // Clear tokens
      authService['tokenStorage'].clearTokens();

      // Verify tokens are cleared
      expect(authService['tokenStorage'].getTokens()).toBeNull();
    });

    it('should handle missing stored data', () => {
      // Try to retrieve data that doesn't exist
      expect(authService['tokenStorage'].getTokens()).toBeNull();
    });
  });
}); 