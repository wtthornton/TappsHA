import apiClient from './api-client';

// Authentication interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  expiresIn: number;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Secure token storage with encryption
class SecureTokenStorage {
  private static readonly STORAGE_KEY = 'tappha_auth_tokens';


  private encrypt(data: string): string {
    // Simple base64 encoding for demo - in production use proper encryption
    return btoa(data);
  }

  private decrypt(encryptedData: string): string {
    // Simple base64 decoding for demo - in production use proper decryption
    return atob(encryptedData);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    const tokens = {
      accessToken,
      refreshToken,
      timestamp: Date.now(),
    };
    const encrypted = this.encrypt(JSON.stringify(tokens));
    localStorage.setItem(SecureTokenStorage.STORAGE_KEY, encrypted);
  }

  getTokens(): { accessToken: string; refreshToken: string } | null {
    try {
      const encrypted = localStorage.getItem(SecureTokenStorage.STORAGE_KEY);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      const tokens = JSON.parse(decrypted);
      
      // Check if tokens are expired (24 hours)
      const now = Date.now();
      const tokenAge = now - tokens.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (tokenAge > maxAge) {
        this.clearTokens();
        return null;
      }

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Error reading tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  clearTokens(): void {
    localStorage.removeItem(SecureTokenStorage.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.getTokens() !== null;
  }
}

// Authentication service
export class AuthService {
  private static instance: AuthService;
  private tokenStorage: SecureTokenStorage;
  private refreshPromise: Promise<RefreshTokenResponse> | null = null;

  private constructor() {
    this.tokenStorage = new SecureTokenStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login with username/password
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
      
      if (response.success && response.accessToken) {
        this.tokenStorage.setTokens(response.accessToken, response.refreshToken);
        this.setupTokenRefresh(response.expiresIn);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<LogoutResponse> {
    try {
      const tokens = this.tokenStorage.getTokens();
      if (tokens) {
        await apiClient.post<LogoutResponse>('/v1/auth/logout', {
          refreshToken: tokens.refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.tokenStorage.clearTokens();
      this.refreshPromise = null;
    }

    return { success: true, message: 'Logged out successfully' };
  }

  // Refresh access token
  async refreshToken(): Promise<RefreshTokenResponse> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const tokens = this.tokenStorage.getTokens();
    if (!tokens) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = apiClient.post<RefreshTokenResponse>('/v1/auth/refresh', {
      refreshToken: tokens.refreshToken,
    });

    try {
      const response = await this.refreshPromise;
      
      if (response.success && response.accessToken) {
        this.tokenStorage.setTokens(response.accessToken, tokens.refreshToken);
        this.setupTokenRefresh(response.expiresIn);
      }

      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.tokenStorage.clearTokens();
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Get current access token
  getAccessToken(): string | null {
    const tokens = this.tokenStorage.getTokens();
    return tokens?.accessToken || null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }

  // Setup automatic token refresh
  private setupTokenRefresh(expiresIn: number): void {
    // Refresh token 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000;
    
    setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Automatic token refresh failed:', error);
        // Force logout on refresh failure
        await this.logout();
      }
    }, refreshTime);
  }

  // Get user info from token (JWT decode)
  getUserInfo(): { id: string; username: string; email: string; roles: string[] } | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        roles: payload.roles || [],
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.roles.includes(role) || false;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.roles.some(role => roles.includes(role)) || false;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance(); 