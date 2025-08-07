-- Migration: V004__create_autonomous_management_tables.sql
-- Description: Create tables for autonomous automation management system
-- Created: 2025-01-27
-- Author: TappHA Development Team

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Automation Management Table
CREATE TABLE automation_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_assistant_automation_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lifecycle_state VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    performance_score DECIMAL(5,2),
    last_execution_time TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    average_execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by UUID,
    modified_by UUID,
    version INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 2. Automation Lifecycle History Table
CREATE TABLE automation_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_management_id UUID NOT NULL,
    previous_state VARCHAR(50),
    new_state VARCHAR(50) NOT NULL,
    transition_reason TEXT,
    transition_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transitioned_by UUID,
    metadata JSONB,
    CONSTRAINT fk_automation_lifecycle_history_automation_management
        FOREIGN KEY (automation_management_id)
        REFERENCES automation_management(id)
        ON DELETE CASCADE
);

-- 3. Approval Workflow Table
CREATE TABLE approval_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_management_id UUID NOT NULL,
    workflow_type VARCHAR(50) NOT NULL, -- 'CREATION', 'MODIFICATION', 'RETIREMENT'
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
    requested_by UUID NOT NULL,
    approved_by UUID,
    rejected_by UUID,
    request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approval_timestamp TIMESTAMP,
    rejection_timestamp TIMESTAMP,
    approval_notes TEXT,
    rejection_reason TEXT,
    emergency_stop_triggered BOOLEAN DEFAULT FALSE,
    emergency_stop_timestamp TIMESTAMP,
    emergency_stop_reason TEXT,
    CONSTRAINT fk_approval_workflow_automation_management
        FOREIGN KEY (automation_management_id)
        REFERENCES automation_management(id)
        ON DELETE CASCADE
);

-- 4. Automation Performance Metrics Table
CREATE TABLE automation_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_management_id UUID NOT NULL,
    execution_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    execution_duration_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    trigger_source VARCHAR(100),
    affected_entities JSONB,
    performance_score DECIMAL(5,2),
    resource_usage JSONB,
    metadata JSONB,
    CONSTRAINT fk_automation_performance_metrics_automation_management
        FOREIGN KEY (automation_management_id)
        REFERENCES automation_management(id)
        ON DELETE CASCADE
);

-- 5. Automation Backup Table
CREATE TABLE automation_backup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_management_id UUID NOT NULL,
    backup_name VARCHAR(255),
    backup_description TEXT,
    backup_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    backup_type VARCHAR(50) NOT NULL, -- 'AUTOMATIC', 'MANUAL', 'BEFORE_MODIFICATION'
    backup_size_bytes BIGINT,
    backup_data JSONB NOT NULL,
    backup_metadata JSONB,
    created_by UUID,
    CONSTRAINT fk_automation_backup_automation_management
        FOREIGN KEY (automation_management_id)
        REFERENCES automation_management(id)
        ON DELETE CASCADE
);

-- 6. Emergency Stop Log Table
CREATE TABLE emergency_stop_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_management_id UUID,
    stop_type VARCHAR(50) NOT NULL, -- 'MANUAL', 'AUTOMATIC', 'SYSTEM', 'EMERGENCY'
    triggered_by UUID NOT NULL,
    trigger_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    stop_reason TEXT NOT NULL,
    trigger_source VARCHAR(100), -- 'MANUAL', 'AUTOMATIC', 'SYSTEM'
    recovery_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
    recovery_timestamp TIMESTAMP,
    affected_automations JSONB,
    recovery_actions JSONB,
    metadata JSONB,
    CONSTRAINT fk_emergency_stop_log_automation_management
        FOREIGN KEY (automation_management_id)
        REFERENCES automation_management(id)
        ON DELETE SET NULL
);

