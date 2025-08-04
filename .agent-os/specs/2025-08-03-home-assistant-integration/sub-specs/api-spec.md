# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-03-home-assistant-integration/spec.md

## Endpoints

### POST /api/v1/home-assistant/connect

**Purpose:** Establish connection to Home Assistant instance with authentication and version detection
**Parameters:** 
- `url` (string, required): Home Assistant instance URL
- `token` (string, required): Authentication token
- `connectionName` (string, optional): User-friendly name for the connection
**Response:** 
```json
{
  "connectionId": "uuid",
  "status": "connected",
  "homeAssistantVersion": "2024.12.0",
  "supportedFeatures": ["api", "websocket", "events"],
  "connectionHealth": {
    "latency": 45,
    "lastSeen": "2025-08-03T18:44:00Z"
  }
}
```
**Errors:** 
- `400 Bad Request`: Invalid URL or token format
- `401 Unauthorized`: Invalid authentication token
- `404 Not Found`: Home Assistant instance not reachable
- `500 Internal Server Error`: Connection establishment failed

### GET /api/v1/home-assistant/connections

**Purpose:** Retrieve all configured Home Assistant connections with their status
**Parameters:** None
**Response:**
```json
{
  "connections": [
    {
      "connectionId": "uuid",
      "name": "Home Assistant Main",
      "url": "https://homeassistant.local",
      "status": "connected",
      "homeAssistantVersion": "2024.12.0",
      "lastConnected": "2025-08-03T18:44:00Z",
      "eventCount": 1250,
      "healthMetrics": {
        "latency": 45,
        "uptime": 99.8,
        "errorRate": 0.1
      }
    }
  ]
}
```

### GET /api/v1/home-assistant/connections/{connectionId}/status

**Purpose:** Get detailed status and health metrics for a specific connection
**Parameters:** `connectionId` (path parameter)
**Response:**
```json
{
  "connectionId": "uuid",
  "status": "connected",
  "homeAssistantVersion": "2024.12.0",
  "connectionHealth": {
    "latency": 45,
    "uptime": 99.8,
    "errorRate": 0.1,
    "lastSeen": "2025-08-03T18:44:00Z",
    "eventRate": 1250,
    "websocketStatus": "connected"
  },
  "performanceMetrics": {
    "cpuUsage": 15.2,
    "memoryUsage": 28.5,
    "eventProcessingLatency": 85
  }
}
```
**Errors:**
- `404 Not Found`: Connection not found

### DELETE /api/v1/home-assistant/connections/{connectionId}

**Purpose:** Disconnect and remove a Home Assistant connection
**Parameters:** `connectionId` (path parameter)
**Response:**
```json
{
  "connectionId": "uuid",
  "status": "disconnected",
  "message": "Connection successfully removed"
}
```
**Errors:**
- `404 Not Found`: Connection not found
- `500 Internal Server Error`: Failed to disconnect

### GET /api/v1/home-assistant/connections/{connectionId}/events

**Purpose:** Retrieve recent events from Home Assistant with pagination and filtering
**Parameters:** 
- `connectionId` (path parameter)
- `limit` (integer, optional): Number of events to return (default: 100)
- `offset` (integer, optional): Pagination offset (default: 0)
- `eventType` (string, optional): Filter by event type
- `entityId` (string, optional): Filter by entity ID
**Response:**
```json
{
  "events": [
    {
      "id": "event-uuid",
      "timestamp": "2025-08-03T18:44:00Z",
      "eventType": "state_changed",
      "entityId": "light.living_room",
      "oldState": "off",
      "newState": "on",
      "attributes": {
        "brightness": 255,
        "color_temp": 4000
      }
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### POST /api/v1/home-assistant/connections/{connectionId}/test

**Purpose:** Test connection to Home Assistant instance without establishing persistent connection
**Parameters:** `connectionId` (path parameter)
**Response:**
```json
{
  "connectionId": "uuid",
  "status": "test_successful",
  "homeAssistantVersion": "2024.12.0",
  "supportedFeatures": ["api", "websocket", "events"],
  "testResults": {
    "apiAccess": true,
    "websocketAccess": true,
    "eventSubscription": true,
    "latency": 45
  }
}
```
**Errors:**
- `400 Bad Request`: Connection test failed
- `404 Not Found`: Connection not found

### GET /api/v1/home-assistant/connections/{connectionId}/metrics

**Purpose:** Get performance and health metrics for a connection
**Parameters:** 
- `connectionId` (path parameter)
- `timeRange` (string, optional): Time range for metrics (1h, 24h, 7d, 30d)
**Response:**
```json
{
  "connectionId": "uuid",
  "timeRange": "24h",
  "metrics": {
    "eventCount": 1250,
    "averageLatency": 45,
    "uptime": 99.8,
    "errorRate": 0.1,
    "peakEventRate": 1500,
    "averageEventRate": 850
  },
  "performance": {
    "cpuUsage": 15.2,
    "memoryUsage": 28.5,
    "eventProcessingLatency": 85
  }
}
```

## WebSocket Endpoints

### WebSocket: /ws/home-assistant/events/{connectionId}

**Purpose:** Real-time event stream from Home Assistant connection
**Parameters:** `connectionId` (path parameter)
**Message Format:**
```json
{
  "type": "event",
  "timestamp": "2025-08-03T18:44:00Z",
  "eventType": "state_changed",
  "entityId": "light.living_room",
  "oldState": "off",
  "newState": "on",
  "attributes": {
    "brightness": 255,
    "color_temp": 4000
  }
}
```

### WebSocket: /ws/home-assistant/status/{connectionId}

**Purpose:** Real-time connection status and health metrics
**Parameters:** `connectionId` (path parameter)
**Message Format:**
```json
{
  "type": "status",
  "timestamp": "2025-08-03T18:44:00Z",
  "status": "connected",
  "health": {
    "latency": 45,
    "uptime": 99.8,
    "errorRate": 0.1,
    "eventRate": 1250
  }
}
```

## Error Response Format

All error responses follow this standard format:

```json
{
  "error": {
    "code": "CONNECTION_FAILED",
    "message": "Failed to establish connection to Home Assistant",
    "details": "Invalid authentication token provided",
    "timestamp": "2025-08-03T18:44:00Z",
    "requestId": "req-uuid"
  }
}
```

## Authentication

All endpoints require authentication using Spring Security with OAuth 2.1. The authentication token must be included in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

- API endpoints: 100 requests per minute per user
- WebSocket connections: 10 concurrent connections per user
- Event processing: 1000 events per minute per connection 