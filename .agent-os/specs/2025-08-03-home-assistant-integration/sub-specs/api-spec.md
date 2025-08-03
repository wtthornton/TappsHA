# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-03-home-assistant-integration/spec.md

## Endpoints

### GET /api/v1/home-assistant/connections

**Purpose:** Retrieve all Home Assistant connections and their status
**Parameters:** None
**Response:** List of connection objects with status information
**Errors:** 500 Internal Server Error

**Response Format:**
```json
{
  "connections": [
    {
      "id": 1,
      "name": "Home Assistant Main",
      "baseUrl": "http://192.168.1.86:8123",
      "isActive": true,
      "connectionStatus": "CONNECTED",
      "lastConnectedAt": "2025-08-03T14:30:00Z",
      "errorCount": 0,
      "lastErrorMessage": null
    }
  ]
}
```

### POST /api/v1/home-assistant/connections

**Purpose:** Create a new Home Assistant connection
**Parameters:** Connection configuration object
**Response:** Created connection object
**Errors:** 400 Bad Request (invalid configuration), 409 Conflict (duplicate connection)

**Request Format:**
```json
{
  "name": "Home Assistant Main",
  "baseUrl": "http://192.168.1.86:8123",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4YjY3NDllNGM4Y2E0NGY1YTQxN2ExZjdhMWZkYzlkOCIsImlhdCI6MTc1NDI1ODIwMywiZXhwIjoyMDY5NjE4MjAzfQ.GdMqoBnzUE_BCA5J8cMCPN_StpPR54xwoNw9ngO5acc"
}
```

### GET /api/v1/home-assistant/connections/{id}

**Purpose:** Retrieve specific connection details and health metrics
**Parameters:** connection_id (path parameter)
**Response:** Connection details with health metrics
**Errors:** 404 Not Found, 500 Internal Server Error

**Response Format:**
```json
{
  "id": 1,
  "name": "Home Assistant Main",
  "baseUrl": "http://192.168.1.86:8123",
  "isActive": true,
  "connectionStatus": "CONNECTED",
  "lastConnectedAt": "2025-08-03T14:30:00Z",
  "errorCount": 0,
  "healthMetrics": {
    "eventProcessingRate": 45.2,
    "averageResponseTime": 125.5,
    "uptimePercentage": 99.8,
    "lastEventProcessedAt": "2025-08-03T14:29:55Z"
  }
}
```

### PUT /api/v1/home-assistant/connections/{id}

**Purpose:** Update connection configuration
**Parameters:** connection_id (path parameter), updated configuration
**Response:** Updated connection object
**Errors:** 400 Bad Request, 404 Not Found, 500 Internal Server Error

### DELETE /api/v1/home-assistant/connections/{id}

**Purpose:** Remove a Home Assistant connection
**Parameters:** connection_id (path parameter)
**Response:** 204 No Content
**Errors:** 404 Not Found, 500 Internal Server Error

### POST /api/v1/home-assistant/connections/{id}/test

**Purpose:** Test connection to Home Assistant instance
**Parameters:** connection_id (path parameter)
**Response:** Connection test results
**Errors:** 404 Not Found, 500 Internal Server Error

**Response Format:**
```json
{
  "success": true,
  "message": "Connection successful",
  "details": {
    "apiVersion": "2023.12.0",
    "serverTime": "2025-08-03T14:30:00Z",
    "responseTime": 125.5
  }
}
```

### GET /api/v1/home-assistant/connections/{id}/devices

**Purpose:** Retrieve all devices from Home Assistant instance
**Parameters:** connection_id (path parameter), domain (optional query parameter)
**Response:** List of devices with their current states
**Errors:** 404 Not Found, 500 Internal Server Error

**Response Format:**
```json
{
  "devices": [
    {
      "entityId": "light.living_room",
      "friendlyName": "Living Room Light",
      "deviceClass": "light",
      "state": "on",
      "attributes": {
        "brightness": 255,
        "color_temp": 4000,
        "supported_features": 41
      },
      "lastChanged": "2025-08-03T14:25:30Z"
    }
  ]
}
```

### GET /api/v1/home-assistant/connections/{id}/events

**Purpose:** Retrieve recent events from Home Assistant instance
**Parameters:** connection_id (path parameter), limit (optional, default 100), event_type (optional)
**Response:** List of recent events
**Errors:** 404 Not Found, 500 Internal Server Error

