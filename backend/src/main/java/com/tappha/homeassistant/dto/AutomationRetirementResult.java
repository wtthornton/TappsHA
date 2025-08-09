package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation retirement result
 * Represents the result of an automation retirement operation with dependency resolution
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationRetirementResult {
    private boolean success;
    private String errorMessage;
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String retirementType;
    private String retirementReason;
    private long retirementTimestamp;
    private long scheduledRetirementTime;
    private boolean forceRetirement;
    private boolean createReplacement;
    private String replacementAutomationId;
    private List<String> resolvedDependencies;
    private List<String> unresolvedDependencies;
    private List<String> affectedAutomations;
    private Map<String, Object> dependencyAnalysis;
    private Map<String, Object> safetyValidation;
    private Map<String, Object> resultData;
    private Map<String, Object> metadata;
}
