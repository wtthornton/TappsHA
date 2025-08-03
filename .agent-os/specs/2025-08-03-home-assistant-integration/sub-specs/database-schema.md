# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-03-home-assistant-integration/spec.md

## PostgreSQL Schema Changes

### New Tables

#### home_assistant_connections
```sql
CREATE TABLE home_assistant_connections (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    connection_status VARCHAR(50) DEFAULT 'DISCONNECTED',
    error_count INTEGER DEFAULT 0,
    last_error_message TEXT
);

CREATE INDEX idx_home_assistant_connections_active ON home_assistant_connections(is_active);
CREATE INDEX idx_home_assistant_connections_status ON home_assistant_connections(connection_status);
```

#### home_assistant_devices
```sql
CREATE TABLE home_assistant_devices (
    id BIGSERIAL PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    friendly_name VARCHAR(255),
    device_class VARCHAR(100),
    state_class VARCHAR(100),
    unit_of_measurement VARCHAR(50),
    domain VARCHAR(100) NOT NULL,
    area_id VARCHAR(255),
    capabilities JSONB,
    attributes JSONB,
    connection_id BIGINT REFERENCES home_assistant_connections(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_id, connection_id)
);

CREATE INDEX idx_home_assistant_devices_entity_id ON home_assistant_devices(entity_id);
CREATE INDEX idx_home_assistant_devices_domain ON home_assistant_devices(domain);
CREATE INDEX idx_home_assistant_devices_connection_id ON home_assistant_devices(connection_id);
```

#### home_assistant_events
```sql
CREATE TABLE home_assistant_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255),
    old_state JSONB,
    new_state JSONB,
    event_data JSONB,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    connection_id BIGINT REFERENCES home_assistant_connections(id),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_home_assistant_events_event_type ON home_assistant_events(event_type);
CREATE INDEX idx_home_assistant_events_entity_id ON home_assistant_events(entity_id);
CREATE INDEX idx_home_assistant_events_event_time ON home_assistant_events(event_time);
CREATE INDEX idx_home_assistant_events_connection_id ON home_assistant_events(connection_id);
```

#### home_assistant_states
```sql
CREATE TABLE home_assistant_states (
    id BIGSERIAL PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    attributes JSONB,
    last_changed TIMESTAMP WITH TIME ZONE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    connection_id BIGINT REFERENCES home_assistant_connections(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_home_assistant_states_entity_id ON home_assistant_states(entity_id);
CREATE INDEX idx_home_assistant_states_state ON home_assistant_states(state);
CREATE INDEX idx_home_assistant_states_last_changed ON home_assistant_states(last_changed);
CREATE INDEX idx_home_assistant_states_connection_id ON home_assistant_states(connection_id);
```

### Updated Tables

#### connection_health_metrics (New table for monitoring)
```sql
CREATE TABLE connection_health_metrics (
    id BIGSERIAL PRIMARY KEY,
    connection_id BIGINT REFERENCES home_assistant_connections(id),
    metric_name VARCHAR(255) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    metric_unit VARCHAR(50),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_connection_health_metrics_connection_id ON connection_health_metrics(connection_id);
CREATE INDEX idx_connection_health_metrics_metric_name ON connection_health_metrics(metric_name);
CREATE INDEX idx_connection_health_metrics_recorded_at ON connection_health_metrics(recorded_at);
```

## InfluxDB Schema

### Measurement: home_assistant_events
**Tags:**
- connection_id: String
- entity_id: String
- event_type: String
- domain: String

**Fields:**
- state_value: String
- numeric_value: Float (when applicable)
- event_count: Integer

**Example:**
```
home_assistant_events,connection_id=1,entity_id=light.living_room,event_type=state_changed,domain=light state_value="on",numeric_value=null,event_count=1 1640995200000000000
```

### Measurement: device_states
**Tags:**
- connection_id: String
- entity_id: String
- domain: String
- device_class: String

**Fields:**
- state: String
- numeric_value: Float (when applicable)
- battery_level: Integer (when applicable)
- temperature: Float (when applicable)

## Migration Strategy

### Phase 1: Schema Creation
1. Create all new tables with proper indexes
2. Add foreign key constraints
3. Create initial data migration scripts

### Phase 2: Data Migration
1. Implement data migration from existing systems (if any)
2. Validate data integrity after migration
3. Update application configuration to use new schema

### Phase 3: Performance Optimization
1. Analyze query performance
2. Add additional indexes as needed
3. Implement partitioning for large tables (if required)

## Data Retention Policy

### PostgreSQL
- **home_assistant_events:** Retain for 90 days (move to archive after)
- **home_assistant_states:** Retain current state only (historical in InfluxDB)
- **connection_health_metrics:** Retain for 30 days

### InfluxDB
- **home_assistant_events:** Retain for 1 year
- **device_states:** Retain for 1 year
- **Compression:** Enable compression after 7 days
- **Downsampling:** Downsample to 1-hour intervals after 30 days 