import apiClient from './api-client';
import type {
  ConnectRequest,
  ConnectionResponse,
  ConnectionsResponse,
  ConnectionTestResponse,
  DisconnectResponse,
  EventsResponse,
  MetricsResponse,
} from './api-client';

// API Response wrapper interface
interface ApiResponseWrapper<T> {
  data: T;
}

export class HomeAssistantApiService {
  // Connect to Home Assistant instance
  async connect(request: ConnectRequest): Promise<ConnectionResponse> {
    const response = await apiClient.post<ApiResponseWrapper<ConnectionResponse>>('/v1/home-assistant/connect', request);
    return response.data;
  }

  // Get all connections
  async getConnections(page = 0, size = 20): Promise<ConnectionsResponse> {
    const response = await apiClient.get<ApiResponseWrapper<ConnectionsResponse>>(`/v1/home-assistant/connections?page=${page}&size=${size}`);
    return response.data;
  }

  // Test connection
  async testConnection(connectionId: string): Promise<ConnectionTestResponse> {
    const response = await apiClient.post<ApiResponseWrapper<ConnectionTestResponse>>(`/v1/home-assistant/connections/${connectionId}/test`);
    return response.data;
  }

  // Disconnect and remove connection
  async disconnect(connectionId: string): Promise<DisconnectResponse> {
    const response = await apiClient.delete<ApiResponseWrapper<DisconnectResponse>>(`/v1/home-assistant/connections/${connectionId}`);
    return response.data;
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
    
    const response = await apiClient.get<ApiResponseWrapper<EventsResponse>>(`/v1/home-assistant/connections/${connectionId}/events?${params}`);
    return response.data;
  }

  // Get connection metrics
  async getMetrics(connectionId: string, timeRange = '24h'): Promise<MetricsResponse> {
    const response = await apiClient.get<ApiResponseWrapper<MetricsResponse>>(`/v1/home-assistant/connections/${connectionId}/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  // Get connection status
  async getConnectionStatus(connectionId: string): Promise<{ status: string; lastConnected: string; lastSeen: string }> {
    const response = await apiClient.get<ApiResponseWrapper<{ status: string; lastConnected: string; lastSeen: string }>>(
      `/v1/home-assistant/connections/${connectionId}/status`
    );
    return response.data;
  }
}

// Export singleton instance
export const homeAssistantApi = new HomeAssistantApiService();
export default homeAssistantApi; 