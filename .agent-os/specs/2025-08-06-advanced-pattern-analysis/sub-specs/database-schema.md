# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-06-advanced-pattern-analysis/spec.md

## New Tables

### pattern_analysis_results
Stores computed pattern analysis results for different time dimensions

```sql
CREATE TABLE pattern_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_type VARCHAR(50) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'YEARLY'
    entity_id VARCHAR(255) NOT NULL, -- Home Assistant entity being analyzed
    pattern_type VARCHAR(100) NOT NULL, -- 'RECURRING', 'ANOMALY', 'CORRELATION', 'TREND'
    time_range_start TIMESTAMP NOT NULL,
    time_range_end TIMESTAMP NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    pattern_data JSONB NOT NULL, -- Detailed pattern information
    computed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL, -- For cache management
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pattern_analysis_entity ON pattern_analysis_results(entity_id);
CREATE INDEX idx_pattern_analysis_time ON pattern_analysis_results(time_range_start, time_range_end);
CREATE INDEX idx_pattern_analysis_type ON pattern_analysis_results(analysis_type, pattern_type);
CREATE INDEX idx_pattern_analysis_expires ON pattern_analysis_results(expires_at);
```

### pattern_correlations
Stores correlation relationships between different entities

```sql
CREATE TABLE pattern_correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_entity_id VARCHAR(255) NOT NULL,
    correlated_entity_id VARCHAR(255) NOT NULL,
    correlation_coefficient DECIMAL(5,4) NOT NULL CHECK (correlation_coefficient >= -1 AND correlation_coefficient <= 1),
    correlation_type VARCHAR(50) NOT NULL, -- 'TEMPORAL', 'CAUSAL', 'SEQUENTIAL'
    time_lag_seconds INTEGER, -- Time delay between correlated events
    sample_size INTEGER NOT NULL,
    p_value DECIMAL(10,9), -- Statistical significance
    analysis_period_start TIMESTAMP NOT NULL,
    analysis_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(primary_entity_id, correlated_entity_id, analysis_period_start, analysis_period_end)
);

CREATE INDEX idx_correlation_entities ON pattern_correlations(primary_entity_id, correlated_entity_id);
CREATE INDEX idx_correlation_strength ON pattern_correlations(correlation_coefficient);
CREATE INDEX idx_correlation_period ON pattern_correlations(analysis_period_start, analysis_period_end);
```

### pattern_anomalies
Stores detected anomalies in behavioral patterns

```sql
CREATE TABLE pattern_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(255) NOT NULL,
    anomaly_timestamp TIMESTAMP NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL, -- 'OUTLIER', 'TREND_BREAK', 'UNUSUAL_SEQUENCE'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    expected_value JSONB,
    actual_value JSONB NOT NULL,
    deviation_score DECIMAL(10,4) NOT NULL,
    context_data JSONB, -- Additional context about the anomaly
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anomaly_entity ON pattern_anomalies(entity_id);
CREATE INDEX idx_anomaly_time ON pattern_anomalies(anomaly_timestamp);
CREATE INDEX idx_anomaly_severity ON pattern_anomalies(severity);
CREATE INDEX idx_anomaly_unacknowledged ON pattern_anomalies(is_acknowledged) WHERE is_acknowledged = FALSE;
```

### pattern_processing_metadata
Tracks pattern processing jobs and their status

```sql
CREATE TABLE pattern_processing_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processing_type VARCHAR(50) NOT NULL,
    time_dimension VARCHAR(20) NOT NULL, -- 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
    processing_status VARCHAR(20) NOT NULL CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    events_processed INTEGER DEFAULT 0,
    patterns_detected INTEGER DEFAULT 0,
    anomalies_detected INTEGER DEFAULT 0,
    error_message TEXT,
    processing_duration_ms BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_processing_status ON pattern_processing_metadata(processing_status);
CREATE INDEX idx_processing_time ON pattern_processing_metadata(created_at);
```

## Modified Tables

### home_assistant_events (Enhancement)
Add indexes for efficient pattern analysis queries

```sql
-- Additional indexes for pattern analysis performance
CREATE INDEX IF NOT EXISTS idx_events_entity_time ON home_assistant_events(entity_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON home_assistant_events(event_type, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_events_hour ON home_assistant_events(EXTRACT(HOUR FROM event_timestamp));
CREATE INDEX IF NOT EXISTS idx_events_dow ON home_assistant_events(EXTRACT(DOW FROM event_timestamp));
```

## Migrations

### Flyway Migration: V004__create_pattern_analysis_tables.sql
Complete migration script combining all schema changes

```sql
-- Pattern Analysis Results Table
CREATE TABLE pattern_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    time_range_start TIMESTAMP NOT NULL,
    time_range_end TIMESTAMP NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    pattern_data JSONB NOT NULL,
    computed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for pattern_analysis_results
CREATE INDEX idx_pattern_analysis_entity ON pattern_analysis_results(entity_id);
CREATE INDEX idx_pattern_analysis_time ON pattern_analysis_results(time_range_start, time_range_end);
CREATE INDEX idx_pattern_analysis_type ON pattern_analysis_results(analysis_type, pattern_type);
CREATE INDEX idx_pattern_analysis_expires ON pattern_analysis_results(expires_at);

-- Continue with other tables...
```

## Rationale

### Performance Considerations
- **JSONB columns**: Used for flexible pattern data storage without schema rigidity
- **UUID primary keys**: Distributed ID generation for horizontal scaling
- **Comprehensive indexes**: Optimized for common query patterns identified in requirements
- **Partitioning ready**: Tables designed to support future partitioning by time ranges

### Data Integrity
- **Check constraints**: Ensure data validity (confidence scores, correlation coefficients)
- **Unique constraints**: Prevent duplicate correlation records
- **NOT NULL constraints**: Enforce required fields for data consistency
- **Foreign keys**: Intentionally omitted for performance, relationships managed at application layer

### Scalability Design
- **Expiration timestamps**: Enable automated data cleanup for space management
- **Processing metadata**: Track and optimize batch processing performance
- **Separate anomaly storage**: Isolate high-volume anomaly data from pattern results