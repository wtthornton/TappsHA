package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation preview request
 * Represents a request to preview automation changes before applying them
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationPreviewRequest {
    private String automationId;
    private String userId;
    private UUID connectionId;
    private String modificationType;
    private String modificationDescription;
    private Map<String, Object> proposedChanges;
    private Map<String, Object> currentConfiguration;
    private boolean includeSimulation;
    private boolean includeValidation;
    private boolean includeImpactAnalysis;
    private Map<String, Object> previewOptions;
    private Map<String, Object> metadata;
}
