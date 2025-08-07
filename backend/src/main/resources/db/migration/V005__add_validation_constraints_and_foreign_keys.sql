-- Migration: V005__add_validation_constraints_and_foreign_keys.sql
-- Description: Add data validation constraints and foreign key relationships for autonomous management system
-- Created: 2025-01-27
-- Author: TappHA Development Team

-- Data Validation Constraints for Automation Management Table

-- Check constraints for lifecycle_state
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_lifecycle_state 
CHECK (lifecycle_state IN ('ACTIVE', 'PENDING', 'INACTIVE', 'RETIRED'));

-- Check constraints for performance_score (0-100)
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_performance_score 
CHECK (performance_score IS NULL OR (performance_score >= 0 AND performance_score <= 100));

-- Check constraints for success_rate (0-100)
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_success_rate 
CHECK (success_rate IS NULL OR (success_rate >= 0 AND success_rate <= 100));

-- Check constraints for execution_count (non-negative)
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_execution_count 
CHECK (execution_count >= 0);

-- Check constraints for average_execution_time_ms (non-negative)
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_average_execution_time 
CHECK (average_execution_time_ms IS NULL OR average_execution_time_ms >= 0);

-- Check constraints for version (positive)
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_version 
CHECK (version > 0);

-- Check constraints for name length
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_name_length 
CHECK (LENGTH(TRIM(name)) >= 1 AND LENGTH(name) <= 255);

-- Check constraints for home_assistant_automation_id format
ALTER TABLE automation_management 
ADD CONSTRAINT chk_automation_management_ha_id_format 
CHECK (home_assistant_automation_id ~ '^[a-zA-Z0-9_-]+$');

-- Data Validation Constraints for Automation Lifecycle History Table

-- Check constraints for new_state
ALTER TABLE automation_lifecycle_history 
ADD CONSTRAINT chk_lifecycle_history_new_state 
CHECK (new_state IN ('ACTIVE', 'PENDING', 'INACTIVE', 'RETIRED'));

-- Check constraints for previous_state
ALTER TABLE automation_lifecycle_history 
ADD CONSTRAINT chk_lifecycle_history_previous_state 
CHECK (previous_state IS NULL OR previous_state IN ('ACTIVE', 'PENDING', 'INACTIVE', 'RETIRED'));

-- Check constraints for transition_reason length
ALTER TABLE automation_lifecycle_history 
ADD CONSTRAINT chk_lifecycle_history_reason_length 
CHECK (transition_reason IS NULL OR LENGTH(TRIM(transition_reason)) >= 1);

-- Data Validation Constraints for Approval Workflow Table

-- Check constraints for workflow_type
ALTER TABLE approval_workflow 
ADD CONSTRAINT chk_approval_workflow_type 
CHECK (workflow_type IN ('CREATION', 'MODIFICATION', 'RETIREMENT'));

-- Check constraints for status
ALTER TABLE approval_workflow 
ADD CONSTRAINT chk_approval_workflow_status 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'));

-- Check constraints for approval_notes length
ALTER TABLE approval_workflow 
ADD CONSTRAINT chk_approval_workflow_approval_notes_length 
CHECK (approval_notes IS NULL OR LENGTH(TRIM(approval_notes)) >= 1);

-- Check constraints for rejection_reason length
ALTER TABLE approval_workflow 
ADD CONSTRAINT chk_approval_workflow_rejection_reason_length 
CHECK (rejection_reason IS NULL OR LENGTH(TRIM(rejection_reason)) >= 1);

-- Check constraints for emergency_stop_reason length
ALTER TABLE approval_workflow 
ADD CONSTRAINT chk_approval_workflow_emergency_stop_reason_length 
CHECK (emergency_stop_reason IS NULL OR LENGTH(TRIM(emergency_stop_reason)) >= 1);

-- Data Validation Constraints for Automation Performance Metrics Table

-- Check constraints for execution_duration_ms (non-negative)
ALTER TABLE automation_performance_metrics 
ADD CONSTRAINT chk_performance_metrics_execution_duration 
CHECK (execution_duration_ms IS NULL OR execution_duration_ms >= 0);

