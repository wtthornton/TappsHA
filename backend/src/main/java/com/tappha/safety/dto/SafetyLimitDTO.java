package com.tappha.safety.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for safety limit data
 * 
 * Contains comprehensive safety limit information including:
 * - Limit details and configuration
 * - Approval requirements
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
public class SafetyLimitDTO {
    
    /**
     * Unique identifier for the safety limit
     */
    private String id;
    
    /**
     * The user ID who owns this limit
     */
    private String userId;
    
    /**
     * Safety limit name
     */
    private String name;
    
    /**
     * Safety limit description
     */
    private String description;
    
    /**
     * Type of safety limit (AUTOMATION_CREATION, AUTOMATION_MODIFICATION, AUTOMATION_DELETION, PERFORMANCE_IMPACT, SAFETY_CRITICAL)
     */
    private String limitType;
    
    /**
     * The limit value for this safety limit
     */
    private Double limitValue;
    
    /**
     * Whether approval is required when this limit is triggered
     */
    private Boolean approvalRequired;
    
    /**
     * Whether this safety limit is enabled
     */
    private Boolean enabled;
    
    /**
     * Timestamp when the safety limit was created
     */
    private LocalDateTime createdAt;
} 