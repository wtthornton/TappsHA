# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-01-27-autonomous-management/spec.md

## Endpoints

### Automation Management Endpoints

#### GET /api/v1/automations
**Purpose:** Retrieve all automations with lifecycle state and performance metrics
**Parameters:** 
- `page` (optional): Page number for pagination
- `size` (optional): Page size (default: 20, max: 100)
- `state` (optional): Filter by lifecycle state (ACTIVE, INACTIVE, PENDING, RETIRED)
- `performance_min` (optional): Minimum performance score filter
- `sort_by` (optional): Sort field (name, performance_score, last_execution_time)
- `sort_order` (optional): Sort order (ASC, DESC)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "homeAssistantAutomationId": "string",
      "name": "string",
      "description": "string",
      "lifecycleState": "ACTIVE",
      "performanceScore": 85.5,
      "lastExecutionTime": "2025-01-27T10:00:00Z",
      "executionCount": 150,
      "successRate": 95.2,
      "averageExecutionTimeMs": 250,
      "createdAt": "2025-01-27T10:00:00Z",
      "updatedAt": "2025-01-27T10:00:00Z",
      "version": 1,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Errors:** 400 (Invalid parameters), 401 (Unauthorized), 500 (Internal server error)

#### GET /api/v1/automations/{id}
**Purpose:** Retrieve specific automation details with full lifecycle history
**Parameters:** `id` (path): Automation UUID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "homeAssistantAutomationId": "string",
    "name": "string",
    "description": "string",
    "lifecycleState": "ACTIVE",
    "performanceScore": 85.5,
    "lastExecutionTime": "2025-01-27T10:00:00Z",
    "executionCount": 150,
    "successRate": 95.2,
    "averageExecutionTimeMs": 250,
    "createdAt": "2025-01-27T10:00:00Z",
    "updatedAt": "2025-01-27T10:00:00Z",
    "version": 1,
    "isActive": true,
    "lifecycleHistory": [
      {
        "id": "uuid",
        "previousState": "PENDING",
        "newState": "ACTIVE",
        "changeReason": "string",
        "changedAt": "2025-01-27T10:00:00Z",
        "aiReasoning": "string",
        "userApprovalRequired": false,
        "approvedBy": "uuid",
        "approvedAt": "2025-01-27T10:00:00Z"
      }
    ]
  }
}
```

**Errors:** 404 (Automation not found), 401 (Unauthorized), 500 (Internal server error)

#### POST /api/v1/automations
**Purpose:** Create new automation with AI assistance and approval workflow
**Parameters:** None

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "trigger": {
    "platform": "state",
    "entityId": "binary_sensor.motion",
    "to": "on"
  },
  "action": {
    "service": "light.turn_on",
    "target": {
      "entityId": "light.living_room"
    }
  },
  "aiAssisted": true,
  "requireApproval": true
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "homeAssistantAutomationId": "string",
    "name": "string",
    "lifecycleState": "PENDING",
    "approvalWorkflowId": "uuid",
    "aiReasoning": "string",
    "confidenceScore": 85.5,
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

**Errors:** 400 (Invalid request), 401 (Unauthorized), 422 (Validation error), 500 (Internal server error)

#### PUT /api/v1/automations/{id}
**Purpose:** Modify existing automation with approval workflow
**Parameters:** `id` (path): Automation UUID

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "trigger": {
    "platform": "state",
    "entityId": "binary_sensor.motion",
    "to": "on"
  },
  "action": {
    "service": "light.turn_on",
    "target": {
      "entityId": "light.living_room"
    }
  },
  "aiAssisted": true,
  "requireApproval": true,
  "modificationReason": "string"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "approvalWorkflowId": "uuid",
    "aiReasoning": "string",
    "confidenceScore": 85.5,
    "status": "PENDING_APPROVAL"
  }
}
```

**Errors:** 404 (Automation not found), 400 (Invalid request), 401 (Unauthorized), 422 (Validation error), 500 (Internal server error)

#### DELETE /api/v1/automations/{id}
**Purpose:** Retire automation with approval workflow
**Parameters:** `id` (path): Automation UUID

**Request Body:**
```json
{
  "retirementReason": "string",
  "aiAssisted": true,
  "requireApproval": true
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "approvalWorkflowId": "uuid",
    "aiReasoning": "string",
    "confidenceScore": 85.5,
    "status": "PENDING_APPROVAL"
  }
}
```

**Errors:** 404 (Automation not found), 400 (Invalid request), 401 (Unauthorized), 500 (Internal server error)

### Approval Workflow Endpoints

