# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-05-ai-suggestion-engine/spec.md

## REST API Endpoints

### GET /api/v1/ai-suggestions

**Purpose:** Retrieve paginated list of AI suggestions for authenticated user
**Parameters:** 
- `page` (optional): Page number for pagination (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `status` (optional): Filter by suggestion status (PENDING, APPROVED, REJECTED, IMPLEMENTED)
- `connectionId` (optional): Filter by Home Assistant connection ID

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "connectionId": 1,
      "suggestionType": "AUTOMATION_OPTIMIZATION",
      "title": "Optimize Living Room Lighting Schedule",
      "description": "Adjust lighting automation based on detected usage patterns",
      "automationConfig": { "trigger": {...}, "action": {...} },
      "confidenceScore": 0.89,
      "status": "PENDING",
      "createdAt": "2025-08-05T10:30:00Z",
      "processedAt": null
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 15,
    "totalPages": 1
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User lacks permission to access suggestions
- `400 Bad Request`: Invalid query parameters

### POST /api/v1/ai-suggestions/{suggestionId}/approve

**Purpose:** Approve an AI suggestion for implementation
**Parameters:** 
- `suggestionId` (path): ID of the suggestion to approve
- `reason` (body, optional): User-provided reason for approval

**Request Body:**
```json
{
  "reason": "This optimization aligns with my evening routine preferences"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Suggestion approved successfully",
  "implementationStatus": "QUEUED",
  "estimatedImplementationTime": "2025-08-05T11:00:00Z"
}
```

**Errors:**
- `404 Not Found`: Suggestion not found or not accessible by user
- `409 Conflict`: Suggestion already processed (approved/rejected)
- `422 Unprocessable Entity`: Suggestion cannot be implemented due to validation errors

### POST /api/v1/ai-suggestions/{suggestionId}/reject

**Purpose:** Reject an AI suggestion
**Parameters:**
- `suggestionId` (path): ID of the suggestion to reject
- `reason` (body, required): User-provided reason for rejection

**Request Body:**
```json
{
  "reason": "This change would interfere with my work schedule"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Suggestion rejected successfully",
  "learningUpdate": "Feedback recorded for model improvement"
}
```

**Errors:**
- `404 Not Found`: Suggestion not found or not accessible by user
- `409 Conflict`: Suggestion already processed
- `400 Bad Request`: Missing or invalid rejection reason

### GET /api/v1/ai-suggestions/batch-status

**Purpose:** Get current batch processing status and history
**Parameters:**
- `limit` (optional): Number of recent batches to return (default: 10, max: 50)

**Response:**
```json
{
  "currentBatch": {
    "batchId": "batch-2025-08-05-143000",
    "status": "RUNNING",
    "startTime": "2025-08-05T14:30:00Z",
    "suggestionsGenerated": 0,
    "estimatedCompletion": "2025-08-05T14:45:00Z"
  },
  "recentBatches": [
    {
      "batchId": "batch-2025-08-05-083000",
      "status": "COMPLETED",
      "startTime": "2025-08-05T08:30:00Z",
      "endTime": "2025-08-05T08:42:00Z",
      "suggestionsGenerated": 7,
      "errorsCount": 0
    }
  ]
}
```

**Errors:**
- `401 Unauthorized`: Invalid authentication
- `500 Internal Server Error`: Unable to retrieve batch status

### POST /api/v1/ai-suggestions/{suggestionId}/feedback

**Purpose:** Submit feedback on implemented suggestion effectiveness
**Parameters:**
- `suggestionId` (path): ID of the implemented suggestion
- `rating` (body, required): Effectiveness rating (1-5)
- `comments` (body, optional): User feedback comments

**Request Body:**
```json
{
  "effectivenessRating": 4,
  "userComments": "Works well but could be more responsive to weather changes",
  "automationPerformanceData": {
    "executionCount": 15,
    "failureCount": 0,
    "averageResponseTime": "1.2s"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback recorded successfully",
  "feedbackId": 123
}
```

**Errors:**
- `404 Not Found`: Suggestion not found or not implemented
- `400 Bad Request`: Invalid rating or missing required fields

## WebSocket API

### Connection Endpoint: /ws/ai-suggestions

**Purpose:** Real-time notifications for suggestion updates and batch processing status

### Message Types

#### Suggestion Status Update
```json
{
  "type": "SUGGESTION_STATUS_UPDATE",
  "data": {
    "suggestionId": 1,
    "oldStatus": "PENDING",
    "newStatus": "IMPLEMENTED",
    "timestamp": "2025-08-05T15:00:00Z",
    "message": "Automation suggestion has been successfully implemented"
  }
}
```

#### New Suggestions Available
```json
{
  "type": "NEW_SUGGESTIONS",
  "data": {
    "batchId": "batch-2025-08-05-143000",
    "suggestionCount": 5,
    "timestamp": "2025-08-05T14:45:00Z",
    "connectionIds": [1, 2],
    "message": "5 new automation suggestions are ready for review"
  }
}
```

#### Batch Processing Status
```json
{
  "type": "BATCH_STATUS_UPDATE",
  "data": {
    "batchId": "batch-2025-08-05-143000",
    "status": "COMPLETED",
    "progress": 100,
    "suggestionsGenerated": 7,
    "timestamp": "2025-08-05T14:45:00Z"
  }
}
```

#### Implementation Progress
```json
{
  "type": "IMPLEMENTATION_PROGRESS",
  "data": {
    "suggestionId": 1,
    "progress": 75,
    "currentStep": "Validating automation configuration",
    "estimatedCompletion": "2025-08-05T15:05:00Z"
  }
}
```

## Controller Implementation

### AISuggestionController
- **Primary controller for REST API endpoints**
- **Business Logic**: Suggestion retrieval, approval/rejection processing, feedback collection
- **Error Handling**: Comprehensive exception handling with proper HTTP status codes
- **Security**: JWT authentication and user authorization validation
- **Rate Limiting**: API rate limiting to prevent abuse

### AISuggestionWebSocketController
- **WebSocket message broadcasting for real-time updates**
- **Business Logic**: Connection management, message routing, subscription handling
- **Error Handling**: WebSocket-specific error handling and reconnection support
- **Security**: WebSocket authentication and session management

## Integration Points

### Pattern Analysis Service Integration
- **Dependency**: REST API calls to Advanced Pattern Analysis service for behavioral data
- **Data Flow**: Batch processor retrieves pattern data as input for suggestion generation
- **Error Handling**: Graceful degradation when pattern analysis is unavailable

### Home Assistant API Integration
- **Implementation**: Direct Home Assistant API calls for automation deployment
- **Validation**: Pre-implementation validation of automation configurations
- **Rollback**: Automated rollback capability for failed implementations

### AI Model Integration
- **Local Processing**: TensorFlow Lite integration for basic pattern classification
- **Cloud Processing**: OpenAI API integration for complex suggestion generation
- **Fallback Strategy**: Graceful fallback between local and cloud processing