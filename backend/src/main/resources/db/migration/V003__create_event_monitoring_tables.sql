-- Migration: V003__create_event_monitoring_tables.sql
-- Create additional tables for event monitoring system

-- Create event_processing_metrics table
CREATE TABLE event_processing_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    event_count BIGINT NOT NULL DEFAULT 0,
    processing_time_ms BIGINT NOT NULL DEFAULT 0,
    filter_effectiveness DECIMAL(5,4),
    batch_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for event_processing_metrics
CREATE INDEX idx_event_processing_metrics_timestamp ON event_processing_metrics(timestamp);
CREATE INDEX idx_event_processing_metrics_metric_type ON event_processing_metrics(metric_type);
CREATE INDEX idx_event_processing_metrics_connection_id ON event_processing_metrics(connection_id);
CREATE INDEX idx_event_processing_metrics_created_at ON event_processing_metrics(created_at);
CREATE INDEX idx_event_processing_metrics_batch_id ON event_processing_metrics(batch_id);

-- Create event_filtering_rules table
CREATE TABLE event_filtering_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    rule_config JSONB,
    priority INTEGER NOT NULL DEFAULT 100,
    enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    event_types TEXT,
    entity_patterns TEXT,
    frequency_limit INTEGER,
    time_window_minutes INTEGER DEFAULT 60,
    match_count BIGINT NOT NULL DEFAULT 0,
    last_matched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for event_filtering_rules
CREATE INDEX idx_event_filtering_rules_user_id ON event_filtering_rules(user_id);
CREATE INDEX idx_event_filtering_rules_connection_id ON event_filtering_rules(connection_id);
CREATE INDEX idx_event_filtering_rules_enabled ON event_filtering_rules(enabled);
CREATE INDEX idx_event_filtering_rules_rule_type ON event_filtering_rules(rule_type);
CREATE INDEX idx_event_filtering_rules_priority ON event_filtering_rules(priority);
CREATE INDEX idx_event_filtering_rules_created_at ON event_filtering_rules(created_at);

-- Create event_processing_batches table
CREATE TABLE event_processing_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
    batch_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    batch_size INTEGER NOT NULL DEFAULT 0,
    processed_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    filtered_count INTEGER NOT NULL DEFAULT 0,
    processing_time_ms BIGINT,
    average_latency_ms DECIMAL(10,4),
    filter_effectiveness DECIMAL(5,4),
    kafka_topic VARCHAR(255),
    kafka_partition INTEGER,
    kafka_offset_start BIGINT,
    kafka_offset_end BIGINT,
    batch_config JSONB,
    error_details JSONB,
    processing_stats JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for event_processing_batches
CREATE INDEX idx_event_processing_batches_connection_id ON event_processing_batches(connection_id);
CREATE INDEX idx_event_processing_batches_status ON event_processing_batches(status);
CREATE INDEX idx_event_processing_batches_started_at ON event_processing_batches(started_at);
CREATE INDEX idx_event_processing_batches_completed_at ON event_processing_batches(completed_at);
CREATE INDEX idx_event_processing_batches_batch_type ON event_processing_batches(batch_type);
CREATE INDEX idx_event_processing_batches_created_at ON event_processing_batches(created_at);
CREATE INDEX idx_event_processing_batches_retry_at ON event_processing_batches(next_retry_at);

-- Create trigger for event_filtering_rules updated_at
CREATE TRIGGER update_event_filtering_rules_updated_at 
    BEFORE UPDATE ON event_filtering_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for event_processing_batches updated_at
CREATE TRIGGER update_event_processing_batches_updated_at 
    BEFORE UPDATE ON event_processing_batches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for batch_id in event_processing_metrics
ALTER TABLE event_processing_metrics 
ADD CONSTRAINT fk_event_processing_metrics_batch_id 
FOREIGN KEY (batch_id) REFERENCES event_processing_batches(id) ON DELETE SET NULL;

-- Create composite indexes for performance optimization
CREATE INDEX idx_event_filtering_rules_user_connection ON event_filtering_rules(user_id, connection_id);
CREATE INDEX idx_event_filtering_rules_enabled_priority ON event_filtering_rules(enabled, priority);
CREATE INDEX idx_event_processing_metrics_connection_timestamp ON event_processing_metrics(connection_id, timestamp);
CREATE INDEX idx_event_processing_batches_status_type ON event_processing_batches(status, batch_type);

-- Create partial indexes for better performance
CREATE INDEX idx_event_filtering_rules_active 
ON event_filtering_rules(user_id, priority) 
WHERE enabled = true;

CREATE INDEX idx_event_processing_batches_active 
ON event_processing_batches(connection_id, started_at) 
WHERE status IN ('PENDING', 'RUNNING', 'RETRYING');

-- Add comments for documentation
COMMENT ON TABLE event_processing_metrics IS 'Stores detailed performance metrics for event processing operations';
COMMENT ON TABLE event_filtering_rules IS 'User-defined rules for filtering events during processing';
COMMENT ON TABLE event_processing_batches IS 'Tracks batch processing operations and their lifecycle';

COMMENT ON COLUMN event_processing_metrics.filter_effectiveness IS 'Percentage of events filtered (0.0 to 1.0)';
COMMENT ON COLUMN event_filtering_rules.conditions IS 'JSON object containing filtering conditions';
COMMENT ON COLUMN event_filtering_rules.priority IS 'Rule priority (lower number = higher priority)';
COMMENT ON COLUMN event_processing_batches.filter_effectiveness IS 'Percentage of events filtered in this batch';
COMMENT ON COLUMN event_processing_batches.processing_stats IS 'JSON object containing detailed processing statistics';