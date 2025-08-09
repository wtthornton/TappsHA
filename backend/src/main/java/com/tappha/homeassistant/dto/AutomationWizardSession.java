package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation wizard session
 * Represents a complete wizard session for automation creation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationWizardSession {
    
    private String sessionId;
    private String userId;
    private UUID connectionId;
    private int currentStep;
    private String status; // active, completed, cancelled
    private long createdAt;
    private Long completedAt;
    private List<AutomationWizardStep> steps;
    private Map<Integer, AutomationValidationResult> validationResults;
    private Map<String, Object> metadata;
}
