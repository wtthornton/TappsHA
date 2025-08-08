package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Automation Generation Response DTO
 * 
 * Contains the generated automation suggestion with quality assessment
 * and approval workflow information.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationGenerationResponse {
    
    /**
     * Unique identifier for the suggestion
     */
    private UUID suggestionId;
    
    /**
     * Generated automation configuration in YAML format
     */
    private String automation;
    
    /**
     * Quality assessment of the generated automation
     */
    private QualityAssessment qualityAssessment;
    
    /**
     * Template used for generation
     */
    private AutomationTemplate template;
    
    /**
     * Confidence score (0.0 to 1.0) for the suggestion
     */
    private Double confidence;
    
    /**
     * Whether this suggestion requires explicit approval
     */
    private Boolean requiresApproval;
    
    /**
     * Current status of the suggestion (PENDING_APPROVAL, APPROVED, REJECTED)
     */
    private String status;
    
    /**
     * When the suggestion was created
     */
    private LocalDateTime createdAt;
    
    /**
     * When the suggestion was approved (if applicable)
     */
    private LocalDateTime approvedAt;
    
    /**
     * When the suggestion was rejected (if applicable)
     */
    private LocalDateTime rejectedAt;
    
    /**
     * Reason for rejection (if applicable)
     */
    private String rejectionReason;
    
    /**
     * Additional metadata about the suggestion
     */
    private String metadata;
}
