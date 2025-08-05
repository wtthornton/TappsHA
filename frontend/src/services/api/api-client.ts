import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ConnectionDto {
  connectionId: string;
  name: string;
  url: string;
  status: string;
  homeAssistantVersion: string;
  lastConnected: string;
  lastSeen: string;
  websocketStatus: string;
  eventCount: number;
  healthMetrics: {
    latency: number;
    uptime: number;
    errorRate: number;
  };
}

export interface ConnectionsResponse {
  connections: ConnectionDto[];
  total: number;
  page: number;
  size: number;
}

export interface ConnectRequest {
  url: string;
  token: string;
  connectionName: string;
}

export interface ConnectionResponse {
  success: boolean;
  connectionId?: string;
  errorMessage?: string;
}

export interface ConnectionTestResponse {
  connectionId: string;
  success: boolean;
  version?: string;
  apiAccess?: boolean;
  websocketAccess?: boolean;
  eventSubscription?: boolean;
  latency?: number;
  errorMessage?: string;
}

export interface DisconnectResponse {
  connectionId: string;
  success: boolean;
  message: string;
}

export interface EventResponse {
  id: string;
  eventType: string;
  entityId?: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface EventsResponse {
  events: EventResponse[];
  total: number;
  hasMore: boolean;
}

export interface MetricsResponse {
  connectionId: string;
  timeRange: string;
  metrics: {
    totalEvents: number;
    averageLatency: number;
    uptime: number;
    errorRate: number;
  };
}

// API Client class
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private handleUnauthorized() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>('/actuator/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient; 