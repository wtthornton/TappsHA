# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-01-27-event-monitoring-system/spec.md

## Endpoints

### GET /api/v1/event-monitoring/status/{connectionId}

**Purpose:** Get real-time event processing status and performance metrics for a specific connection
**Parameters:** 
- `connectionId` (path): The ID of the Home Assistant connection
- `timeRange` (query): Time range for metrics (e.g., "1h", "24h", "7d")
**Response:** 
```json
{
  "success": true,
  "connectionId": 1,
  "eventProcessingStatus": {
    "isActive": true,
    "eventsPerMinute": 1250,
    "averageLatency": 85,
    "filteringEffectiveness": 0.72,
    "kafkaStatus": "healthy",
    "lastProcessedAt": "2025-01-27T15:30:00Z"
  },
  "performanceMetrics": {
    "totalEventsProcessed": 150000,
    "filteredEvents": 108000,
    "averageProcessingTime": 75,
    "kafkaThroughput": 1250
  }
}
```
**Errors:** 
- 404: Connection not found
- 500: Event processing service unavailable

### GET /api/v1/event-monitoring/analytics/{connectionId}

**Purpose:** Get detailed event analytics and filtering statistics
**Parameters:** 
- `connectionId` (path): The ID of the Home Assistant connection
- `startDate` (query): Start date for analytics (ISO 8601)
- `endDate` (query): End date for analytics (ISO 8601)
- `groupBy` (query): Grouping interval ("hour", "day", "week")
**Response:** 
```json
{
  "success": true,
  "connectionId": 1,
  "analytics": {
    "eventFrequency": [
      {
        "timestamp": "2025-01-27T15:00:00Z",
        "totalEvents": 1250,
        "filteredEvents": 900,
        "filteringRate": 0.72
      }
    ],
    "topEventTypes": [
      {
        "eventType": "state_changed",
        "count": 850,
        "filteredCount": 612
      }
    ],
    "filteringEffectiveness": {
      "averageRate": 0.72,
      "trend": "improving"
    }
  }
}
```
**Errors:** 
- 404: Connection not found
- 400: Invalid date range
- 500: Analytics service unavailable

### POST /api/v1/event-monitoring/filtering-rules

**Purpose:** Create a new event filtering rule
**Parameters:** 
- `connectionId` (body): The ID of the Home Assistant connection
- `ruleName` (body): Name of the filtering rule
- `ruleType` (body): Type of rule ("frequency", "pattern", "user_defined")
- `ruleConfig` (body): JSON configuration for the rule
- `priority` (body): Priority of the rule (optional, default 0)
**Response:** 
```json
{
  "success": true,
  "ruleId": 1,
  "ruleName": "High Frequency Filter",
  "ruleType": "frequency",
  "isActive": true,
  "createdAt": "2025-01-27T15:30:00Z"
}
```
**Errors:** 
- 400: Invalid rule configuration
- 404: Connection not found
- 409: Rule name already exists

### GET /api/v1/event-monitoring/filtering-rules/{connectionId}

**Purpose:** Get all filtering rules for a connection
**Parameters:** 
- `connectionId` (path): The ID of the Home Assistant connection
- `activeOnly` (query): Return only active rules (optional, default false)
**Response:** 
```json
{
  "success": true,
  "connectionId": 1,
  "rules": [
    {
      "id": 1,
      "ruleName": "High Frequency Filter",
      "ruleType": "frequency",
      "ruleConfig": {
        "maxEventsPerMinute": 10,
        "entityTypes": ["sensor", "binary_sensor"]
      },
      "isActive": true,
      "priority": 0,
      "createdAt": "2025-01-27T15:30:00Z"
    }
  ]
}
```
**Errors:** 
- 404: Connection not found

### PUT /api/v1/event-monitoring/filtering-rules/{ruleId}

**Purpose:** Update an existing filtering rule
**Parameters:** 
- `ruleId` (path): The ID of the filtering rule
- `ruleName` (body): Updated name (optional)
- `ruleConfig` (body): Updated configuration (optional)
- `isActive` (body): Active status (optional)
- `priority` (body): Priority (optional)
**Response:** 
```json
{
  "success": true,
  "ruleId": 1,
  "updatedAt": "2025-01-27T15:35:00Z"
}
```
**Errors:** 
- 404: Rule not found
- 400: Invalid configuration

### DELETE /api/v1/event-monitoring/filtering-rules/{ruleId}

**Purpose:** Delete a filtering rule
**Parameters:** 
- `ruleId` (path): The ID of the filtering rule
**Response:** 
```json
{
  "success": true,
  "message": "Filtering rule deleted successfully"
}
```
**Errors:** 
- 404: Rule not found

### GET /api/v1/event-monitoring/processing-batches/{connectionId}

**Purpose:** Get event processing batch information
**Parameters:** 
- `connectionId` (path): The ID of the Home Assistant connection
- `limit` (query): Number of batches to return (optional, default 50)
- `offset` (query): Pagination offset (optional, default 0)
**Response:** 
```json
{
  "success": true,
  "connectionId": 1,
  "batches": [
    {
      "id": 1,
      "batchId": "batch-2025-01-27-15-30-00",
      "totalEvents": 1250,
      "filteredEvents": 900,
      "processingTimeMs": 85,
      "kafkaTopic": "home-assistant-events",
      "kafkaPartition": 0,
      "createdAt": "2025-01-27T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```
**Errors:** 
- 404: Connection not found

### POST /api/v1/event-monitoring/start-processing/{connectionId}

**Purpose:** Start event processing for a connection
**Parameters:** 
- `connectionId` (path): The ID of the Home Assistant connection
**Response:** 
```json
{
  "success": true,
  "message": "Event processing started successfully",
  "startedAt": "2025-01-27T15:30:00Z"
}
```
**Errors:** 
- 404: Connection not found
- 409: Processing already active
- 500: Kafka service unavailable

### POST /api/v1/event-monitoring/stop-processing/{connectionId}

**Purpose:** Stop event processing for a connection
**Parameters:** 
- `connectionId` (path): The ID of the Home Assistant connection
**Response:** 
```json
{
  "success": true,
  "message": "Event processing stopped successfully",
  "stoppedAt": "2025-01-27T15:35:00Z"
}
```
**Errors:** 
- 404: Connection not found
- 409: Processing not active

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details if available"
  },
  "timestamp": "2025-01-27T15:30:00Z"
}
```

## Authentication

All endpoints require OAuth 2.1 authentication with valid user token. The user must have access to the specified connection.

## Rate Limiting

- Analytics endpoints: 100 requests per minute
- Rule management endpoints: 50 requests per minute
- Status endpoints: 200 requests per minute
- Processing control endpoints: 10 requests per minute 