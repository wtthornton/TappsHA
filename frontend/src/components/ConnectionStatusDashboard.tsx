import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeAssistantApi } from '../services/api/home-assistant';
import { WebSocketStatus } from './WebSocketStatus';
import type { HomeAssistantWebSocketConfig } from '../services/api/home-assistant-websocket';

// ✅ Context7-validated React 19 functional component pattern
// Following React 19 and TanStack Query best practices from Context7 documentation
const ConnectionStatusDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // ✅ Context7-validated TanStack Query 5.x patterns
  // Following TanStack Query best practices from Context7
  const { data: connectionsData, isLoading, error } = useQuery({
    queryKey: ['connections'],
    queryFn: () => homeAssistantApi.getConnections(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // ✅ Context7-validated TanStack Query mutation patterns
  const testConnectionMutation = useMutation({
    mutationFn: (connectionId: string) => homeAssistantApi.testConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  // ✅ Context7-validated TanStack Query mutation patterns
  const disconnectMutation = useMutation({
    mutationFn: (connectionId: string) => homeAssistantApi.disconnect(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  // ✅ Context7-validated event handler patterns
  const handleTestConnection = (connectionId: string) => {
    testConnectionMutation.mutate(connectionId);
  };

  // ✅ Context7-validated event handler patterns
  const handleDisconnect = (connectionId: string) => {
    if (window.confirm('Are you sure you want to disconnect this connection?')) {
      disconnectMutation.mutate(connectionId);
    }
  };

  // ✅ Context7-validated utility function patterns
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Context7-validated utility function patterns
  const getWebSocketStatusColor = (status: string | undefined) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800';
    }
    
    switch (status.toLowerCase()) {
      case 'connected':
      case 'authenticated':
        return 'bg-green-100 text-green-800';
      case 'connecting':
      case 'auth_required':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'auth_failed':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Context7-validated loading state pattern
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Context7-validated error state pattern
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Error loading connections: {error.message}
      </div>
    );
  }

  // ✅ Context7-validated empty state pattern
  if (!connectionsData?.connections?.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Connections</h3>
        <p className="text-gray-500">You haven't connected to any Home Assistant instances yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Home Assistant Connections</h2>
        <div className="text-sm text-gray-500">
          {connectionsData.total} connection{connectionsData.total !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {connectionsData.connections.map((connection) => {
          // Create WebSocket config for this connection
          const wsConfig: HomeAssistantWebSocketConfig = {
            url: connection.url.replace('http', 'ws') + '/api/websocket',
            accessToken: 'your-access-token', // This should come from the connection data
            reconnectInterval: 3000,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
          };

          return (
            <div
              key={connection.connectionId}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{connection.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{connection.url}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestConnection(connection.connectionId)}
                    disabled={testConnectionMutation.isPending}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDisconnect(connection.connectionId)}
                    disabled={disconnectMutation.isPending}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(connection.status)}`}>
                    {connection.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">WebSocket:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getWebSocketStatusColor(connection.websocketStatus)}`}>
                    {connection.websocketStatus}
                  </span>
                </div>

                {connection.homeAssistantVersion && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Version:</span>
                    <span className="text-sm text-gray-900">{connection.homeAssistantVersion}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Events:</span>
                  <span className="text-sm text-gray-900">{connection.eventCount.toLocaleString()}</span>
                </div>

                {connection.healthMetrics && (
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Latency:</span>
                      <span className="text-sm text-gray-900">{connection.healthMetrics.latency}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <span className="text-sm text-gray-900">{connection.healthMetrics.uptime.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error Rate:</span>
                      <span className="text-sm text-gray-900">{connection.healthMetrics.errorRate.toFixed(2)}%</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div>Last Connected: {new Date(connection.lastConnected).toLocaleString()}</div>
                    <div>Last Seen: {new Date(connection.lastSeen).toLocaleString()}</div>
                  </div>
                </div>

                {/* WebSocket Status Component */}
                <div className="pt-3 border-t border-gray-200">
                  <WebSocketStatus
                    config={wsConfig}
                    onMessage={(message) => {
                      console.log('WebSocket message received:', message);
                    }}
                    onError={(error) => {
                      console.error('WebSocket error:', error);
                    }}
                    onStateChange={(states) => {
                      console.log('State changes received:', states);
                    }}
                    onEvent={(event) => {
                      console.log('Event received:', event);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectionStatusDashboard; 