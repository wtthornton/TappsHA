import apiClient, {
  ConnectRequest,
  ConnectionResponse,
  ConnectionsResponse,
  ConnectionTestResponse,
  DisconnectResponse,
  EventsResponse,
  MetricsResponse,
} from './api-client';

export class HomeAssistantApiService {
  // Connect to Home Assistant instance
  async connect(request: ConnectRequest): Promise<ConnectionResponse> {
    return apiClient.post<ConnectionResponse>('/v1/home-assistant/connect', request);
  }

  // Get all connections
  async getConnections(page = 0, size = 20): Promise<ConnectionsResponse> {
    return apiClient.get<ConnectionsResponse>(`/v1/home-assistant/connections?page=${page}&size=${size}`);
  }

  // Test connection
  async testConnection(connectionId: string): Promise<ConnectionTestResponse> {
    return apiClient.post<ConnectionTestResponse>(`/v1/home-assistant/connections/${connectionId}/test`);
  }

  // Disconnect and remove connection
  async disconnect(connectionId: string): Promise<DisconnectResponse> {
    return apiClient.delete<DisconnectResponse>(`/v1/home-assistant/connections/${connectionId}`);
  }

  // Get connection events
  async getEvents(
    connectionId: string,
    limit = 100,
    offset = 0,
    eventType?: string,
    entityId?: string
  ): Promise<EventsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (eventType) params.append('eventType', eventType);
    if (entityId) params.append('entityId', entityId);
    
    return apiClient.get<EventsResponse>(`/v1/home-assistant/connections/${connectionId}/events?${params}`);
  }

  // Get connection metrics
  async getMetrics(connectionId: string, timeRange = '24h'): Promise<MetricsResponse> {
    return apiClient.get<MetricsResponse>(`/v1/home-assistant/connections/${connectionId}/metrics?timeRange=${timeRange}`);
  }

  // Get connection status
  async getConnectionStatus(connectionId: string): Promise<{ status: string; lastConnected: string; lastSeen: string }> {
    return apiClient.get<{ status: string; lastConnected: string; lastSeen: string }>(
      `/v1/home-assistant/connections/${connectionId}/status`
    );
  }
}

// Export singleton instance
export const homeAssistantApi = new HomeAssistantApiService();
export default homeAssistantApi; 