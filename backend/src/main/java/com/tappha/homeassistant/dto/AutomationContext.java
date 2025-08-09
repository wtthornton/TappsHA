package com.tappha.homeassistant.dto;

import com.tappha.homeassistant.entity.HomeAssistantEvent;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    private UUID connectionId;
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
    private Map<String, String> currentStates;
    private List<String> recentEvents;
    
    // Enhanced fields for context-aware suggestion generation
    private List<HomeAssistantEvent> events;
    private String userContext;
    private Map<String, Object> patternData;
    private Map<String, Object> userSettings;
} 