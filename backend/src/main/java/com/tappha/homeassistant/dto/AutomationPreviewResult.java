package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation preview result
 * Represents the result of previewing automation changes with validation and simulation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationPreviewResult {
    private boolean success;
    private String errorMessage;
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String modificationType;
    private String modificationDescription;
    private long previewTimestamp;
    
    // Preview data
    private Map<String, Object> currentConfiguration;
    private Map<String, Object> proposedConfiguration;
    private Map<String, Object> changes;
    private List<String> addedFields;
    private List<String> removedFields;
    private List<String> modifiedFields;
    
    // Validation results
    private boolean isValid;
    private List<String> validationErrors;
    private List<String> validationWarnings;
    private Map<String, Object> validationData;
    
    // Simulation results
    private boolean simulationSuccessful;
    private Map<String, Object> simulationResults;
    private List<String> simulationErrors;
    private Map<String, Object> performanceMetrics;
    
    // Impact analysis
    private Map<String, Object> impactAnalysis;
    private List<String> affectedEntities;
    private List<String> potentialConflicts;
    private Map<String, Object> riskAssessment;
    
    // Preview metadata
    private Map<String, Object> previewMetadata;
    private String previewId;
    private boolean canApply;
    private String applyReason;
}
