import { createUser, createAdminUser } from '../factories/user';

/**
 * Common API response fixtures
 */
export const fixtures = {
  auth: {
    loginSuccess: {
      success: true,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      user: createUser(),
    },
    
    loginError: {
      success: false,
      error: 'Invalid credentials',
      code: 'AUTH_INVALID_CREDENTIALS',
    },
    
    logoutSuccess: {
      success: true,
      message: 'Logged out successfully',
    },
    
    refreshSuccess: {
      success: true,
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
      expiresIn: 3600,
    },
    
    refreshError: {
      success: false,
      error: 'Invalid refresh token',
      code: 'AUTH_INVALID_REFRESH_TOKEN',
    },
    
    unauthorized: {
      success: false,
      error: 'Unauthorized',
      code: 'AUTH_UNAUTHORIZED',
    },
  },
  
  homeAssistant: {
    connectSuccess: {
      success: true,
      connectionId: 'mock-connection-id',
      message: 'Connected successfully',
    },
    
    connectError: {
      success: false,
      error: 'Failed to connect to Home Assistant',
      code: 'HA_CONNECTION_FAILED',
    },
    
    connections: [
      {
        id: 'connection-1',
        name: 'Home Assistant Primary',
        url: 'http://localhost:8123',
        status: 'connected',
        lastSeen: new Date().toISOString(),
      },
      {
        id: 'connection-2',
        name: 'Home Assistant Secondary',
        url: 'http://192.168.1.100:8123',
        status: 'disconnected',
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    
    events: [
      {
        id: 'event-1',
        type: 'state_changed',
        entityId: 'light.living_room',
        timestamp: new Date().toISOString(),
        data: {
          oldState: 'off',
          newState: 'on',
        },
      },
      {
        id: 'event-2',
        type: 'automation_triggered',
        entityId: 'automation.morning_routine',
        timestamp: new Date().toISOString(),
        data: {
          trigger: 'time',
        },
      },
    ],
    
    metrics: {
      cpu: 45.2,
      memory: 62.8,
      disk: 35.1,
      uptime: 86400,
      entityCount: 156,
      automationCount: 23,
    },
  },
  
  errors: {
    badRequest: {
      success: false,
      error: 'Bad request',
      code: 'BAD_REQUEST',
      details: {},
    },
    
    notFound: {
      success: false,
      error: 'Resource not found',
      code: 'NOT_FOUND',
    },
    
    serverError: {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    
    validationError: {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: {
        fields: {
          email: 'Invalid email format',
          password: 'Password too short',
        },
      },
    },
    
    rateLimitError: {
      success: false,
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60,
    },
  },
  
  pagination: {
    page1: {
      data: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 100,
        totalPages: 5,
      },
    },
    
    lastPage: {
      data: [],
      pagination: {
        page: 5,
        pageSize: 20,
        total: 100,
        totalPages: 5,
      },
    },
  },
};

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 20,
  total?: number
) {
  const actualTotal = total || data.length;
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      total: actualTotal,
      totalPages: Math.ceil(actualTotal / pageSize),
    },
  };
}

/**
 * Helper to create error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  details?: any
) {
  return {
    success: false,
    error: message,
    code,
    ...(details && { details }),
  };
}

/**
 * Helper to create success response
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    ...data,
  };
}