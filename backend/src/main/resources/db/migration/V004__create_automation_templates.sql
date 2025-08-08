-- Migration: V004__create_automation_templates.sql
-- Description: Create automation templates for Phase 3 autonomous management
-- Created: 2025-01-27
-- Phase: 3 - Autonomous Management

-- Automation Templates Table
CREATE TABLE automation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- 'basic', 'advanced', 'ai_generated'
    template_data JSONB NOT NULL,
    parameters JSONB, -- Template parameters for customization
    tags TEXT[], -- Array of tags for categorization
    difficulty_level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    estimated_time_minutes INTEGER,
    safety_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    required_devices TEXT[], -- Array of required device types
    required_entities TEXT[], -- Array of required entity IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2), -- Percentage of successful deployments
    average_rating DECIMAL(3,2), -- User rating (1.0-5.0)
    CONSTRAINT automation_templates_name_unique UNIQUE (name)
);

-- Template Categories Table
CREATE TABLE template_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES template_categories(id),
    icon VARCHAR(100),
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template Parameters Table
CREATE TABLE template_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES automation_templates(id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL,
    parameter_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'entity', 'time'
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    default_value TEXT,
    required BOOLEAN DEFAULT false,
    validation_rules JSONB, -- JSON validation rules
    options JSONB, -- Available options for select/radio parameters
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT template_parameters_unique UNIQUE (template_id, parameter_name)
);

-- Template Usage Tracking Table
CREATE TABLE template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES automation_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    connection_id UUID NOT NULL REFERENCES home_assistant_connections(id),
    deployment_success BOOLEAN NOT NULL,
    deployment_time_ms INTEGER,
    error_message TEXT,
    user_rating INTEGER, -- 1-5 rating
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Template Ratings Table
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES automation_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT template_ratings_unique UNIQUE (template_id, user_id)
);

