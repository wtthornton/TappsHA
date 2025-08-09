package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation dependency
 * Represents a dependency relationship between automations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationDependency {
    private String dependencyId;
    private String sourceAutomationId;
    private String targetAutomationId;
    private UUID connectionId;
    private String dependencyType; // trigger, condition, action, data
    private String dependencyDirection; // incoming, outgoing, bidirectional
    private String dependencyStrength; // strong, weak, optional
    private String dependencyDescription;
    private Map<String, Object> dependencyData;
    private boolean isActive;
    private long createdAt;
    private long updatedAt;
    private Map<String, Object> metadata;
}
