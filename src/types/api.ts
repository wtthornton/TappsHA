// API Response Types for TappHA Frontend-Backend Integration

// Base API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Error Response Interface
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Authentication Types
export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// Home Assistant Connection Types
export interface ConnectRequest {
  url: string;
  token: string;
  connectionName: string;
}

export interface ConnectionResponse {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSeen: string;
  healthMetrics: HealthMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetrics {
  latency: number;
  uptime: number;
  errorRate: number;
  lastCheck: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface TestResponse {
  success: boolean;
  message: string;
  latency?: number;
  status: 'connected' | 'disconnected' | 'error';
}

// Event Streaming Types
export interface EventResponse {
  id: string;
  eventType: string;
  entityId?: string;
  timestamp: string;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error';
  source: string;
}

export interface EventFilters {
  eventType?: string;
  entityId?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  severity?: 'info' | 'warning' | 'error';
  limit?: number;
  offset?: number;
}

export interface EventListResponse {
  events: EventResponse[];
  total: number;
  hasMore: boolean;
  filters: EventFilters;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'event' | 'status' | 'health' | 'error';
  data: any;
  timestamp: string;
  connectionId?: string;
}

export interface WebSocketEventMessage extends WebSocketMessage {
  type: 'event';
  data: EventResponse;
}

export interface WebSocketStatusMessage extends WebSocketMessage {
  type: 'status';
  data: {
    connectionId: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSeen: string;
  };
}

export interface WebSocketHealthMessage extends WebSocketMessage {
  type: 'health';
  data: HealthMetrics;
}

// Dashboard Metrics Types
export interface DashboardMetrics {
  totalConnections: number;
  activeConnections: number;
  totalEvents: number;
  eventsPerMinute: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
}

export interface MetricsCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Configuration Types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

// Request/Response Interceptor Types
export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
}

export interface ResponseConfig {
  data: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

// Error Types
export interface NetworkError {
  code: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'CORS_ERROR';
  message: string;
  originalError?: any;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
  method?: string;
}

// Connection Management Types
export interface ConnectionUpdateRequest {
  name?: string;
  url?: string;
  token?: string;
}

export interface ConnectionTestRequest {
  url: string;
  token: string;
}

export interface ConnectionDeleteResponse {
  success: boolean;
  message: string;
  deletedConnectionId: string;
}

// Export all types for easy importing
export type {
  ApiResponse,
  ApiError,
  AuthRequest,
  AuthResponse,
  UserInfo,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ConnectRequest,
  ConnectionResponse,
  HealthMetrics,
  TestResponse,
  EventResponse,
  EventFilters,
  EventListResponse,
  WebSocketMessage,
  WebSocketEventMessage,
  WebSocketStatusMessage,
  WebSocketHealthMessage,
  DashboardMetrics,
  MetricsCard,
  PaginationParams,
  PaginatedResponse,
  ApiConfig,
  RequestConfig,
  ResponseConfig,
  NetworkError,
  ApiErrorResponse,
  ConnectionUpdateRequest,
  ConnectionTestRequest,
  ConnectionDeleteResponse,
}; 