import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeAssistantApiService } from '../home-assistant';
import apiClient from '../api-client';

// Mock the API client
vi.mock('../api-client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('HomeAssistantService', () => {
  let homeAssistantService: HomeAssistantApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    homeAssistantService = new HomeAssistantApiService();
  });

  describe('connect', () => {
    it('should successfully connect to Home Assistant', async () => {
      const connectionData = {
        connectionName: 'Test Connection',
        url: 'http://localhost:8123',
        token: 'test-token',
      };

      const mockResponse = {
        data: {
          success: true,
          connectionId: '1',
          message: 'Connection established successfully',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await homeAssistantService.connect(connectionData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/home-assistant/connect', connectionData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle connection error', async () => {
      const connectionData = {
        connectionName: 'Test Connection',
        url: 'http://localhost:8123',
        token: 'invalid-token',
      };

      const mockError = new Error('Connection failed');
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(homeAssistantService.connect(connectionData)).rejects.toThrow('Connection failed');
      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/home-assistant/connect', connectionData);
    });
  });

  describe('getConnections', () => {
    it('should successfully get connections', async () => {
      const mockResponse = {
        data: {
          connections: [
            {
              id: '1',
              name: 'Test Connection',
              url: 'http://localhost:8123',
              status: 'connected',
              lastConnected: '2024-01-27T10:00:00Z',
            },
          ],
          totalElements: 1,
          totalPages: 1,
          currentPage: 0,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await homeAssistantService.getConnections();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/home-assistant/connections?page=0&size=20');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get connections error', async () => {
      const mockError = new Error('Failed to fetch connections');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(homeAssistantService.getConnections()).rejects.toThrow('Failed to fetch connections');
      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/home-assistant/connections?page=0&size=20');
    });
  });

  describe('getConnectionStatus', () => {
    it('should successfully get connection status', async () => {
      const mockResponse = {
        data: {
          status: 'connected',
          lastConnected: '2024-01-27T10:00:00Z',
          lastSeen: '2024-01-27T10:05:00Z',
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.getConnectionStatus(connectionId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/status`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get connection status error', async () => {
      const mockError = new Error('Failed to get connection status');
      mockApiClient.get.mockRejectedValue(mockError);

      const connectionId = '1';

      await expect(homeAssistantService.getConnectionStatus(connectionId)).rejects.toThrow('Failed to get connection status');
      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/status`);
    });
  });

  describe('disconnect', () => {
    it('should successfully disconnect from Home Assistant', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Connection disconnected successfully',
        },
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.disconnect(connectionId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle disconnect error', async () => {
      const mockError = new Error('Disconnect failed');
      mockApiClient.delete.mockRejectedValue(mockError);

      const connectionId = '1';

      await expect(homeAssistantService.disconnect(connectionId)).rejects.toThrow('Disconnect failed');
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}`);
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Connection test successful',
          details: {
            version: '2024.1.0',
            components: ['light', 'switch', 'sensor'],
          },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.testConnection(connectionId);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/test`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle test connection error', async () => {
      const mockError = new Error('Test connection failed');
      mockApiClient.post.mockRejectedValue(mockError);

      const connectionId = '1';

      await expect(homeAssistantService.testConnection(connectionId)).rejects.toThrow('Test connection failed');
      expect(mockApiClient.post).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/test`);
    });
  });

  describe('getEvents', () => {
    it('should successfully get events', async () => {
      const mockResponse = {
        data: {
          events: [
            {
              id: '1',
              eventType: 'state_changed',
              entityId: 'sensor.temperature',
              timestamp: '2024-01-27T10:00:00Z',
              data: {
                old_state: { state: '20' },
                new_state: { state: '21' },
              },
            },
          ],
          totalElements: 1,
          totalPages: 1,
          currentPage: 0,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.getEvents(connectionId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/events?limit=100&offset=0`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get events with filters', async () => {
      const mockResponse = {
        data: {
          events: [
            {
              id: '1',
              eventType: 'state_changed',
              entityId: 'light.living_room',
              timestamp: '2024-01-27T10:00:00Z',
              data: {
                old_state: { state: 'off' },
                new_state: { state: 'on' },
              },
            },
          ],
          totalElements: 1,
          totalPages: 1,
          currentPage: 0,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.getEvents(connectionId, 50, 10, 'state_changed', 'light.living_room');

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/events?limit=50&offset=10&eventType=state_changed&entityId=light.living_room`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get events error', async () => {
      const mockError = new Error('Failed to fetch events');
      mockApiClient.get.mockRejectedValue(mockError);

      const connectionId = '1';

      await expect(homeAssistantService.getEvents(connectionId)).rejects.toThrow('Failed to fetch events');
      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/events?limit=100&offset=0`);
    });
  });

  describe('getMetrics', () => {
    it('should successfully get metrics', async () => {
      const mockResponse = {
        data: {
          metrics: {
            totalEvents: 1000,
            eventsPerHour: 42,
            activeEntities: 50,
            uptime: '99.5%',
          },
          timeRange: '24h',
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.getMetrics(connectionId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/metrics?timeRange=24h`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get metrics with time range', async () => {
      const mockResponse = {
        data: {
          metrics: {
            totalEvents: 500,
            eventsPerHour: 21,
            activeEntities: 25,
            uptime: '98.2%',
          },
          timeRange: '7d',
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.getMetrics(connectionId, '7d');

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/metrics?timeRange=7d`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get metrics error', async () => {
      const mockError = new Error('Failed to fetch metrics');
      mockApiClient.get.mockRejectedValue(mockError);

      const connectionId = '1';

      await expect(homeAssistantService.getMetrics(connectionId)).rejects.toThrow('Failed to fetch metrics');
      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/metrics?timeRange=24h`);
    });
  });

  describe('getConnectionEvents', () => {
    it('should successfully get connection events', async () => {
      const mockResponse = {
        data: {
          events: [
            {
              id: '1',
              eventType: 'connection_established',
              timestamp: '2024-01-27T10:00:00Z',
              data: {
                connectionId: '1',
                url: 'http://localhost:8123',
              },
            },
          ],
          totalElements: 1,
          totalPages: 1,
          currentPage: 0,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const connectionId = '1';
      const result = await homeAssistantService.getEvents(connectionId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/events?limit=100&offset=0`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get connection events error', async () => {
      const mockError = new Error('Failed to fetch connection events');
      mockApiClient.get.mockRejectedValue(mockError);

      const connectionId = '1';

      await expect(homeAssistantService.getEvents(connectionId)).rejects.toThrow('Failed to fetch connection events');
      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/home-assistant/connections/${connectionId}/events?limit=100&offset=0`);
    });
  });
}); 