#### GET /api/v1/approval-workflows
**Purpose:** Retrieve pending approval workflows
**Parameters:**
- `page` (optional): Page number for pagination
- `size` (optional): Page size (default: 20, max: 100)
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `priority` (optional): Filter by priority (LOW, NORMAL, HIGH, CRITICAL)
- `risk_level` (optional): Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "automationId": "uuid",
      "workflowType": "CREATION",
      "status": "PENDING",
      "priority": "NORMAL",
      "riskLevel": "LOW",
      "description": "string",
      "aiReasoning": "string",
      "proposedChanges": {},
      "createdAt": "2025-01-27T10:00:00Z",
      "expiresAt": "2025-01-28T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3
  }
}
```

**Errors:** 400 (Invalid parameters), 401 (Unauthorized), 500 (Internal server error)

#### GET /api/v1/approval-workflows/{id}
**Purpose:** Retrieve specific approval workflow details
**Parameters:** `id` (path): Workflow UUID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "automationId": "uuid",
    "workflowType": "CREATION",
    "status": "PENDING",
    "priority": "NORMAL",
    "riskLevel": "LOW",
    "description": "string",
    "aiReasoning": "string",
    "proposedChanges": {},
    "createdAt": "2025-01-27T10:00:00Z",
    "expiresAt": "2025-01-28T10:00:00Z",
    "approvers": [
      {
        "id": "uuid",
        "approverId": "uuid",
        "approvalLevel": 1,
        "status": "PENDING",
        "comments": "string"
      }
    ]
  }
}
```

**Errors:** 404 (Workflow not found), 401 (Unauthorized), 500 (Internal server error)

#### POST /api/v1/approval-workflows/{id}/approve
**Purpose:** Approve specific workflow
**Parameters:** `id` (path): Workflow UUID

**Request Body:**
```json
{
  "comments": "string",
  "approvalLevel": 1
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "approvedAt": "2025-01-27T10:00:00Z",
    "automationId": "uuid",
    "result": "AUTOMATION_CREATED"
  }
}
```

**Errors:** 404 (Workflow not found), 400 (Invalid request), 401 (Unauthorized), 409 (Already approved/rejected), 500 (Internal server error)

#### POST /api/v1/approval-workflows/{id}/reject
**Purpose:** Reject specific workflow
**Parameters:** `id` (path): Workflow UUID

**Request Body:**
```json
{
  "rejectionReason": "string",
  "approvalLevel": 1
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "REJECTED",
    "rejectedAt": "2025-01-27T10:00:00Z",
    "rejectionReason": "string"
  }
}
```

**Errors:** 404 (Workflow not found), 400 (Invalid request), 401 (Unauthorized), 409 (Already approved/rejected), 500 (Internal server error)

### Backup and Rollback Endpoints

#### GET /api/v1/automations/{id}/backups
**Purpose:** Retrieve automation backups
**Parameters:** `id` (path): Automation UUID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "automationId": "uuid",
      "backupName": "string",
      "backupType": "AUTOMATIC",
      "configurationSnapshot": {},
      "metadata": {},
      "createdAt": "2025-01-27T10:00:00Z",
      "isActive": true,
      "retentionDays": 30
    }
  ]
}
```

**Errors:** 404 (Automation not found), 401 (Unauthorized), 500 (Internal server error)

#### POST /api/v1/automations/{id}/backup
**Purpose:** Create manual backup of automation
**Parameters:** `id` (path): Automation UUID

**Request Body:**
```json
{
  "backupName": "string",
  "backupType": "MANUAL"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "automationId": "uuid",
    "backupName": "string",
    "backupType": "MANUAL",
    "createdAt": "2025-01-27T10:00:00Z",
    "status": "COMPLETED"
  }
}
```

**Errors:** 404 (Automation not found), 400 (Invalid request), 401 (Unauthorized), 500 (Internal server error)

#### POST /api/v1/automations/{id}/rollback
**Purpose:** Rollback automation to previous state
**Parameters:** `id` (path): Automation UUID

**Request Body:**
```json
{
  "backupId": "uuid",
  "rollbackReason": "string",
  "rollbackType": "MANUAL"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "automationId": "uuid",
    "backupId": "uuid",
    "rollbackReason": "string",
    "rollbackType": "MANUAL",
    "status": "IN_PROGRESS",
    "initiatedAt": "2025-01-27T10:00:00Z"
  }
}
```

**Errors:** 404 (Automation not found), 400 (Invalid request), 401 (Unauthorized), 500 (Internal server error)

### Audit Trail Endpoints

#### GET /api/v1/automations/{id}/audit-trail
**Purpose:** Retrieve automation audit trail
**Parameters:** 
- `id` (path): Automation UUID
- `page` (optional): Page number for pagination
- `size` (optional): Page size (default: 20, max: 100)
- `action_type` (optional): Filter by action type
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "automationId": "uuid",
      "actionType": "CREATE",
      "actionDescription": "string",
      "beforeState": {},
      "afterState": {},
      "aiReasoning": "string",
      "userId": "uuid",
      "timestamp": "2025-01-27T10:00:00Z",
      "ipAddress": "string",
      "userAgent": "string",
      "sessionId": "string",
      "cryptographicSignature": "string"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

**Errors:** 404 (Automation not found), 400 (Invalid parameters), 401 (Unauthorized), 500 (Internal server error)

#### GET /api/v1/ai-decisions
**Purpose:** Retrieve AI decision audit trail
**Parameters:**
- `page` (optional): Page number for pagination
- `size` (optional): Page size (default: 20, max: 100)
- `decision_type` (optional): Filter by decision type
- `confidence_min` (optional): Minimum confidence score filter
- `user_feedback` (optional): Filter by user feedback
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "automationId": "uuid",
      "decisionType": "SUGGESTION",
      "decisionDescription": "string",
      "aiModelVersion": "string",
      "confidenceScore": 85.5,
      "inputData": {},
      "outputData": {},
      "reasoningExplanation": "string",
      "userFeedback": "APPROVED",
      "createdAt": "2025-01-27T10:00:00Z",
      "cryptographicSignature": "string"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3
  }
}
```

