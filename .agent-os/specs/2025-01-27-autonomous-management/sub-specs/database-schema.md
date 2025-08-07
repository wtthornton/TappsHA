# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-01-27-autonomous-management/spec.md

## New Tables Required

### 1. Automation Management Tables

#### `automation_management`
```sql
CREATE TABLE automation_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_assistant_automation_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lifecycle_state VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    performance_score DECIMAL(5,2),
    last_execution_time TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    average_execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    modified_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(home_assistant_automation_id)
);

CREATE INDEX idx_automation_management_lifecycle_state ON automation_management(lifecycle_state);
CREATE INDEX idx_automation_management_performance_score ON automation_management(performance_score);
CREATE INDEX idx_automation_management_last_execution_time ON automation_management(last_execution_time);
```

#### `automation_lifecycle_history`
```sql
CREATE TABLE automation_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_management(id),
    previous_state VARCHAR(50),
    new_state VARCHAR(50) NOT NULL,
    change_reason TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_reasoning TEXT,
    user_approval_required BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP
);

CREATE INDEX idx_automation_lifecycle_history_automation_id ON automation_lifecycle_history(automation_id);
CREATE INDEX idx_automation_lifecycle_history_changed_at ON automation_lifecycle_history(changed_at);
```

### 2. Approval Workflow Tables

#### `approval_workflow`
```sql
CREATE TABLE approval_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_management(id),
    workflow_type VARCHAR(50) NOT NULL, -- 'CREATION', 'MODIFICATION', 'RETIREMENT'
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
    priority VARCHAR(20) DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'CRITICAL'
    risk_level VARCHAR(20) DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description TEXT NOT NULL,
    ai_reasoning TEXT,
    proposed_changes JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    expires_at TIMESTAMP
);

CREATE INDEX idx_approval_workflow_status ON approval_workflow(status);
CREATE INDEX idx_approval_workflow_priority ON approval_workflow(priority);
CREATE INDEX idx_approval_workflow_risk_level ON approval_workflow(risk_level);
CREATE INDEX idx_approval_workflow_created_at ON approval_workflow(created_at);
```

#### `approval_workflow_approvers`
```sql
CREATE TABLE approval_workflow_approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflow(id),
    approver_id UUID REFERENCES users(id),
    approval_level INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    approved_at TIMESTAMP,
    comments TEXT,
    UNIQUE(workflow_id, approver_id)
);

CREATE INDEX idx_approval_workflow_approvers_workflow_id ON approval_workflow_approvers(workflow_id);
CREATE INDEX idx_approval_workflow_approvers_status ON approval_workflow_approvers(status);
```

### 3. Backup and Rollback Tables

#### `automation_backup`
```sql
CREATE TABLE automation_backup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_management(id),
    backup_name VARCHAR(255) NOT NULL,
    backup_type VARCHAR(50) NOT NULL, -- 'AUTOMATIC', 'MANUAL', 'BEFORE_CHANGE'
    configuration_snapshot JSONB NOT NULL,
    metadata JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    retention_days INTEGER DEFAULT 30
);

CREATE INDEX idx_automation_backup_automation_id ON automation_backup(automation_id);
CREATE INDEX idx_automation_backup_created_at ON automation_backup(created_at);
CREATE INDEX idx_automation_backup_is_active ON automation_backup(is_active);
```

#### `rollback_operation`
```sql
CREATE TABLE rollback_operation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_management(id),
    backup_id UUID REFERENCES automation_backup(id),
    rollback_reason TEXT NOT NULL,
    rollback_type VARCHAR(50) NOT NULL, -- 'MANUAL', 'AUTOMATIC', 'EMERGENCY'
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'FAILED'
    initiated_by UUID REFERENCES users(id),
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    rollback_configuration JSONB
);

CREATE INDEX idx_rollback_operation_automation_id ON rollback_operation(automation_id);
CREATE INDEX idx_rollback_operation_status ON rollback_operation(status);
CREATE INDEX idx_rollback_operation_initiated_at ON rollback_operation(initiated_at);
```

### 4. Audit Trail Tables

#### `automation_audit_trail`
```sql
CREATE TABLE automation_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_management(id),
    action_type VARCHAR(50) NOT NULL, -- 'CREATE', 'MODIFY', 'DELETE', 'ENABLE', 'DISABLE', 'EXECUTE'
    action_description TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ai_reasoning TEXT,
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    cryptographic_signature VARCHAR(255)
);

CREATE INDEX idx_automation_audit_trail_automation_id ON automation_audit_trail(automation_id);
CREATE INDEX idx_automation_audit_trail_action_type ON automation_audit_trail(action_type);
CREATE INDEX idx_automation_audit_trail_timestamp ON automation_audit_trail(timestamp);
CREATE INDEX idx_automation_audit_trail_user_id ON automation_audit_trail(user_id);
```

