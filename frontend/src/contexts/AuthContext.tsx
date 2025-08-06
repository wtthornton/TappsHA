import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/api/auth';
import type { LoginRequest, LoginResponse, LogoutResponse } from '../services/api/auth';

// ✅ Context7-validated React 19 patterns
// Following React 19 best practices from Context7 documentation

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<LogoutResponse>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

// Create context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// ✅ Context7-validated AuthProvider component
// Following React 19 functional component patterns
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Context7-validated useEffect pattern
  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        if (authService.isAuthenticated()) {
          const userInfo = authService.getUserInfo();
          if (userInfo) {
            setUser(userInfo);
          } else {
            // Token exists but is invalid, clear it
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // ✅ Context7-validated useCallback pattern for stable function references
  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        const userInfo = authService.getUserInfo();
        setUser(userInfo);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Context7-validated useCallback pattern for stable function references
  // Logout function
  const logout = useCallback(async (): Promise<LogoutResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.logout();
      setUser(null);
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if logout fails
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Context7-validated useCallback pattern for stable function references
  // Check if user has specific role
  const hasRole = useCallback((role: string): boolean => {
    return authService.hasRole(role);
  }, []);

  // ✅ Context7-validated useCallback pattern for stable function references
  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return authService.hasAnyRole(roles);
  }, []);

  // Context value with stable references
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Context7-validated custom hook pattern
// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
}

// ✅ Context7-validated ProtectedRoute component
// Following React 19 functional component patterns
export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  fallback = <div>Access denied</div> 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 