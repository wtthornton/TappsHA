-- Test Database Initialization Script
-- This script sets up the test database for integration tests

-- Create test database if it doesn't exist
-- (PostgreSQL container creates the database automatically)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Set timezone for consistent testing
SET timezone = 'UTC';

-- Create test user if not exists (for additional testing scenarios)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'test_user') THEN
        CREATE ROLE test_user WITH LOGIN PASSWORD 'test_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE tappha_test TO test_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test_user;

-- Set search path for consistent testing
SET search_path TO public;

-- Create test-specific functions for data generation
CREATE OR REPLACE FUNCTION generate_test_uuid() RETURNS UUID AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_test_timestamp() RETURNS TIMESTAMP AS $$
BEGIN
    RETURN NOW();
END;
$$ LANGUAGE plpgsql;

-- Create test data helper functions
CREATE OR REPLACE FUNCTION create_test_automation_management(
    p_home_assistant_automation_id VARCHAR,
    p_name VARCHAR,
    p_description TEXT,
    p_lifecycle_state VARCHAR,
    p_performance_score DECIMAL,
    p_created_by UUID
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    v_id := uuid_generate_v4();
    
    INSERT INTO automation_management (
        id, home_assistant_automation_id, name, description, lifecycle_state,
        performance_score, last_execution_time, execution_count, success_rate,
        average_execution_time_ms, created_by, modified_by, version, is_active,
        created_at, modified_at
    ) VALUES (
        v_id, p_home_assistant_automation_id, p_name, p_description, p_lifecycle_state,
        p_performance_score, NOW(), 0, 0.0, 0, p_created_by, p_created_by, 1, true,
        NOW(), NOW()
    );
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Create test cleanup function
CREATE OR REPLACE FUNCTION cleanup_test_data() RETURNS VOID AS $$
BEGIN
    -- Clean up all test data
    DELETE FROM optimization_suggestions;
    DELETE FROM emergency_stop_log;
    DELETE FROM automation_backup;
    DELETE FROM automation_performance_metrics;
    DELETE FROM approval_workflow;
    DELETE FROM automation_lifecycle_history;
    DELETE FROM automation_management;
    
    -- Reset sequences if any
    -- (PostgreSQL handles this automatically with DELETE)
END;
$$ LANGUAGE plpgsql;

-- Create test data validation function
CREATE OR REPLACE FUNCTION validate_test_data() RETURNS TABLE(
    table_name VARCHAR,
    record_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'automation_management'::VARCHAR, COUNT(*)::BIGINT FROM automation_management
    UNION ALL
    SELECT 'automation_lifecycle_history'::VARCHAR, COUNT(*)::BIGINT FROM automation_lifecycle_history
    UNION ALL
    SELECT 'approval_workflow'::VARCHAR, COUNT(*)::BIGINT FROM approval_workflow
    UNION ALL
    SELECT 'automation_performance_metrics'::VARCHAR, COUNT(*)::BIGINT FROM automation_performance_metrics
    UNION ALL
    SELECT 'automation_backup'::VARCHAR, COUNT(*)::BIGINT FROM automation_backup
    UNION ALL
    SELECT 'emergency_stop_log'::VARCHAR, COUNT(*)::BIGINT FROM emergency_stop_log
    UNION ALL
    SELECT 'optimization_suggestions'::VARCHAR, COUNT(*)::BIGINT FROM optimization_suggestions;
END;
$$ LANGUAGE plpgsql;