-- 7. Optimization Suggestions Table
CREATE TABLE optimization_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_management_id UUID NOT NULL,
    suggestion_type VARCHAR(50) NOT NULL, -- 'PERFORMANCE', 'EFFICIENCY', 'SAFETY', 'USER_EXPERIENCE'
    suggestion_title VARCHAR(255) NOT NULL,
    suggestion_description TEXT NOT NULL,
    current_value TEXT,
    suggested_value TEXT,
    expected_impact VARCHAR(50), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    confidence_score DECIMAL(5,2),
    impact_level VARCHAR(50), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP,
    reviewed_by UUID,
    review_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED'
    implementation_notes TEXT,
    metadata JSONB,
    CONSTRAINT fk_optimization_suggestions_automation_management
        FOREIGN KEY (automation_management_id)
        REFERENCES automation_management(id)
        ON DELETE CASCADE
);

-- Create Indexes for Performance Optimization

-- Automation Management Indexes
CREATE INDEX idx_automation_management_lifecycle_state ON automation_management(lifecycle_state);
CREATE INDEX idx_automation_management_performance_score ON automation_management(performance_score);
CREATE INDEX idx_automation_management_last_execution_time ON automation_management(last_execution_time);
CREATE INDEX idx_automation_management_created_at ON automation_management(created_at);
CREATE INDEX idx_automation_management_updated_at ON automation_management(updated_at);
CREATE INDEX idx_automation_management_created_by ON automation_management(created_by);
CREATE INDEX idx_automation_management_is_active ON automation_management(is_active);
CREATE INDEX idx_automation_management_home_assistant_id ON automation_management(home_assistant_automation_id);
CREATE INDEX idx_automation_management_success_rate ON automation_management(success_rate);
CREATE INDEX idx_automation_management_execution_count ON automation_management(execution_count);
CREATE INDEX idx_automation_management_average_execution_time ON automation_management(average_execution_time_ms);
CREATE INDEX idx_automation_management_version ON automation_management(version);
CREATE INDEX idx_automation_management_modified_by ON automation_management(modified_by);

-- Lifecycle History Indexes
CREATE INDEX idx_lifecycle_history_automation_id ON automation_lifecycle_history(automation_management_id);
CREATE INDEX idx_lifecycle_history_transition_timestamp ON automation_lifecycle_history(transition_timestamp);
CREATE INDEX idx_lifecycle_history_new_state ON automation_lifecycle_history(new_state);
CREATE INDEX idx_lifecycle_history_transitioned_by ON automation_lifecycle_history(transitioned_by);
CREATE INDEX idx_lifecycle_history_previous_state ON automation_lifecycle_history(previous_state);

-- Approval Workflow Indexes
CREATE INDEX idx_approval_workflow_automation_id ON approval_workflow(automation_management_id);
CREATE INDEX idx_approval_workflow_status ON approval_workflow(status);
CREATE INDEX idx_approval_workflow_type ON approval_workflow(workflow_type);
CREATE INDEX idx_approval_workflow_requested_by ON approval_workflow(requested_by);
CREATE INDEX idx_approval_workflow_request_timestamp ON approval_workflow(request_timestamp);
CREATE INDEX idx_approval_workflow_approved_by ON approval_workflow(approved_by);
CREATE INDEX idx_approval_workflow_rejected_by ON approval_workflow(rejected_by);
CREATE INDEX idx_approval_workflow_approval_timestamp ON approval_workflow(approval_timestamp);
CREATE INDEX idx_approval_workflow_rejection_timestamp ON approval_workflow(rejection_timestamp);
CREATE INDEX idx_approval_workflow_emergency_stop ON approval_workflow(emergency_stop_triggered);

-- Performance Metrics Indexes
CREATE INDEX idx_performance_metrics_automation_id ON automation_performance_metrics(automation_management_id);
CREATE INDEX idx_performance_metrics_execution_timestamp ON automation_performance_metrics(execution_timestamp);
CREATE INDEX idx_performance_metrics_success ON automation_performance_metrics(success);
CREATE INDEX idx_performance_metrics_performance_score ON automation_performance_metrics(performance_score);
CREATE INDEX idx_performance_metrics_execution_duration ON automation_performance_metrics(execution_duration_ms);
CREATE INDEX idx_performance_metrics_trigger_source ON automation_performance_metrics(trigger_source);

