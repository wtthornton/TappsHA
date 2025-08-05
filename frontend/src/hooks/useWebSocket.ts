import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  lastMessage: WebSocketMessage | null;
  error: string | null;
  reconnectAttempts: number;
}

export interface WebSocketActions {
  connect: () => void;
  disconnect: () => void;
  send: (message: WebSocketMessage) => void;
  clearError: () => void;
}

const DEFAULT_CONFIG: Partial<WebSocketConfig> = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  heartbeatMessage: JSON.stringify({ type: 'ping', data: null }),
};

export const useWebSocket = (config: WebSocketConfig): [WebSocketState, WebSocketActions] => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    connectionStatus: 'disconnected',
    lastMessage: null,
    error: null,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    if (mergedConfig.heartbeatInterval && mergedConfig.heartbeatMessage) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(mergedConfig.heartbeatMessage!);
        }
      }, mergedConfig.heartbeatInterval);
    }
  }, [mergedConfig.heartbeatInterval, mergedConfig.heartbeatMessage]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const processMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        if (message) {
          wsRef.current.send(JSON.stringify(message));
        }
      }
    }
  }, []);

  const handleOpen = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      connectionStatus: 'connected',
      error: null,
      reconnectAttempts: 0,
    }));
    reconnectAttemptsRef.current = 0;
    startHeartbeat();
    processMessageQueue();
  }, [startHeartbeat, processMessageQueue]);

  const handleClose = useCallback((event: CloseEvent) => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionStatus: 'disconnected',
      error: event.reason || 'Connection closed',
    }));
    stopHeartbeat();

    // Attempt to reconnect if not manually disconnected
    if (!isManualDisconnectRef.current && reconnectAttemptsRef.current < (mergedConfig.maxReconnectAttempts || 5)) {
      setState(prev => ({
        ...prev,
        isReconnecting: true,
        connectionStatus: 'reconnecting',
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
      reconnectAttemptsRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, mergedConfig.reconnectInterval);
    }
  }, [stopHeartbeat, mergedConfig.maxReconnectAttempts, mergedConfig.reconnectInterval]);

  const handleError = useCallback((error: Event) => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionStatus: 'error',
      error: 'WebSocket error occurred',
    }));
    stopHeartbeat();
  }, [stopHeartbeat]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = {
        type: 'message',
        data: JSON.parse(event.data),
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        lastMessage: message,
      }));
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    isManualDisconnectRef.current = false;
    setState(prev => ({
      ...prev,
      isConnecting: true,
      connectionStatus: 'connecting',
      error: null,
    }));

    try {
      wsRef.current = new WebSocket(config.url, config.protocols);
      wsRef.current.onopen = handleOpen;
      wsRef.current.onclose = handleClose;
      wsRef.current.onerror = handleError;
      wsRef.current.onmessage = handleMessage;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        connectionStatus: 'error',
        error: 'Failed to create WebSocket connection',
      }));
    }
  }, [config.url, config.protocols, handleOpen, handleClose, handleError, handleMessage]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    clearTimers();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      connectionStatus: 'disconnected',
      error: null,
      reconnectAttempts: 0,
    }));
  }, [clearTimers]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Queue message for later if not connected
      messageQueueRef.current.push(message);
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return [state, { connect, disconnect, send, clearError }];
}; 