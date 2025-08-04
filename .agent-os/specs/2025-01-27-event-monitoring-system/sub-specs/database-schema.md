# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-01-27-event-monitoring-system/spec.md

## New Tables

### event_processing_metrics
Stores real-time metrics about event processing performance and filtering effectiveness.

```sql
CREATE TABLE event_processing_metrics (
    id BIGSERIAL PRIMARY KEY,
    connection_id BIGINT NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_event_processing_metrics_connection_timestamp ON event_processing_metrics(connection_id, timestamp);
CREATE INDEX idx_event_processing_metrics_type_timestamp ON event_processing_metrics(metric_type, timestamp);
```

### event_filtering_rules
Stores configurable filtering rules for intelligent event filtering.

```sql
CREATE TABLE event_filtering_rules (
    id BIGSERIAL PRIMARY KEY,
    connection_id BIGINT NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'frequency', 'pattern', 'user_defined'
    rule_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_event_filtering_rules_connection_active ON event_filtering_rules(connection_id, is_active);
CREATE INDEX idx_event_filtering_rules_type ON event_filtering_rules(rule_type);
```

### event_processing_batches
Stores information about event processing batches for performance analysis.

```sql
CREATE TABLE event_processing_batches (
    id BIGSERIAL PRIMARY KEY,
    connection_id BIGINT NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    batch_id VARCHAR(100) NOT NULL,
    total_events INTEGER NOT NULL,
    filtered_events INTEGER NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    kafka_topic VARCHAR(100),
    kafka_partition INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_event_processing_batches_connection_created ON event_processing_batches(connection_id, created_at);
CREATE INDEX idx_event_processing_batches_batch_id ON event_processing_batches(batch_id);
```

## Table Modifications

### home_assistant_events
Add new columns for enhanced event processing and filtering.

```sql
-- Add new columns to existing home_assistant_events table
ALTER TABLE home_assistant_events 
ADD COLUMN filtering_score DECIMAL(3,2),
ADD COLUMN filtered_by_rule_id BIGINT REFERENCES event_filtering_rules(id),
ADD COLUMN processing_batch_id VARCHAR(100),
ADD COLUMN processing_latency_ms INTEGER,
ADD COLUMN kafka_topic VARCHAR(100),
ADD COLUMN kafka_partition INTEGER;

-- Indexes for new columns
CREATE INDEX idx_home_assistant_events_filtering_score ON home_assistant_events(filtering_score);
CREATE INDEX idx_home_assistant_events_filtered_by_rule ON home_assistant_events(filtered_by_rule_id);
CREATE INDEX idx_home_assistant_events_processing_batch ON home_assistant_events(processing_batch_id);
```

### home_assistant_connection_metrics
Add new metric types for event processing performance.

```sql
-- Add new metric types to the existing enum (if using enum)
-- This would be handled in the Java code by extending the MetricType enum
-- New metric types: EVENT_PROCESSING_LATENCY, FILTERING_EFFECTIVENESS, KAFKA_THROUGHPUT
```

## Data Integrity Rules

1. **Foreign Key Constraints**: All foreign keys must reference existing records
2. **Metric Validation**: Metric values must be positive numbers
3. **Rule Configuration**: JSONB rule_config must contain valid filtering rule parameters
4. **Batch Consistency**: Processing batch IDs must be unique within a connection
5. **Timestamp Consistency**: All timestamps must be in UTC timezone

## Performance Considerations

1. **Partitioning**: Consider partitioning event_processing_metrics by date for large datasets
2. **Indexing Strategy**: Composite indexes on frequently queried combinations
3. **JSONB Indexing**: Create GIN indexes on rule_config for efficient rule queries
4. **Archival Strategy**: Implement data archival for old metrics and batch data
5. **Connection Cleanup**: Cascade deletes to maintain referential integrity

## Migration Strategy

1. **Phase 1**: Create new tables with proper indexes
2. **Phase 2**: Add new columns to existing tables with default values
3. **Phase 3**: Update existing data with calculated filtering scores
4. **Phase 4**: Enable new constraints and validation rules
5. **Phase 5**: Monitor performance and optimize indexes as needed 