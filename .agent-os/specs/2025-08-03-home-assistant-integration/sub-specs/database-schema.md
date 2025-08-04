# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-03-home-assistant-integration/spec.md

## New Tables

### home_assistant_connections

Stores Home Assistant connection configurations and status information.

```sql
CREATE TABLE home_assistant_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    encrypted_token TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
    home_assistant_version VARCHAR(50),
    supported_features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    connection_health JSONB,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, url)
);

-- Index for efficient querying
CREATE INDEX idx_home_assistant_connections_user_id ON home_assistant_connections(user_id);
CREATE INDEX idx_home_assistant_connections_status ON home_assistant_connections(status);
CREATE INDEX idx_home_assistant_connections_updated_at ON home_assistant_connections(updated_at);
```

### home_assistant_events

Stores Home Assistant events for analysis and pattern recognition.

```sql
CREATE TABLE home_assistant_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    old_state TEXT,
    new_state TEXT,
    attributes JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    embedding_vector VECTOR(1536), -- For pgvector similarity search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying and analysis
CREATE INDEX idx_home_assistant_events_connection_id ON home_assistant_events(connection_id);
CREATE INDEX idx_home_assistant_events_event_type ON home_assistant_events(event_type);
CREATE INDEX idx_home_assistant_events_entity_id ON home_assistant_events(entity_id);
CREATE INDEX idx_home_assistant_events_timestamp ON home_assistant_events(timestamp);
CREATE INDEX idx_home_assistant_events_embedding ON home_assistant_events USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
```

### home_assistant_connection_metrics

Stores performance and health metrics for connections.

```sql
CREATE TABLE home_assistant_connection_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'latency', 'uptime', 'error_rate', 'event_rate'
    metric_value DECIMAL(10,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient time-series querying
CREATE INDEX idx_home_assistant_connection_metrics_connection_id ON home_assistant_connection_metrics(connection_id);
CREATE INDEX idx_home_assistant_connection_metrics_timestamp ON home_assistant_connection_metrics(timestamp);
CREATE INDEX idx_home_assistant_connection_metrics_type ON home_assistant_connection_metrics(metric_type);
```

### home_assistant_audit_log

Stores audit trail for all connection activities and API interactions.

```sql
CREATE TABLE home_assistant_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES home_assistant_connections(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'connect', 'disconnect', 'test', 'error'
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit trail querying
CREATE INDEX idx_home_assistant_audit_log_connection_id ON home_assistant_audit_log(connection_id);
CREATE INDEX idx_home_assistant_audit_log_user_id ON home_assistant_audit_log(user_id);
CREATE INDEX idx_home_assistant_audit_log_action ON home_assistant_audit_log(action);
CREATE INDEX idx_home_assistant_audit_log_created_at ON home_assistant_audit_log(created_at);
```

## Database Migrations

### Migration 001: Create Home Assistant Integration Tables

```sql
-- Migration: 001_create_home_assistant_integration_tables.sql

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create home_assistant_connections table
CREATE TABLE home_assistant_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    encrypted_token TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
    home_assistant_version VARCHAR(50),
    supported_features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    connection_health JSONB,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, url)
);

-- Create indexes for home_assistant_connections
CREATE INDEX idx_home_assistant_connections_user_id ON home_assistant_connections(user_id);
CREATE INDEX idx_home_assistant_connections_status ON home_assistant_connections(status);
CREATE INDEX idx_home_assistant_connections_updated_at ON home_assistant_connections(updated_at);

-- Create home_assistant_events table
CREATE TABLE home_assistant_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    old_state TEXT,
    new_state TEXT,
    attributes JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    embedding_vector VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for home_assistant_events
CREATE INDEX idx_home_assistant_events_connection_id ON home_assistant_events(connection_id);
CREATE INDEX idx_home_assistant_events_event_type ON home_assistant_events(event_type);
CREATE INDEX idx_home_assistant_events_entity_id ON home_assistant_events(entity_id);
CREATE INDEX idx_home_assistant_events_timestamp ON home_assistant_events(timestamp);
CREATE INDEX idx_home_assistant_events_embedding ON home_assistant_events USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);

-- Create home_assistant_connection_metrics table
CREATE TABLE home_assistant_connection_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for home_assistant_connection_metrics
CREATE INDEX idx_home_assistant_connection_metrics_connection_id ON home_assistant_connection_metrics(connection_id);
CREATE INDEX idx_home_assistant_connection_metrics_timestamp ON home_assistant_connection_metrics(timestamp);
CREATE INDEX idx_home_assistant_connection_metrics_type ON home_assistant_connection_metrics(metric_type);

-- Create home_assistant_audit_log table
CREATE TABLE home_assistant_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES home_assistant_connections(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for home_assistant_audit_log
CREATE INDEX idx_home_assistant_audit_log_connection_id ON home_assistant_audit_log(connection_id);
CREATE INDEX idx_home_assistant_audit_log_user_id ON home_assistant_audit_log(user_id);
CREATE INDEX idx_home_assistant_audit_log_action ON home_assistant_audit_log(action);
CREATE INDEX idx_home_assistant_audit_log_created_at ON home_assistant_audit_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for home_assistant_connections
CREATE TRIGGER update_home_assistant_connections_updated_at 
    BEFORE UPDATE ON home_assistant_connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Data Integrity Rules

1. **Connection Uniqueness**: Each user can only have one connection per Home Assistant URL
2. **Event Retention**: Events are retained for 90 days by default, with configurable retention policies
3. **Token Encryption**: All authentication tokens must be encrypted before storage
4. **Audit Trail**: All connection activities must be logged for security and debugging
5. **Cascade Deletion**: When a connection is deleted, all related events and metrics are also deleted
6. **Foreign Key Constraints**: All foreign key relationships are enforced with appropriate cascade rules

## Performance Considerations

1. **Event Partitioning**: Consider partitioning the events table by date for large datasets
2. **Index Optimization**: Vector indexes for similarity search with appropriate parameters
3. **Connection Pooling**: Use connection pooling for efficient database access
4. **Query Optimization**: Implement efficient queries for time-series data analysis
5. **Data Archival**: Implement archival strategy for old events and metrics

## Security Considerations

1. **Token Encryption**: Use strong encryption for storing authentication tokens
2. **Access Control**: Implement row-level security for multi-tenant access
3. **Audit Logging**: Comprehensive audit trail for all database operations
4. **Input Validation**: Validate all inputs before database operations
5. **SQL Injection Prevention**: Use parameterized queries and ORM properly 