-- Backup Indexes
CREATE INDEX idx_backup_automation_id ON automation_backup(automation_management_id);
CREATE INDEX idx_backup_timestamp ON automation_backup(backup_timestamp);
CREATE INDEX idx_backup_type ON automation_backup(backup_type);
CREATE INDEX idx_backup_created_by ON automation_backup(created_by);
CREATE INDEX idx_backup_size ON automation_backup(backup_size_bytes);

-- Emergency Stop Log Indexes
CREATE INDEX idx_emergency_stop_automation_id ON emergency_stop_log(automation_management_id);
CREATE INDEX idx_emergency_stop_trigger_timestamp ON emergency_stop_log(trigger_timestamp);
CREATE INDEX idx_emergency_stop_triggered_by ON emergency_stop_log(triggered_by);
CREATE INDEX idx_emergency_stop_type ON emergency_stop_log(stop_type);
CREATE INDEX idx_emergency_stop_recovery_status ON emergency_stop_log(recovery_status);
CREATE INDEX idx_emergency_stop_recovery_timestamp ON emergency_stop_log(recovery_timestamp);

-- Optimization Suggestions Indexes
CREATE INDEX idx_optimization_suggestions_automation_id ON optimization_suggestions(automation_management_id);
CREATE INDEX idx_optimization_suggestions_type ON optimization_suggestions(suggestion_type);
CREATE INDEX idx_optimization_suggestions_review_status ON optimization_suggestions(review_status);
CREATE INDEX idx_optimization_suggestions_created_at ON optimization_suggestions(created_at);
CREATE INDEX idx_optimization_suggestions_confidence_score ON optimization_suggestions(confidence_score);
CREATE INDEX idx_optimization_suggestions_impact_level ON optimization_suggestions(impact_level);
CREATE INDEX idx_optimization_suggestions_created_by ON optimization_suggestions(created_by);
CREATE INDEX idx_optimization_suggestions_reviewed_by ON optimization_suggestions(reviewed_by);
CREATE INDEX idx_optimization_suggestions_reviewed_at ON optimization_suggestions(reviewed_at);

-- Create Composite Indexes for Common Query Patterns
CREATE INDEX idx_automation_management_active_performance ON automation_management(is_active, performance_score) WHERE is_active = true;
CREATE INDEX idx_automation_management_state_performance ON automation_management(lifecycle_state, performance_score);
CREATE INDEX idx_automation_management_active_execution_time ON automation_management(is_active, last_execution_time) WHERE is_active = true;
CREATE INDEX idx_automation_management_state_active ON automation_management(lifecycle_state, is_active);
CREATE INDEX idx_automation_management_created_by_active ON automation_management(created_by, is_active);
CREATE INDEX idx_automation_management_performance_success ON automation_management(performance_score, success_rate);
CREATE INDEX idx_automation_management_execution_count_active ON automation_management(execution_count, is_active) WHERE is_active = true;

CREATE INDEX idx_performance_metrics_automation_timestamp ON automation_performance_metrics(automation_management_id, execution_timestamp);
CREATE INDEX idx_performance_metrics_automation_success ON automation_performance_metrics(automation_management_id, success);
CREATE INDEX idx_performance_metrics_timestamp_success ON automation_performance_metrics(execution_timestamp, success);
CREATE INDEX idx_performance_metrics_automation_duration ON automation_performance_metrics(automation_management_id, execution_duration_ms);

CREATE INDEX idx_approval_workflow_automation_status ON approval_workflow(automation_management_id, status);
CREATE INDEX idx_approval_workflow_type_status ON approval_workflow(workflow_type, status);
CREATE INDEX idx_approval_workflow_requested_timestamp ON approval_workflow(requested_by, request_timestamp);
CREATE INDEX idx_approval_workflow_emergency_status ON approval_workflow(emergency_stop_triggered, status);

