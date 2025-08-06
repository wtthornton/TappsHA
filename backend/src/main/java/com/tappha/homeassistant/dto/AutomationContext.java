package com.tappha.homeassistant.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * Context for AI automation suggestions
 * Contains information about the current automation state and event
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationContext {
    
    private String contextId;
    private String patternType;
    private List<String> entityIds;
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