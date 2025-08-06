import { useCallback } from 'react';
import { useWebSocket, type WebSocketConfig } from '../../hooks/useWebSocket';

export interface HomeAssistantWebSocketConfig extends WebSocketConfig {
  accessToken: string;
  entityId?: string;
  eventTypes?: string[];
}

export interface HomeAssistantWebSocketMessage {
  type: 'auth' | 'subscribe_events' | 'get_states' | 'call_service' | 'ping' | 'pong' | 'result' | 'event';
  id?: number;
  success?: boolean;
  result?: any;
  data: any;
  timestamp: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface HomeAssistantState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HomeAssistantEvent {
  event_type: string;
  data: Record<string, any>;
  origin: string;
  time_fired: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export class HomeAssistantWebSocketService {
  private wsConfig: HomeAssistantWebSocketConfig;
  private messageId = 0;

  constructor(config: HomeAssistantWebSocketConfig) {
    this.wsConfig = config;
  }

  private getNextMessageId(): number {
    return ++this.messageId;
  }

  private createMessage(type: string, data?: any): HomeAssistantWebSocketMessage {
    return {
      type: type as any,
      id: this.getNextMessageId(),
      data,
      timestamp: Date.now(),
    };
  }

  // Authenticate with Home Assistant
  authenticate(): HomeAssistantWebSocketMessage {
    return this.createMessage('auth', {
      access_token: this.wsConfig.accessToken,
    });
  }

  // Subscribe to state changes
  subscribeToStates(entityIds?: string[]): HomeAssistantWebSocketMessage {
    return this.createMessage('subscribe_events', {
      event_type: 'state_changed',
      ...(entityIds && { entity_id: entityIds }),
    });
  }

  // Subscribe to specific events
  subscribeToEvents(eventTypes: string[]): HomeAssistantWebSocketMessage {
    return this.createMessage('subscribe_events', {
      event_type: eventTypes,
    });
  }

  // Get current states
  getStates(entityIds?: string[]): HomeAssistantWebSocketMessage {
    return this.createMessage('get_states', {
      ...(entityIds && { entity_id: entityIds }),
    });
  }

  // Call a service
  callService(domain: string, service: string, serviceData?: Record<string, any>): HomeAssistantWebSocketMessage {
    return this.createMessage('call_service', {
      domain,
      service,
      service_data: serviceData || {},
    });
  }

  // Ping for heartbeat
  ping(): HomeAssistantWebSocketMessage {
    return this.createMessage('ping');
  }

  // Parse incoming messages
  parseMessage(message: string): HomeAssistantWebSocketMessage | null {
    try {
      const parsed = JSON.parse(message);
      return {
        type: parsed.type,
        id: parsed.id,
        success: parsed.success,
        result: parsed.result,
        error: parsed.error,
        data: parsed,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to parse Home Assistant WebSocket message:', error);
      return null;
    }
  }

  // Check if message is a successful response
  isSuccessResponse(message: HomeAssistantWebSocketMessage): boolean {
    return message.success === true;
  }

  // Check if message is an error response
  isErrorResponse(message: HomeAssistantWebSocketMessage): boolean {
    return message.success === false || message.error !== undefined;
  }

  // Get error message from response
  getErrorMessage(message: HomeAssistantWebSocketMessage): string | null {
    if (message.error) {
      return `${message.error.code}: ${message.error.message}`;
    }
    return null;
  }

  // Extract states from get_states response
  extractStates(message: HomeAssistantWebSocketMessage): HomeAssistantState[] {
    if (message.type === 'result' && message.result && Array.isArray(message.result)) {
      return message.result as HomeAssistantState[];
    }
    return [];
  }

  // Extract events from event subscription
  extractEvents(message: HomeAssistantWebSocketMessage): HomeAssistantEvent[] {
    if (message.type === 'event' && message.data) {
      return [message.data as HomeAssistantEvent];
    }
    return [];
  }
}

// Hook for using Home Assistant WebSocket
export const useHomeAssistantWebSocket = (config: HomeAssistantWebSocketConfig) => {
  const [wsState, wsActions] = useWebSocket({
    url: config.url,
    protocols: config.protocols,
    reconnectInterval: config.reconnectInterval || 3000,
    maxReconnectAttempts: config.maxReconnectAttempts || 5,
    heartbeatInterval: config.heartbeatInterval || 30000,
    heartbeatMessage: JSON.stringify({ type: 'ping' }),
  });

  const service = new HomeAssistantWebSocketService(config);

  const sendAuth = useCallback(() => {
    const authMessage = service.authenticate();
    wsActions.send(authMessage);
  }, [service, wsActions]);

  const subscribeToStates = useCallback((entityIds?: string[]) => {
    const subscribeMessage = service.subscribeToStates(entityIds);
    wsActions.send(subscribeMessage);
  }, [service, wsActions]);

  const subscribeToEvents = useCallback((eventTypes: string[]) => {
    const subscribeMessage = service.subscribeToEvents(eventTypes);
    wsActions.send(subscribeMessage);
  }, [service, wsActions]);

  const getStates = useCallback((entityIds?: string[]) => {
    const getStatesMessage = service.getStates(entityIds);
    wsActions.send(getStatesMessage);
  }, [service, wsActions]);

  const callService = useCallback((domain: string, serviceName: string, serviceData?: Record<string, any>) => {
    const callServiceMessage = service.callService(domain, serviceName, serviceData);
    wsActions.send(callServiceMessage);
  }, [service, wsActions]);

  const parseMessage = useCallback((message: string) => {
    return service.parseMessage(message);
  }, [service]);

  return {
    state: wsState,
    actions: {
      ...wsActions,
      sendAuth,
      subscribeToStates,
      subscribeToEvents,
      getStates,
      callService,
      parseMessage,
    },
    service,
  };
}; 