-- Check constraints for performance_score (0-100)
ALTER TABLE automation_performance_metrics 
ADD CONSTRAINT chk_performance_metrics_performance_score 
CHECK (performance_score IS NULL OR (performance_score >= 0 AND performance_score <= 100));

-- Check constraints for trigger_source length
ALTER TABLE automation_performance_metrics 
ADD CONSTRAINT chk_performance_metrics_trigger_source_length 
CHECK (trigger_source IS NULL OR LENGTH(TRIM(trigger_source)) >= 1);

-- Check constraints for error_message length
ALTER TABLE automation_performance_metrics 
ADD CONSTRAINT chk_performance_metrics_error_message_length 
CHECK (error_message IS NULL OR LENGTH(TRIM(error_message)) >= 1);

-- Data Validation Constraints for Automation Backup Table

-- Check constraints for backup_type
ALTER TABLE automation_backup 
ADD CONSTRAINT chk_backup_type 
CHECK (backup_type IN ('AUTOMATIC', 'MANUAL', 'BEFORE_MODIFICATION'));

-- Check constraints for backup_size_bytes (non-negative)
ALTER TABLE automation_backup 
ADD CONSTRAINT chk_backup_size_bytes 
CHECK (backup_size_bytes IS NULL OR backup_size_bytes >= 0);

-- Check constraints for backup_name length
ALTER TABLE automation_backup 
ADD CONSTRAINT chk_backup_name_length 
CHECK (backup_name IS NULL OR (LENGTH(TRIM(backup_name)) >= 1 AND LENGTH(backup_name) <= 255));

-- Check constraints for backup_description length
ALTER TABLE automation_backup 
ADD CONSTRAINT chk_backup_description_length 
CHECK (backup_description IS NULL OR LENGTH(TRIM(backup_description)) >= 1);

-- Data Validation Constraints for Emergency Stop Log Table

-- Check constraints for stop_type
ALTER TABLE emergency_stop_log 
ADD CONSTRAINT chk_emergency_stop_type 
CHECK (stop_type IN ('MANUAL', 'AUTOMATIC', 'SYSTEM', 'EMERGENCY'));

-- Check constraints for recovery_status
ALTER TABLE emergency_stop_log 
ADD CONSTRAINT chk_emergency_stop_recovery_status 
CHECK (recovery_status IS NULL OR recovery_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'));

-- Check constraints for trigger_source
ALTER TABLE emergency_stop_log 
ADD CONSTRAINT chk_emergency_stop_trigger_source 
CHECK (trigger_source IS NULL OR trigger_source IN ('MANUAL', 'AUTOMATIC', 'SYSTEM'));

-- Check constraints for stop_reason length
ALTER TABLE emergency_stop_log 
ADD CONSTRAINT chk_emergency_stop_reason_length 
CHECK (LENGTH(TRIM(stop_reason)) >= 1);

-- Data Validation Constraints for Optimization Suggestions Table

-- Check constraints for suggestion_type
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_type 
CHECK (suggestion_type IN ('PERFORMANCE', 'EFFICIENCY', 'SAFETY', 'USER_EXPERIENCE'));

-- Check constraints for review_status
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_review_status 
CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED'));

-- Check constraints for confidence_score (0-100)
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_confidence_score 
CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100));