**Errors:** 400 (Invalid parameters), 401 (Unauthorized), 500 (Internal server error)

### Safety Configuration Endpoints

#### GET /api/v1/safety-configuration
**Purpose:** Retrieve user safety configuration
**Parameters:** None

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "automationCreationApprovalRequired": true,
    "automationModificationApprovalRequired": true,
    "automationDeletionApprovalRequired": true,
    "maxAutomationsPerDay": 10,
    "maxAutomationsPerWeek": 50,
    "riskThresholdHigh": 0.8,
    "riskThresholdMedium": 0.6,
    "emergencyStopEnabled": true,
    "auditTrailEnabled": true,
    "backupRetentionDays": 30,
    "createdAt": "2025-01-27T10:00:00Z",
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

**Errors:** 401 (Unauthorized), 500 (Internal server error)

#### PUT /api/v1/safety-configuration
**Purpose:** Update user safety configuration
**Parameters:** None

**Request Body:**
```json
{
  "automationCreationApprovalRequired": true,
  "automationModificationApprovalRequired": true,
  "automationDeletionApprovalRequired": true,
  "maxAutomationsPerDay": 10,
  "maxAutomationsPerWeek": 50,
  "riskThresholdHigh": 0.8,
  "riskThresholdMedium": 0.6,
  "emergencyStopEnabled": true,
  "auditTrailEnabled": true,
  "backupRetentionDays": 30
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "automationCreationApprovalRequired": true,
    "automationModificationApprovalRequired": true,
    "automationDeletionApprovalRequired": true,
    "maxAutomationsPerDay": 10,
    "maxAutomationsPerWeek": 50,
    "riskThresholdHigh": 0.8,
    "riskThresholdMedium": 0.6,
    "emergencyStopEnabled": true,
    "auditTrailEnabled": true,
    "backupRetentionDays": 30,
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

**Errors:** 400 (Invalid request), 401 (Unauthorized), 422 (Validation error), 500 (Internal server error)

#### POST /api/v1/emergency-stop
**Purpose:** Activate emergency stop for all AI features
**Parameters:** None

**Request Body:**
```json
{
  "reason": "string",
  "disableAllAiFeatures": true
}
```

**Response:**
```json
{
  "data": {
    "status": "EMERGENCY_STOP_ACTIVATED",
    "activatedAt": "2025-01-27T10:00:00Z",
    "reason": "string",
    "affectedAutomations": 5,
    "rollbackOperations": 3
  }
}
```

**Errors:** 400 (Invalid request), 401 (Unauthorized), 500 (Internal server error)

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    },
    "timestamp": "2025-01-27T10:00:00Z",
    "requestId": "uuid"
  }
}
```

## Authentication and Authorization

All endpoints require authentication via OAuth 2.1 Bearer token:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **AI-assisted endpoints**: 20 requests per minute per user
- **Emergency stop**: 5 requests per minute per user

## Response Headers

All responses include:
- `X-Request-ID`: Unique request identifier
- `X-Rate-Limit-Remaining`: Remaining rate limit quota
- `X-Rate-Limit-Reset`: Rate limit reset timestamp
