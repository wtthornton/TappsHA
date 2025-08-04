package com.tappha.homeassistant.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Context for AI automation suggestions
 * Contains information about the current automation state and event
 */
@Data
@Builder
public class AutomationContext {
    
    private String entityId;
    private String eventType;
    private String oldState;
    private String newState;
    private Long timestamp;
    private String userId;
    private String automationId;
    private String triggerType;
    private String conditionType;
    private String actionType;
    private String attributes;
    private String metadata;
} 