-- Check constraints for expected_impact
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_expected_impact 
CHECK (expected_impact IS NULL OR expected_impact IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

-- Check constraints for impact_level
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_impact_level 
CHECK (impact_level IS NULL OR impact_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

-- Check constraints for suggestion_title length
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_title_length 
CHECK (LENGTH(TRIM(suggestion_title)) >= 1 AND LENGTH(suggestion_title) <= 255);

-- Check constraints for suggestion_description length
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_description_length 
CHECK (LENGTH(TRIM(suggestion_description)) >= 1);

-- Check constraints for implementation_notes length
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_implementation_notes_length 
CHECK (implementation_notes IS NULL OR LENGTH(TRIM(implementation_notes)) >= 1);

-- Enhanced Foreign Key Relationships

-- Add foreign key constraints for user references (assuming users table exists)
-- Note: These are commented out as they depend on a users table that may not exist yet
-- ALTER TABLE automation_management 
-- ADD CONSTRAINT fk_automation_management_created_by 
-- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE automation_management 
-- ADD CONSTRAINT fk_automation_management_modified_by 
-- FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE automation_lifecycle_history 
-- ADD CONSTRAINT fk_lifecycle_history_transitioned_by 
-- FOREIGN KEY (transitioned_by) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE approval_workflow 
-- ADD CONSTRAINT fk_approval_workflow_requested_by 
-- FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE approval_workflow 
-- ADD CONSTRAINT fk_approval_workflow_approved_by 
-- FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE approval_workflow 
-- ADD CONSTRAINT fk_approval_workflow_rejected_by 
-- FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE automation_backup 
-- ADD CONSTRAINT fk_backup_created_by 
-- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE emergency_stop_log 
-- ADD CONSTRAINT fk_emergency_stop_triggered_by 
-- FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE optimization_suggestions 
-- ADD CONSTRAINT fk_optimization_suggestions_created_by 
-- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ALTER TABLE optimization_suggestions 
-- ADD CONSTRAINT fk_optimization_suggestions_reviewed_by 
-- FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Business Logic Constraints

-- Ensure only one active workflow per automation at a time
CREATE UNIQUE INDEX idx_approval_workflow_unique_active 
ON approval_workflow (automation_management_id) 
WHERE status = 'PENDING';

-- Ensure only one pending optimization suggestion per automation at a time
CREATE UNIQUE INDEX idx_optimization_suggestions_unique_pending 
ON optimization_suggestions (automation_management_id, suggestion_type) 
WHERE review_status = 'PENDING';

-- Ensure backup names are unique per automation
CREATE UNIQUE INDEX idx_backup_unique_name_per_automation 
ON automation_backup (automation_management_id, backup_name) 
WHERE backup_name IS NOT NULL;

-- Ensure emergency stop logs have valid timestamps
ALTER TABLE emergency_stop_log 
ADD CONSTRAINT chk_emergency_stop_timestamps 
CHECK (trigger_timestamp <= COALESCE(recovery_timestamp, trigger_timestamp));

-- Ensure approval workflow timestamps are consistent
ALTER TABLE approval_workflow 
ADD CONSTRAINT chk_approval_workflow_timestamps 
CHECK (
    (status = 'PENDING' AND approval_timestamp IS NULL AND rejection_timestamp IS NULL) OR
    (status = 'APPROVED' AND approval_timestamp IS NOT NULL AND rejection_timestamp IS NULL) OR
    (status = 'REJECTED' AND approval_timestamp IS NULL AND rejection_timestamp IS NOT NULL) OR
    (status = 'CANCELLED' AND approval_timestamp IS NULL AND rejection_timestamp IS NULL)
);

-- Ensure optimization suggestions have valid review timestamps
ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_review_timestamps 
CHECK (
    (review_status = 'PENDING' AND reviewed_at IS NULL AND reviewed_by IS NULL) OR
    (review_status IN ('APPROVED', 'REJECTED', 'IMPLEMENTED') AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL)
);

-- Ensure performance metrics have valid execution duration
ALTER TABLE automation_performance_metrics 
ADD CONSTRAINT chk_performance_metrics_valid_duration 
CHECK (execution_duration_ms IS NULL OR execution_duration_ms >= 0);

-- Ensure backup data is not empty
ALTER TABLE automation_backup 
ADD CONSTRAINT chk_backup_data_not_empty 
CHECK (backup_data IS NOT NULL AND backup_data != '{}');

-- Ensure JSONB fields are valid JSON
ALTER TABLE automation_lifecycle_history 
ADD CONSTRAINT chk_lifecycle_history_valid_json 
CHECK (metadata IS NULL OR jsonb_typeof(metadata) = 'object');

ALTER TABLE automation_performance_metrics 
ADD CONSTRAINT chk_performance_metrics_valid_json 
CHECK (
    (metadata IS NULL OR jsonb_typeof(metadata) = 'object') AND
    (affected_entities IS NULL OR jsonb_typeof(affected_entities) = 'object') AND
    (resource_usage IS NULL OR jsonb_typeof(resource_usage) = 'object')
);

ALTER TABLE automation_backup 
ADD CONSTRAINT chk_backup_valid_json 
CHECK (
    (backup_metadata IS NULL OR jsonb_typeof(backup_metadata) = 'object') AND
    jsonb_typeof(backup_data) = 'object'
);

ALTER TABLE emergency_stop_log 
ADD CONSTRAINT chk_emergency_stop_valid_json 
CHECK (
    (metadata IS NULL OR jsonb_typeof(metadata) = 'object') AND
    (affected_automations IS NULL OR jsonb_typeof(affected_automations) = 'object') AND
    (recovery_actions IS NULL OR jsonb_typeof(recovery_actions) = 'object')
);

ALTER TABLE optimization_suggestions 
ADD CONSTRAINT chk_optimization_suggestions_valid_json 
CHECK (metadata IS NULL OR jsonb_typeof(metadata) = 'object');

-- Add Comments for Constraints
COMMENT ON CONSTRAINT chk_automation_management_lifecycle_state ON automation_management IS 'Ensures lifecycle_state is one of the valid enum values';
COMMENT ON CONSTRAINT chk_automation_management_performance_score ON automation_management IS 'Ensures performance_score is between 0 and 100';
COMMENT ON CONSTRAINT chk_automation_management_success_rate ON automation_management IS 'Ensures success_rate is between 0 and 100';
COMMENT ON CONSTRAINT chk_automation_management_execution_count ON automation_management IS 'Ensures execution_count is non-negative';
COMMENT ON CONSTRAINT chk_automation_management_average_execution_time ON automation_management IS 'Ensures average_execution_time_ms is non-negative';
COMMENT ON CONSTRAINT chk_automation_management_version ON automation_management IS 'Ensures version is positive';
COMMENT ON CONSTRAINT chk_automation_management_name_length ON automation_management IS 'Ensures name is not empty and within length limits';
COMMENT ON CONSTRAINT chk_automation_management_ha_id_format ON automation_management IS 'Ensures Home Assistant automation ID follows valid format';

COMMENT ON CONSTRAINT chk_lifecycle_history_new_state ON automation_lifecycle_history IS 'Ensures new_state is one of the valid enum values';
COMMENT ON CONSTRAINT chk_lifecycle_history_previous_state ON automation_lifecycle_history IS 'Ensures previous_state is one of the valid enum values or null';

COMMENT ON CONSTRAINT chk_approval_workflow_type ON approval_workflow IS 'Ensures workflow_type is one of the valid enum values';
COMMENT ON CONSTRAINT chk_approval_workflow_status ON approval_workflow IS 'Ensures status is one of the valid enum values';

COMMENT ON CONSTRAINT chk_performance_metrics_execution_duration ON automation_performance_metrics IS 'Ensures execution_duration_ms is non-negative';
COMMENT ON CONSTRAINT chk_performance_metrics_performance_score ON automation_performance_metrics IS 'Ensures performance_score is between 0 and 100';

COMMENT ON CONSTRAINT chk_backup_type ON automation_backup IS 'Ensures backup_type is one of the valid enum values';
COMMENT ON CONSTRAINT chk_backup_size_bytes ON automation_backup IS 'Ensures backup_size_bytes is non-negative';

COMMENT ON CONSTRAINT chk_emergency_stop_type ON emergency_stop_log IS 'Ensures stop_type is one of the valid enum values';
COMMENT ON CONSTRAINT chk_emergency_stop_recovery_status ON emergency_stop_log IS 'Ensures recovery_status is one of the valid enum values';

COMMENT ON CONSTRAINT chk_optimization_suggestions_type ON optimization_suggestions IS 'Ensures suggestion_type is one of the valid enum values';
COMMENT ON CONSTRAINT chk_optimization_suggestions_review_status ON optimization_suggestions IS 'Ensures review_status is one of the valid enum values';
COMMENT ON CONSTRAINT chk_optimization_suggestions_confidence_score ON optimization_suggestions IS 'Ensures confidence_score is between 0 and 100';
