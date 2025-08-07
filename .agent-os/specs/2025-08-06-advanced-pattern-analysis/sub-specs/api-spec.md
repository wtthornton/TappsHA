# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-06-advanced-pattern-analysis/spec.md

## Endpoints

### GET /api/v1/patterns/analysis

**Purpose:** Retrieve pattern analysis results for specified entities and time ranges  
**Parameters:**
- `entity_id` (optional): Specific Home Assistant entity ID to analyze
- `analysis_type` (optional): Filter by analysis type (DAILY, WEEKLY, MONTHLY, SEASONAL, YEARLY)
- `pattern_type` (optional): Filter by pattern type (RECURRING, ANOMALY, CORRELATION, TREND)
- `start_date` (required): ISO 8601 start date for analysis range
- `end_date` (required): ISO 8601 end date for analysis range
- `page` (optional, default=0): Page number for pagination
- `size` (optional, default=20): Page size for pagination

**Response:**
```json
{
  "data": {
    "patterns": [
      {
        "id": "uuid",
        "analysisType": "DAILY",
        "entityId": "light.living_room",
        "patternType": "RECURRING",
        "timeRangeStart": "2025-08-01T00:00:00Z",
        "timeRangeEnd": "2025-08-07T23:59:59Z",
        "confidenceScore": 87.5,
        "patternData": {
          "frequency": "daily",
          "occurrences": 7,
          "avgTime": "18:30:00",
          "variance": "00:15:00"
        },
        "computedAt": "2025-08-06T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 0,
      "size": 20,
      "totalElements": 150,
      "totalPages": 8
    }
  },
  "timestamp": "2025-08-06T12:00:00Z"
}
```

**Errors:**
- 400: Invalid date range or parameters
- 401: Unauthorized
- 500: Internal server error

### POST /api/v1/patterns/analyze

**Purpose:** Trigger immediate pattern analysis for specific entities  
**Parameters:**
```json
{
  "entityIds": ["light.living_room", "switch.coffee_maker"],
  "analysisTypes": ["DAILY", "WEEKLY"],
  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2025-08-07T23:59:59Z",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "data": {
    "jobId": "uuid",
    "status": "PROCESSING",
    "estimatedCompletionTime": "2025-08-06T12:05:00Z",
    "message": "Pattern analysis job initiated"
  },
  "timestamp": "2025-08-06T12:00:00Z"
}
```

**Errors:**
- 400: Invalid request body
- 401: Unauthorized
- 429: Rate limit exceeded
- 500: Internal server error

### GET /api/v1/patterns/correlations

**Purpose:** Retrieve correlation analysis between entities  
**Parameters:**
- `primary_entity_id` (optional): Primary entity for correlation analysis
- `min_correlation` (optional, default=0.5): Minimum correlation coefficient
- `correlation_type` (optional): Filter by correlation type (TEMPORAL, CAUSAL, SEQUENTIAL)
- `start_date` (required): ISO 8601 start date
- `end_date` (required): ISO 8601 end date

**Response:**
```json
{
  "data": {
    "correlations": [
      {
        "id": "uuid",
        "primaryEntityId": "light.living_room",
        "correlatedEntityId": "motion.living_room",
        "correlationCoefficient": 0.8734,
        "correlationType": "TEMPORAL",
        "timeLagSeconds": 2,
        "sampleSize": 1500,
        "pValue": 0.0001,
        "interpretation": "Strong positive correlation with 2-second lag"
      }
    ]
  },
  "timestamp": "2025-08-06T12:00:00Z"
}
```

**Errors:**
- 400: Invalid parameters
- 401: Unauthorized
- 500: Internal server error

### GET /api/v1/patterns/anomalies

**Purpose:** Retrieve detected anomalies in behavioral patterns  
**Parameters:**
- `entity_id` (optional): Filter by entity
- `severity` (optional): Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `acknowledged` (optional): Filter by acknowledgment status
- `start_date` (required): ISO 8601 start date
- `end_date` (required): ISO 8601 end date
- `page` (optional, default=0): Page number
- `size` (optional, default=20): Page size

