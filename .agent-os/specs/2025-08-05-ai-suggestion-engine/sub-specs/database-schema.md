# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-05-ai-suggestion-engine/spec.md

## Database Changes

### New Tables

#### ai_suggestions
- **Primary table for storing AI-generated automation suggestions**
- **Columns**: id, connection_id, suggestion_type, title, description, automation_config, confidence_score, status, created_at, processed_at
- **Purpose**: Store all generated suggestions with metadata and processing status

#### ai_suggestion_approvals
- **Table for tracking user approval decisions and audit trail**
- **Columns**: id, suggestion_id, user_id, decision, decision_reason, decided_at, implemented_at, rollback_at
- **Purpose**: Maintain complete audit trail of user decisions and implementation status

#### ai_batch_processing
- **Table for tracking batch processing jobs and status**
- **Columns**: id, batch_id, start_time, end_time, status, suggestions_generated, errors_count, pattern_data_source
- **Purpose**: Monitor batch processing performance and troubleshoot issues

#### ai_suggestion_feedback
- **Table for storing user feedback on implemented suggestions**
- **Columns**: id, suggestion_id, effectiveness_rating, user_comments, feedback_date, automation_performance_data
- **Purpose**: Collect feedback for AI model improvement and suggestion quality assessment

## Schema Specifications

### Table: ai_suggestions
```sql
CREATE TABLE ai_suggestions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    connection_id BIGINT NOT NULL REFERENCES home_assistant_connections(id),
    suggestion_type VARCHAR(50) NOT NULL CHECK (suggestion_type IN ('AUTOMATION_OPTIMIZATION', 'NEW_AUTOMATION', 'SCHEDULE_ADJUSTMENT', 'TRIGGER_REFINEMENT')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    automation_config JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'FAILED', 'ROLLED_BACK')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_suggestions_connection_status (connection_id, status),
    INDEX idx_suggestions_created_at (created_at)
);
```

### Table: ai_suggestion_approvals
```sql
CREATE TABLE ai_suggestion_approvals (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    suggestion_id BIGINT NOT NULL REFERENCES ai_suggestions(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'DEFERRED')),
    decision_reason TEXT,
    decided_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    implemented_at TIMESTAMP WITH TIME ZONE,
    rollback_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_approvals_suggestion_id (suggestion_id),
    INDEX idx_approvals_user_decision (user_id, decision)
);
```

### Table: ai_batch_processing
```sql
CREATE TABLE ai_batch_processing (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    batch_id VARCHAR(36) NOT NULL UNIQUE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    suggestions_generated INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    pattern_data_source VARCHAR(100),
    INDEX idx_batch_status (status),
    INDEX idx_batch_start_time (start_time)
);
```

### Table: ai_suggestion_feedback
```sql
CREATE TABLE ai_suggestion_feedback (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    suggestion_id BIGINT NOT NULL REFERENCES ai_suggestions(id),
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    user_comments TEXT,
    feedback_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    automation_performance_data JSONB,
    INDEX idx_feedback_suggestion_id (suggestion_id),
    INDEX idx_feedback_rating (effectiveness_rating)
);
```

## Migration Strategy

### Migration V002: AI Suggestion Engine Tables
```sql
-- Migration file: V002__create_ai_suggestion_engine_tables.sql

-- Create ai_suggestions table
CREATE TABLE ai_suggestions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    connection_id BIGINT NOT NULL REFERENCES home_assistant_connections(id),
    suggestion_type VARCHAR(50) NOT NULL CHECK (suggestion_type IN ('AUTOMATION_OPTIMIZATION', 'NEW_AUTOMATION', 'SCHEDULE_ADJUSTMENT', 'TRIGGER_REFINEMENT')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    automation_config JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'FAILED', 'ROLLED_BACK')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for ai_suggestions
CREATE INDEX idx_suggestions_connection_status ON ai_suggestions(connection_id, status);
CREATE INDEX idx_suggestions_created_at ON ai_suggestions(created_at);

-- Create remaining tables with similar structure...
```

## Data Integrity and Performance

### Foreign Key Relationships
- **ai_suggestions.connection_id** → home_assistant_connections.id (CASCADE DELETE)
- **ai_suggestion_approvals.suggestion_id** → ai_suggestions.id (CASCADE DELETE)  
- **ai_suggestion_approvals.user_id** → users.id (RESTRICT DELETE)
- **ai_suggestion_feedback.suggestion_id** → ai_suggestions.id (CASCADE DELETE)

### Indexing Strategy
- **Primary Performance**: Connection-based queries with status filtering
- **Secondary Performance**: Time-based queries for batch processing and analytics
- **Audit Queries**: User-based approval tracking and feedback analysis

### Data Retention Policy
- **Suggestions**: Retain for 12 months after implementation or rejection
- **Approvals**: Permanent retention for audit compliance
- **Batch Processing**: Retain for 6 months for performance analysis
- **Feedback**: Permanent retention for AI model improvement