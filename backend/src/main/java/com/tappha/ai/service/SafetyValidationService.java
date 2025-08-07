package com.tappha.ai.service;

import com.tappha.ai.dto.AutomationSuggestion;

/**
 * Safety Validation Service Interface for Phase 2: Intelligence Engine
 * 
 * Handles safety validation and user approval workflows:
 * - AI suggestion safety validation
 * - User control preferences enforcement
 * - Safety thresholds and risk assessment
 * - Emergency stop mechanisms
 * 
 * Following Agent OS Standards with comprehensive safety controls
 */
public interface SafetyValidationService {

    /**
     * Validate AI suggestion safety
     * 
     * @param suggestion The automation suggestion to validate
     * @param userPreferences The user's control preferences
     * @return True if suggestion is safe and approved
     */
    Boolean validateSuggestion(AutomationSuggestion suggestion, String userPreferences);

    /**
     * Check safety thresholds for AI suggestions
     * 
     * @param suggestion The automation suggestion to check
     * @return True if suggestion meets safety thresholds
     */
    Boolean checkSafetyThresholds(AutomationSuggestion suggestion);

    /**
     * Assess risk level of automation suggestion
     * 
     * @param suggestion The automation suggestion to assess
     * @return Risk assessment score (0.0 to 1.0)
     */
    Double assessRiskLevel(AutomationSuggestion suggestion);

    /**
     * Validate user approval workflow
     * 
     * @param suggestion The automation suggestion to validate
     * @param userId The user ID for approval workflow
     * @return True if approval workflow is valid
     */
    Boolean validateApprovalWorkflow(AutomationSuggestion suggestion, String userId);

    /**
     * Get safety validation service health status
     * 
     * @return Health status information
     */
    String getHealthStatus();
} 