**Response Format:**
```json
{
  "events": [
    {
      "eventType": "state_changed",
      "entityId": "light.living_room",
      "oldState": {
        "state": "off",
        "attributes": {}
      },
      "newState": {
        "state": "on",
        "attributes": {
          "brightness": 255
        }
      },
      "eventTime": "2025-08-03T14:25:30Z"
    }
  ]
}
```

### GET /api/v1/home-assistant/health

**Purpose:** Get overall health status of all Home Assistant connections
**Parameters:** None
**Response:** Health summary for all connections
**Errors:** 500 Internal Server Error

**Response Format:**
```json
{
  "status": "HEALTHY",
  "totalConnections": 2,
  "activeConnections": 2,
  "failedConnections": 0,
  "connections": [
    {
      "id": 1,
      "name": "Home Assistant Main",
      "status": "CONNECTED",
      "lastSeen": "2025-08-03T14:30:00Z"
    }
  ]
}
```

## Controllers

### HomeAssistantConnectionController
- **Purpose:** Manage Home Assistant connections
- **Actions:** CRUD operations for connections
- **Business Logic:** Connection validation, credential encryption, status monitoring
- **Error Handling:** Comprehensive exception handling with proper HTTP status codes

### HomeAssistantDeviceController
- **Purpose:** Retrieve device information from Home Assistant
- **Actions:** List devices, get device details, filter by domain
- **Business Logic:** Device state synchronization, attribute processing
- **Error Handling:** Handle connection failures and data parsing errors

### HomeAssistantEventController
- **Purpose:** Retrieve and process Home Assistant events
- **Actions:** List events, filter by type, get event details
- **Business Logic:** Event processing, data transformation, storage coordination
- **Error Handling:** Handle malformed events and processing failures

### HomeAssistantHealthController
- **Purpose:** Monitor connection health and system status
- **Actions:** Health checks, metrics collection, status reporting
- **Business Logic:** Health indicator aggregation, alert generation
- **Error Handling:** Graceful degradation when health checks fail

## Integration Points

### Home Assistant REST API
- **Base URL:** Configurable per connection
- **Authentication:** Long-lived access tokens
- **Endpoints:** `/api/states`, `/api/events`, `/api/services`
- **Rate Limiting:** Respect Home Assistant API limits

### Home Assistant WebSocket API
- **Connection:** WebSocket connection at `/api/websocket` for real-time events
- **Authentication:** Long-lived access token in auth message
- **Message Format:** JSON with `type` and `id` fields for correlation
- **Event Subscription:** `subscribe_events` command with optional `event_type` filter
- **State Changes:** Subscribe to `state_changed` events for real-time device updates
- **Heartbeat:** Ping/pong mechanism for connection health monitoring
- **Reconnection:** Automatic reconnection with exponential backoff
- **Error Handling:** Comprehensive error codes and message handling
- **Feature Support:** Coalesce messages for bulk event processing

### Home Assistant WebSocket API Details

#### Authentication Flow
1. **Connect:** Establish WebSocket connection to `/api/websocket`
2. **Auth Required:** Server sends `auth_required` message
3. **Authenticate:** Client sends auth message with access token
4. **Auth OK:** Server responds with `auth_ok` on success
5. **Feature Enablement:** Client can enable `coalesce_messages` feature
6. **Command Phase:** Begin sending commands and receiving events

#### Event Subscription Commands
```json
{
  "id": 18,
  "type": "subscribe_events",
  "event_type": "state_changed"
}
```

#### State Changed Event Format
```json
{
  "id": 18,
  "type": "event",
  "event": {
    "data": {
      "entity_id": "light.bed_light",
      "new_state": {
        "entity_id": "light.bed_light",
        "state": "on",
        "attributes": {
          "brightness": 180,
          "friendly_name": "Bed Light"
        },
        "last_changed": "2016-11-26T01:37:24.265390+00:00",
        "last_updated": "2016-11-26T01:37:24.265390+00:00"
      },
      "old_state": {
        "entity_id": "light.bed_light",
        "state": "off",
        "attributes": {
          "friendly_name": "Bed Light"
        },
        "last_changed": "2016-11-26T01:37:10.466994+00:00",
        "last_updated": "2016-11-26T01:37:10.466994+00:00"
      }
    },
    "event_type": "state_changed",
    "time_fired": "2016-11-26T01:37:24.265429+00:00"
  }
}
```

#### Heartbeat Mechanism
```json
{
  "id": 19,
  "type": "ping"
}
```
Server responds with:
```json
{
  "id": 19,
  "type": "pong"
}
```

### Database Integration
- **PostgreSQL:** Store connection metadata, device states, events
- **InfluxDB:** Store time-series event data for analytics
- **Redis:** Cache frequently accessed data and session management 