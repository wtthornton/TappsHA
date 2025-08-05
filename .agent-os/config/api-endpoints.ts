/**
 * Single source of truth for all API endpoints
 * This ensures consistency between services and tests
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/v1/auth/login',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
    register: '/v1/auth/register',
    verify: '/v1/auth/verify',
    resetPassword: '/v1/auth/reset-password',
    changePassword: '/v1/auth/change-password',
  },
  
  homeAssistant: {
    connect: '/v1/home-assistant/connect',
    connections: '/v1/home-assistant/connections',
    connection: (id: string) => `/v1/home-assistant/connections/${id}`,
    disconnect: (id: string) => `/v1/home-assistant/connections/${id}/disconnect`,
    test: (id: string) => `/v1/home-assistant/connections/${id}/test`,
    events: (id: string) => `/v1/home-assistant/connections/${id}/events`,
    metrics: (id: string) => `/v1/home-assistant/connections/${id}/metrics`,
    status: (id: string) => `/v1/home-assistant/connections/${id}/status`,
  },
  
  ai: {
    chat: '/v1/ai/chat',
    suggestions: '/v1/ai/suggestions',
    analyze: '/v1/ai/analyze',
    train: '/v1/ai/train',
    models: '/v1/ai/models',
    model: (id: string) => `/v1/ai/models/${id}`,
  },
  
  analytics: {
    dashboard: '/v1/analytics/dashboard',
    events: '/v1/analytics/events',
    metrics: '/v1/analytics/metrics',
    reports: '/v1/analytics/reports',
    export: '/v1/analytics/export',
  },
  
  settings: {
    user: '/v1/settings/user',
    preferences: '/v1/settings/preferences',
    notifications: '/v1/settings/notifications',
    security: '/v1/settings/security',
  },
  
  admin: {
    users: '/v1/admin/users',
    user: (id: string) => `/v1/admin/users/${id}`,
    roles: '/v1/admin/roles',
    permissions: '/v1/admin/permissions',
    audit: '/v1/admin/audit',
    system: '/v1/admin/system',
  },
} as const;

/**
 * Type-safe endpoint builder
 */
export type EndpointPaths = typeof API_ENDPOINTS;

/**
 * Helper to build full URL with base URL
 */
export function buildUrl(baseUrl: string, endpoint: string): string {
  return `${baseUrl.replace(/\/$/, '')}${endpoint}`;
}

/**
 * Helper to add query parameters
 */
export function withQueryParams(endpoint: string, params: Record<string, any>): string {
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  ).toString();
  
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}