CREATE INDEX idx_lifecycle_history_automation_timestamp ON automation_lifecycle_history(automation_management_id, transition_timestamp);
CREATE INDEX idx_lifecycle_history_state_transition ON automation_lifecycle_history(previous_state, new_state);
CREATE INDEX idx_lifecycle_history_automation_state ON automation_lifecycle_history(automation_management_id, new_state);

CREATE INDEX idx_backup_automation_type ON automation_backup(automation_management_id, backup_type);
CREATE INDEX idx_backup_automation_timestamp ON automation_backup(automation_management_id, backup_timestamp);
CREATE INDEX idx_backup_created_by_timestamp ON automation_backup(created_by, backup_timestamp);

CREATE INDEX idx_emergency_stop_automation_type ON emergency_stop_log(automation_management_id, stop_type);
CREATE INDEX idx_emergency_stop_automation_status ON emergency_stop_log(automation_management_id, recovery_status);
CREATE INDEX idx_emergency_stop_triggered_timestamp ON emergency_stop_log(triggered_by, trigger_timestamp);

CREATE INDEX idx_optimization_suggestions_automation_type ON optimization_suggestions(automation_management_id, suggestion_type);
CREATE INDEX idx_optimization_suggestions_automation_status ON optimization_suggestions(automation_management_id, review_status);
CREATE INDEX idx_optimization_suggestions_type_status ON optimization_suggestions(suggestion_type, review_status);
CREATE INDEX idx_optimization_suggestions_confidence_impact ON optimization_suggestions(confidence_score, impact_level);
CREATE INDEX idx_optimization_suggestions_created_by_status ON optimization_suggestions(created_by, review_status);

-- Create Partial Indexes for Filtered Queries
CREATE INDEX idx_automation_management_high_performance ON automation_management(performance_score) WHERE performance_score > 80 AND is_active = true;
CREATE INDEX idx_automation_management_low_performance ON automation_management(performance_score) WHERE performance_score < 50 AND is_active = true;
CREATE INDEX idx_automation_management_high_success_rate ON automation_management(success_rate) WHERE success_rate > 90 AND is_active = true;
CREATE INDEX idx_automation_management_low_success_rate ON automation_management(success_rate) WHERE success_rate < 70 AND is_active = true;

CREATE INDEX idx_performance_metrics_successful_executions ON automation_performance_metrics(automation_management_id, execution_timestamp) WHERE success = true;
CREATE INDEX idx_performance_metrics_failed_executions ON automation_performance_metrics(automation_management_id, execution_timestamp) WHERE success = false;
CREATE INDEX idx_performance_metrics_slow_executions ON automation_performance_metrics(execution_duration_ms) WHERE execution_duration_ms > 5000;

CREATE INDEX idx_approval_workflow_pending ON approval_workflow(automation_management_id, request_timestamp) WHERE status = 'PENDING';
CREATE INDEX idx_approval_workflow_approved ON approval_workflow(automation_management_id, approval_timestamp) WHERE status = 'APPROVED';
CREATE INDEX idx_approval_workflow_rejected ON approval_workflow(automation_management_id, rejection_timestamp) WHERE status = 'REJECTED';

CREATE INDEX idx_optimization_suggestions_pending ON optimization_suggestions(automation_management_id, created_at) WHERE review_status = 'PENDING';
CREATE INDEX idx_optimization_suggestions_approved ON optimization_suggestions(automation_management_id, reviewed_at) WHERE review_status = 'APPROVED';
CREATE INDEX idx_optimization_suggestions_high_confidence ON optimization_suggestions(confidence_score) WHERE confidence_score > 80;
CREATE INDEX idx_optimization_suggestions_high_impact ON optimization_suggestions(impact_level) WHERE impact_level IN ('HIGH', 'CRITICAL');

