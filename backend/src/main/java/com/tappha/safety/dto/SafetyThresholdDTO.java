package com.tappha.safety.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for safety threshold data
 * 
 * Contains comprehensive safety threshold information including:
 * - Threshold details and configuration
 * - Validation rules
 * - Customization options
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafetyThresholdDTO {
    
    /**
     * Unique identifier for the safety threshold
     */
    private String id;
    
    /**
     * The user ID who owns this threshold
     */
    private String userId;
    
    /**
     * Safety threshold name
     */
    private String name;
    
    /**
     * Type of safety threshold (AUTOMATION_CHANGE, PERFORMANCE_IMPACT, SAFETY_CRITICAL, etc.)
     */
    private String type;
    
    /**
     * Maximum allowed value for this threshold
     */
    private Double maxValue;
    
    /**
     * Safety threshold description
     */
    private String description;
    
    /**
     * Whether this safety threshold is enabled
     */
    private Boolean enabled;
    
    /**
     * Timestamp when the safety threshold was created
     */
    private LocalDateTime createdAt;
} 