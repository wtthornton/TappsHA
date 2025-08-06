import React from 'react';
import { useHomeAssistantWebSocket, type HomeAssistantWebSocketConfig } from '../services/api/home-assistant-websocket';

interface WebSocketStatusProps {
  config: HomeAssistantWebSocketConfig;
  onMessage?: (message: any) => void;
  onError?: (error: string) => void;
  onStateChange?: (states: any[]) => void;
  onEvent?: (event: any) => void;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  config,
  onMessage,
  onError,
  onStateChange,
  onEvent,
}) => {
  const { state, actions, service } = useHomeAssistantWebSocket(config);

  // Handle incoming messages
  React.useEffect(() => {
    if (state.lastMessage) {
      const parsedMessage = service.parseMessage(JSON.stringify(state.lastMessage.data));
      
      if (parsedMessage) {
        onMessage?.(parsedMessage);

        if (service.isErrorResponse(parsedMessage)) {
          const errorMessage = service.getErrorMessage(parsedMessage);
          onError?.(errorMessage || 'Unknown WebSocket error');
        } else if (parsedMessage.type === 'result' as any && parsedMessage.result) {
          // Handle different result types
          if (Array.isArray(parsedMessage.result)) {
            // States result
            onStateChange?.(parsedMessage.result);
          }
        } else if (parsedMessage.type === 'event' as any) {
          // Event subscription result
          onEvent?.(parsedMessage.data);
        }
      }
    }
  }, [state.lastMessage, service, onMessage, onError, onStateChange, onEvent]);

  // Auto-authenticate when connected
  React.useEffect(() => {
    if (state.isConnected && !state.error) {
      actions.sendAuth();
    }
  }, [state.isConnected, state.error, actions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      case 'reconnecting':
        return 'text-orange-600 bg-orange-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'reconnecting':
        return '🟠';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">WebSocket Status</h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon(state.connectionStatus)}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.connectionStatus)}`}>
            {state.connectionStatus.charAt(0).toUpperCase() + state.connectionStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Connection Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">URL:</span>
            <span className="ml-2 text-gray-600">{config.url}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Reconnect Attempts:</span>
            <span className="ml-2 text-gray-600">{state.reconnectAttempts}</span>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800 text-sm">{state.error}</span>
            </div>
            <button
              onClick={actions.clearError}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Clear Error
            </button>
          </div>
        )}

        {/* Connection Actions */}
        <div className="flex space-x-2">
          {!state.isConnected && !state.isConnecting && (
            <button
              onClick={actions.connect}
              disabled={state.isConnecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
          
          {state.isConnected && (
            <button
              onClick={actions.disconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Disconnect
            </button>
          )}

          {state.isReconnecting && (
            <button
              onClick={actions.disconnect}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Stop Reconnecting
            </button>
          )}
        </div>

        {/* Last Message */}
        {state.lastMessage && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-700 mb-2">Last Message:</div>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(state.lastMessage.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}; 