#### `ai_decision_audit`
```sql
CREATE TABLE ai_decision_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automation_management(id),
    decision_type VARCHAR(50) NOT NULL, -- 'SUGGESTION', 'OPTIMIZATION', 'RETIREMENT', 'CREATION'
    decision_description TEXT NOT NULL,
    ai_model_version VARCHAR(50),
    confidence_score DECIMAL(5,2),
    input_data JSONB,
    output_data JSONB,
    reasoning_explanation TEXT,
    user_feedback VARCHAR(50), -- 'APPROVED', 'REJECTED', 'MODIFIED', 'PENDING'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cryptographic_signature VARCHAR(255)
);

CREATE INDEX idx_ai_decision_audit_automation_id ON ai_decision_audit(automation_id);
CREATE INDEX idx_ai_decision_audit_decision_type ON ai_decision_audit(decision_type);
CREATE INDEX idx_ai_decision_audit_confidence_score ON ai_decision_audit(confidence_score);
CREATE INDEX idx_ai_decision_audit_created_at ON ai_decision_audit(created_at);
```

### 5. Safety Configuration Tables

#### `user_safety_configuration`
```sql
CREATE TABLE user_safety_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    automation_creation_approval_required BOOLEAN DEFAULT TRUE,
    automation_modification_approval_required BOOLEAN DEFAULT TRUE,
    automation_deletion_approval_required BOOLEAN DEFAULT TRUE,
    max_automations_per_day INTEGER DEFAULT 10,
    max_automations_per_week INTEGER DEFAULT 50,
    risk_threshold_high DECIMAL(5,2) DEFAULT 0.8,
    risk_threshold_medium DECIMAL(5,2) DEFAULT 0.6,
    emergency_stop_enabled BOOLEAN DEFAULT TRUE,
    audit_trail_enabled BOOLEAN DEFAULT TRUE,
    backup_retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_user_safety_configuration_user_id ON user_safety_configuration(user_id);
```

#### `safety_rule`
```sql
CREATE TABLE safety_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'AUTOMATION_LIMIT', 'RISK_THRESHOLD', 'APPROVAL_REQUIRED'
    rule_condition JSONB NOT NULL,
    rule_action VARCHAR(50) NOT NULL, -- 'BLOCK', 'WARN', 'REQUIRE_APPROVAL'
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_safety_rule_rule_type ON safety_rule(rule_type);
CREATE INDEX idx_safety_rule_is_active ON safety_rule(is_active);
CREATE INDEX idx_safety_rule_priority ON safety_rule(priority);
```

## Database Migrations

### Migration V004: Autonomous Management System
```sql
-- V004__create_autonomous_management_tables.sql

-- Create automation management tables
CREATE TABLE automation_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_assistant_automation_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lifecycle_state VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    performance_score DECIMAL(5,2),
    last_execution_time TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    average_execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    modified_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(home_assistant_automation_id)
);

-- Create all other tables as defined above
-- [Additional table creation statements...]

-- Create indexes for performance optimization
CREATE INDEX idx_automation_management_lifecycle_state ON automation_management(lifecycle_state);
CREATE INDEX idx_automation_management_performance_score ON automation_management(performance_score);
CREATE INDEX idx_automation_management_last_execution_time ON automation_management(last_execution_time);

-- [Additional index creation statements...]
```

## Data Integrity and Constraints

### Foreign Key Relationships
- All tables properly reference existing user and automation tables
- Cascade delete rules for cleanup operations
- Proper indexing for performance optimization

### Data Validation
- Lifecycle states must be valid enum values
- Performance scores must be between 0 and 100
- Risk levels must be valid enum values
- Timestamps must be in UTC format

### Performance Considerations
- Indexes on frequently queried columns
- Partitioning for large audit trail tables
- Archival strategy for old audit records
- Compression for JSONB columns with large data

## Security and Compliance

### Data Encryption
- All sensitive configuration data encrypted at rest
- Audit trail entries cryptographically signed
- User consent records encrypted and immutable

### Access Control
- Row-level security for user-specific data
- Audit trail for all data access
- Role-based access control for approval workflows

### Compliance Features
- GDPR-compliant data retention policies
- Immutable audit trails for regulatory compliance
- Data export capabilities for user requests