-- Template Favorites Table
CREATE TABLE template_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES automation_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT template_favorites_unique UNIQUE (template_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_automation_templates_category ON automation_templates(category);
CREATE INDEX idx_automation_templates_type ON automation_templates(template_type);
CREATE INDEX idx_automation_templates_difficulty ON automation_templates(difficulty_level);
CREATE INDEX idx_automation_templates_safety ON automation_templates(safety_level);
CREATE INDEX idx_automation_templates_active ON automation_templates(is_active);
CREATE INDEX idx_automation_templates_usage_count ON automation_templates(usage_count DESC);
CREATE INDEX idx_automation_templates_rating ON automation_templates(average_rating DESC);
CREATE INDEX idx_automation_templates_tags ON automation_templates USING GIN(tags);
CREATE INDEX idx_automation_templates_required_devices ON automation_templates USING GIN(required_devices);
CREATE INDEX idx_automation_templates_required_entities ON automation_templates USING GIN(required_entities);

CREATE INDEX idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX idx_template_usage_user_id ON template_usage(user_id);
CREATE INDEX idx_template_usage_connection_id ON template_usage(connection_id);
CREATE INDEX idx_template_usage_created_at ON template_usage(created_at DESC);

CREATE INDEX idx_template_ratings_template_id ON template_ratings(template_id);
CREATE INDEX idx_template_ratings_user_id ON template_ratings(user_id);
CREATE INDEX idx_template_ratings_rating ON template_ratings(rating);

CREATE INDEX idx_template_favorites_user_id ON template_favorites(user_id);
CREATE INDEX idx_template_favorites_template_id ON template_favorites(template_id);

-- Insert default template categories
INSERT INTO template_categories (name, description, icon, color, sort_order) VALUES
('Lighting', 'Automation templates for lighting control', 'lightbulb', '#FFD700', 1),
('Security', 'Security and safety automation templates', 'shield', '#FF4444', 2),
('Climate', 'HVAC and climate control templates', 'thermometer', '#00AAFF', 3),
('Entertainment', 'Media and entertainment automation', 'tv', '#AA00FF', 4),
('Energy', 'Energy saving and optimization templates', 'battery', '#00FF00', 5),
('Convenience', 'General convenience and comfort templates', 'star', '#FF8800', 6),
('Monitoring', 'Monitoring and alerting templates', 'eye', '#8800FF', 7),
('AI Generated', 'AI-generated automation templates', 'robot', '#FF0088', 8);

-- Insert sample automation templates
INSERT INTO automation_templates (name, description, category, template_type, template_data, parameters, tags, difficulty_level, estimated_time_minutes, safety_level, required_devices, required_entities) VALUES
(
    'Morning Light Routine',
    'Gradually increase bedroom lights in the morning to simulate sunrise',
    'Lighting',
    'basic',
    '{"trigger": {"platform": "time", "at": "06:30:00"}, "action": {"service": "light.turn_on", "target": {"entity_id": "light.bedroom"}, "data": {"brightness": 10, "transition": 300}}}, {"condition": {"platform": "time", "after": "06:30:00", "before": "07:00:00"}}',
    '{"wake_time": {"type": "time", "default": "06:30:00", "required": true}, "light_entity": {"type": "entity", "default": "light.bedroom", "required": true}, "brightness": {"type": "number", "default": 10, "min": 1, "max": 255, "required": true}}',
    ARRAY['morning', 'lighting', 'routine', 'wake-up'],
    'beginner',
    5,
    'low',
    ARRAY['light'],
    ARRAY['light.bedroom']
),
(
    'Away Mode Security',
    'Activate security measures when no one is home',
    'Security',
    'basic',
    '{"trigger": {"platform": "state", "entity_id": "input_boolean.away_mode", "to": "on"}, "action": [{"service": "light.turn_off", "target": {"entity_id": "all"}}, {"service": "climate.set_preset_mode", "target": {"entity_id": "climate.home"}, "data": {"preset_mode": "away"}}, {"service": "alarm_control_panel.arm_away", "target": {"entity_id": "alarm_control_panel.home"}}]}',
    '{"away_entity": {"type": "entity", "default": "input_boolean.away_mode", "required": true}, "alarm_entity": {"type": "entity", "default": "alarm_control_panel.home", "required": false}, "climate_entity": {"type": "entity", "default": "climate.home", "required": false}}',
    ARRAY['security', 'away', 'automation', 'safety'],
    'intermediate',
    10,
    'medium',
    ARRAY['light', 'climate', 'alarm_control_panel'],
    ARRAY['input_boolean.away_mode', 'alarm_control_panel.home', 'climate.home']
),
(
    'Energy Saving Mode',
    'Optimize energy usage based on occupancy and time',
    'Energy',
    'advanced',
    '{"trigger": [{"platform": "time", "at": "22:00:00"}, {"platform": "state", "entity_id": "binary_sensor.occupancy", "to": "off"}], "action": [{"service": "light.turn_off", "target": {"entity_id": "light.living_room"}}, {"service": "climate.set_temperature", "target": {"entity_id": "climate.home"}, "data": {"temperature": 18}}], "condition": {"platform": "time", "after": "22:00:00", "before": "06:00:00"}}',
    '{"occupancy_sensor": {"type": "entity", "default": "binary_sensor.occupancy", "required": true}, "sleep_time": {"type": "time", "default": "22:00:00", "required": true}, "wake_time": {"type": "time", "default": "06:00:00", "required": true}, "sleep_temperature": {"type": "number", "default": 18, "min": 16, "max": 22, "required": true}}',
    ARRAY['energy', 'saving', 'optimization', 'occupancy'],
    'advanced',
    15,
    'low',
    ARRAY['light', 'climate', 'binary_sensor'],
    ARRAY['binary_sensor.occupancy', 'climate.home', 'light.living_room']
),
(
    'Smart Door Lock',
    'Automatically lock doors when leaving and unlock when arriving',
    'Security',
    'intermediate',
    '{"trigger": {"platform": "state", "entity_id": "binary_sensor.front_door", "to": "on"}, "action": [{"service": "lock.unlock", "target": {"entity_id": "lock.front_door"}}, {"delay": "00:00:30"}, {"service": "lock.lock", "target": {"entity_id": "lock.front_door"}}], "condition": {"platform": "state", "entity_id": "device_tracker.phone", "state": "home"}}',
    '{"door_sensor": {"type": "entity", "default": "binary_sensor.front_door", "required": true}, "lock_entity": {"type": "entity", "default": "lock.front_door", "required": true}, "phone_tracker": {"type": "entity", "default": "device_tracker.phone", "required": true}, "delay_seconds": {"type": "number", "default": 30, "min": 10, "max": 120, "required": true}}',
    ARRAY['security', 'door', 'lock', 'arrival', 'departure'],
    'intermediate',
    12,
    'high',
    ARRAY['lock', 'binary_sensor', 'device_tracker'],
    ARRAY['binary_sensor.front_door', 'lock.front_door', 'device_tracker.phone']
),
(
    'Movie Mode',
    'Create the perfect movie watching environment',
    'Entertainment',
    'basic',
    '{"trigger": {"platform": "state", "entity_id": "media_player.tv", "to": "playing"}, "action": [{"service": "light.turn_off", "target": {"entity_id": "light.living_room"}}, {"service": "climate.set_temperature", "target": {"entity_id": "climate.living_room"}, "data": {"temperature": 22}}, {"service": "cover.close_cover", "target": {"entity_id": "cover.blinds"}}]}',
    '{"tv_entity": {"type": "entity", "default": "media_player.tv", "required": true}, "light_entities": {"type": "entity_list", "default": ["light.living_room"], "required": true}, "climate_entity": {"type": "entity", "default": "climate.living_room", "required": false}, "blinds_entity": {"type": "entity", "default": "cover.blinds", "required": false}, "movie_temperature": {"type": "number", "default": 22, "min": 18, "max": 26, "required": true}}',
    ARRAY['entertainment', 'movie', 'theater', 'comfort'],
    'beginner',
    8,
    'low',
    ARRAY['media_player', 'light', 'climate', 'cover'],
    ARRAY['media_player.tv', 'light.living_room', 'climate.living_room', 'cover.blinds']
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_automation_templates_updated_at BEFORE UPDATE ON automation_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_template_ratings_updated_at BEFORE UPDATE ON template_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
