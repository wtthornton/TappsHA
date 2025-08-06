-- Migration: V002__create_ai_suggestion_engine_tables.sql
-- Description: Create tables for AI Suggestion Engine functionality

-- Create ai_suggestions table
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id) ON DELETE CASCADE,
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
CREATE INDEX idx_ai_suggestions_connection_id ON ai_suggestions(connection_id);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_suggestion_type ON ai_suggestions(suggestion_type);
CREATE INDEX idx_ai_suggestions_created_at ON ai_suggestions(created_at);
CREATE INDEX idx_ai_suggestions_connection_status ON ai_suggestions(connection_id, status);
CREATE INDEX idx_ai_suggestions_confidence_score ON ai_suggestions(confidence_score);

-- Create ai_suggestion_approvals table
CREATE TABLE ai_suggestion_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID NOT NULL REFERENCES ai_suggestions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'DEFERRED')),
    decision_reason TEXT,
    decided_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    implemented_at TIMESTAMP WITH TIME ZONE,
    rollback_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for ai_suggestion_approvals
CREATE INDEX idx_ai_suggestion_approvals_suggestion_id ON ai_suggestion_approvals(suggestion_id);
CREATE INDEX idx_ai_suggestion_approvals_user_id ON ai_suggestion_approvals(user_id);
CREATE INDEX idx_ai_suggestion_approvals_decision ON ai_suggestion_approvals(decision);
CREATE INDEX idx_ai_suggestion_approvals_decided_at ON ai_suggestion_approvals(decided_at);
CREATE INDEX idx_ai_suggestion_approvals_user_decision ON ai_suggestion_approvals(user_id, decision);

-- Create ai_batch_processing table
CREATE TABLE ai_batch_processing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id VARCHAR(36) NOT NULL UNIQUE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    suggestions_generated INTEGER DEFAULT 0 CHECK (suggestions_generated >= 0),
    errors_count INTEGER DEFAULT 0 CHECK (errors_count >= 0),
    pattern_data_source VARCHAR(100)
);

-- Create indexes for ai_batch_processing
CREATE INDEX idx_ai_batch_processing_batch_id ON ai_batch_processing(batch_id);
CREATE INDEX idx_ai_batch_processing_status ON ai_batch_processing(status);
CREATE INDEX idx_ai_batch_processing_start_time ON ai_batch_processing(start_time);
CREATE INDEX idx_ai_batch_processing_end_time ON ai_batch_processing(end_time);

-- Create ai_suggestion_feedback table
CREATE TABLE ai_suggestion_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID NOT NULL REFERENCES ai_suggestions(id) ON DELETE CASCADE,
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    user_comments TEXT,
    feedback_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    automation_performance_data JSONB
);

-- Create indexes for ai_suggestion_feedback
CREATE INDEX idx_ai_suggestion_feedback_suggestion_id ON ai_suggestion_feedback(suggestion_id);
CREATE INDEX idx_ai_suggestion_feedback_rating ON ai_suggestion_feedback(effectiveness_rating);
CREATE INDEX idx_ai_suggestion_feedback_date ON ai_suggestion_feedback(feedback_date);

-- Add constraints for data integrity
ALTER TABLE ai_suggestions ADD CONSTRAINT chk_ai_suggestions_title_not_empty CHECK (char_length(trim(title)) > 0);
ALTER TABLE ai_suggestions ADD CONSTRAINT chk_ai_suggestions_description_not_empty CHECK (char_length(trim(description)) > 0);

ALTER TABLE ai_suggestion_approvals ADD CONSTRAINT chk_ai_suggestion_approvals_implemented_after_decided 
    CHECK (implemented_at IS NULL OR implemented_at >= decided_at);
ALTER TABLE ai_suggestion_approvals ADD CONSTRAINT chk_ai_suggestion_approvals_rollback_after_implemented 
    CHECK (rollback_at IS NULL OR (implemented_at IS NOT NULL AND rollback_at >= implemented_at));

ALTER TABLE ai_batch_processing ADD CONSTRAINT chk_ai_batch_processing_end_after_start 
    CHECK (end_time IS NULL OR end_time >= start_time);
ALTER TABLE ai_batch_processing ADD CONSTRAINT chk_ai_batch_processing_batch_id_not_empty 
    CHECK (char_length(trim(batch_id)) > 0);

-- Add comments for documentation
COMMENT ON TABLE ai_suggestions IS 'Stores AI-generated automation suggestions with metadata and processing status';
COMMENT ON COLUMN ai_suggestions.suggestion_type IS 'Type of suggestion: optimization, new automation, schedule adjustment, or trigger refinement';
COMMENT ON COLUMN ai_suggestions.automation_config IS 'JSON configuration for the proposed automation';
COMMENT ON COLUMN ai_suggestions.confidence_score IS 'AI confidence score for the suggestion (0.0 to 1.0)';
COMMENT ON COLUMN ai_suggestions.status IS 'Current status of the suggestion in the approval workflow';

COMMENT ON TABLE ai_suggestion_approvals IS 'Tracks user approval decisions and implementation status for AI suggestions';
COMMENT ON COLUMN ai_suggestion_approvals.decision IS 'User decision: approved, rejected, or deferred';
COMMENT ON COLUMN ai_suggestion_approvals.decision_reason IS 'User-provided reason for the approval decision';

COMMENT ON TABLE ai_batch_processing IS 'Tracks AI batch processing jobs and their execution status';
COMMENT ON COLUMN ai_batch_processing.batch_id IS 'Unique identifier for the batch processing job';
COMMENT ON COLUMN ai_batch_processing.pattern_data_source IS 'Source of pattern data used for suggestion generation';

COMMENT ON TABLE ai_suggestion_feedback IS 'Stores user feedback on implemented AI suggestions for model improvement';
COMMENT ON COLUMN ai_suggestion_feedback.effectiveness_rating IS 'User rating of suggestion effectiveness (1-5 scale)';
COMMENT ON COLUMN ai_suggestion_feedback.automation_performance_data IS 'JSON data about automation execution performance';