**Response:**
```json
{
  "data": {
    "anomalies": [
      {
        "id": "uuid",
        "entityId": "door.garage",
        "anomalyTimestamp": "2025-08-06T02:30:00Z",
        "anomalyType": "OUTLIER",
        "severity": "HIGH",
        "expectedValue": {
          "state": "closed",
          "timeRange": "00:00-05:00"
        },
        "actualValue": {
          "state": "open",
          "timestamp": "2025-08-06T02:30:00Z"
        },
        "deviationScore": 3.5,
        "contextData": {
          "dayOfWeek": "Tuesday",
          "usualPattern": "Never opens between midnight and 5 AM"
        },
        "isAcknowledged": false
      }
    ],
    "pagination": {
      "page": 0,
      "size": 20,
      "totalElements": 5,
      "totalPages": 1
    }
  },
  "timestamp": "2025-08-06T12:00:00Z"
}
```

**Errors:**
- 400: Invalid parameters
- 401: Unauthorized
- 500: Internal server error

### PUT /api/v1/patterns/anomalies/{id}/acknowledge

**Purpose:** Acknowledge an anomaly to mark it as reviewed  
**Parameters:**
- `id` (path): Anomaly ID to acknowledge

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "isAcknowledged": true,
    "acknowledgedBy": "user@example.com",
    "acknowledgedAt": "2025-08-06T12:00:00Z",
    "message": "Anomaly acknowledged successfully"
  },
  "timestamp": "2025-08-06T12:00:00Z"
}
```

**Errors:**
- 404: Anomaly not found
- 401: Unauthorized
- 500: Internal server error

### GET /api/v1/patterns/processing/status

**Purpose:** Get the status of pattern processing jobs  
**Parameters:**
- `processing_type` (optional): Filter by processing type
- `status` (optional): Filter by status (PENDING, PROCESSING, COMPLETED, FAILED)
- `limit` (optional, default=10): Number of recent jobs to return

**Response:**
```json
{
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "processingType": "BATCH_ANALYSIS",
        "timeDimension": "DAILY",
        "status": "COMPLETED",
        "startedAt": "2025-08-06T12:00:00Z",
        "completedAt": "2025-08-06T12:00:30Z",
        "eventsProcessed": 10000,
        "patternsDetected": 47,
        "anomaliesDetected": 3,
        "processingDurationMs": 30000
      }
    ]
  },
  "timestamp": "2025-08-06T12:00:00Z"
}
```

**Errors:**
- 401: Unauthorized
- 500: Internal server error

### WebSocket: /ws/patterns/updates

**Purpose:** Real-time updates for pattern analysis results and anomalies  
**Message Format:**
```json
{
  "type": "PATTERN_UPDATE",
  "data": {
    "updateType": "NEW_PATTERN|NEW_ANOMALY|PROCESSING_COMPLETE",
    "content": {
      // Pattern or anomaly data
    }
  },
  "timestamp": "2025-08-06T12:00:00Z"
}
```

## Controller Implementation

### PatternAnalysisController
```java
@RestController
@RequestMapping("/api/v1/patterns")
@RequiredArgsConstructor
public class PatternAnalysisController {
    private final PatternAnalysisService patternAnalysisService;
    private final CorrelationAnalysisService correlationService;
    private final AnomalyDetectionService anomalyService;
    
    @GetMapping("/analysis")
    public ResponseEntity<PatternAnalysisResponse> getPatternAnalysis(
        @RequestParam(required = false) String entityId,
        @RequestParam(required = false) AnalysisType analysisType,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        // Implementation
    }
    
    @PostMapping("/analyze")
    @RateLimited(requests = 10, duration = "1h")
    public ResponseEntity<AnalysisJobResponse> triggerAnalysis(
        @Valid @RequestBody AnalysisRequest request
    ) {
        // Implementation
    }
}
```

### WebSocket Handler
```java
@Component
@RequiredArgsConstructor
public class PatternWebSocketHandler {
    private final SimpMessagingTemplate messagingTemplate;
    
    public void broadcastPatternUpdate(PatternUpdate update) {
        messagingTemplate.convertAndSend("/topic/patterns/updates", update);
    }
    
    public void broadcastAnomalyAlert(AnomalyAlert alert) {
        messagingTemplate.convertAndSend("/topic/patterns/anomalies", alert);
    }
}
```

## Rate Limiting

- Pattern analysis queries: 100 requests per minute
- Trigger analysis: 10 requests per hour
- Correlation queries: 50 requests per minute
- Anomaly queries: 100 requests per minute
- WebSocket connections: 5 concurrent connections per user

## Authentication

All endpoints require JWT authentication with the following scopes:
- `patterns:read` - Read pattern analysis results
- `patterns:write` - Trigger new analysis jobs
- `anomalies:read` - Read anomaly data
- `anomalies:write` - Acknowledge anomalies