-- Create JSONB Indexes for Metadata Queries
CREATE INDEX idx_lifecycle_history_metadata_gin ON automation_lifecycle_history USING GIN (metadata);
CREATE INDEX idx_performance_metrics_metadata_gin ON automation_performance_metrics USING GIN (metadata);
CREATE INDEX idx_performance_metrics_affected_entities_gin ON automation_performance_metrics USING GIN (affected_entities);
CREATE INDEX idx_performance_metrics_resource_usage_gin ON automation_performance_metrics USING GIN (resource_usage);
CREATE INDEX idx_backup_metadata_gin ON automation_backup USING GIN (backup_metadata);
CREATE INDEX idx_backup_data_gin ON automation_backup USING GIN (backup_data);
CREATE INDEX idx_emergency_stop_metadata_gin ON emergency_stop_log USING GIN (metadata);
CREATE INDEX idx_emergency_stop_affected_automations_gin ON emergency_stop_log USING GIN (affected_automations);
CREATE INDEX idx_emergency_stop_recovery_actions_gin ON emergency_stop_log USING GIN (recovery_actions);
CREATE INDEX idx_optimization_suggestions_metadata_gin ON optimization_suggestions USING GIN (metadata);

-- Create Functional Indexes for Text Search
CREATE INDEX idx_automation_management_name_lower ON automation_management(LOWER(name));
CREATE INDEX idx_automation_management_description_lower ON automation_management(LOWER(description));
CREATE INDEX idx_optimization_suggestions_title_lower ON optimization_suggestions(LOWER(suggestion_title));
CREATE INDEX idx_optimization_suggestions_description_lower ON optimization_suggestions(LOWER(suggestion_description));

-- Create Indexes for Date Range Queries
CREATE INDEX idx_automation_management_created_date_range ON automation_management(created_at) WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
CREATE INDEX idx_performance_metrics_recent_executions ON automation_performance_metrics(execution_timestamp) WHERE execution_timestamp >= CURRENT_DATE - INTERVAL '7 days';
CREATE INDEX idx_approval_workflow_recent_requests ON approval_workflow(request_timestamp) WHERE request_timestamp >= CURRENT_DATE - INTERVAL '30 days';
CREATE INDEX idx_optimization_suggestions_recent_created ON optimization_suggestions(created_at) WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Add Comments for Documentation
COMMENT ON TABLE automation_management IS 'Core table for managing autonomous automation lifecycle and performance metrics';
COMMENT ON TABLE automation_lifecycle_history IS 'Audit trail for automation state transitions';
COMMENT ON TABLE approval_workflow IS 'User approval system for automation changes with safety mechanisms';
COMMENT ON TABLE automation_performance_metrics IS 'Detailed performance tracking for each automation execution';
COMMENT ON TABLE automation_backup IS 'Backup system for automation configurations and rollback capabilities';
COMMENT ON TABLE emergency_stop_log IS 'Emergency stop system for immediate automation termination';
COMMENT ON TABLE optimization_suggestions IS 'AI-generated optimization recommendations for automation improvements';

-- Add Column Comments
COMMENT ON COLUMN automation_management.lifecycle_state IS 'Current state: ACTIVE, PENDING, INACTIVE, RETIRED';
COMMENT ON COLUMN automation_management.performance_score IS 'AI-calculated performance score (0-100)';
COMMENT ON COLUMN automation_management.success_rate IS 'Percentage of successful executions (0-100)';
COMMENT ON COLUMN automation_management.average_execution_time_ms IS 'Average execution time in milliseconds';
COMMENT ON COLUMN approval_workflow.workflow_type IS 'Type of approval: CREATION, MODIFICATION, RETIREMENT';
COMMENT ON COLUMN approval_workflow.status IS 'Approval status: PENDING, APPROVED, REJECTED, CANCELLED';
COMMENT ON COLUMN approval_workflow.emergency_stop_triggered IS 'Flag indicating if emergency stop was triggered';
COMMENT ON COLUMN optimization_suggestions.suggestion_type IS 'Type of optimization: PERFORMANCE, EFFICIENCY, SAFETY, USER_EXPERIENCE';
COMMENT ON COLUMN optimization_suggestions.expected_impact IS 'Expected impact level: LOW, MEDIUM, HIGH, CRITICAL';
COMMENT ON COLUMN optimization_suggestions.confidence_score IS 'AI confidence in the suggestion (0-100)';
