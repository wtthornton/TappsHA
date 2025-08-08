package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * Automation Generation Request DTO
 * 
 * Contains all necessary information for generating automation suggestions
 * including user context, preferences, and requirements.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationGenerationRequest {
    
    /**
     * User ID requesting the automation generation
     */
    private UUID userId;
    
    /**
     * Context description for the automation
     * e.g., "Turn on lights when motion detected in living room"
     */
    private String context;
    
    /**
     * User preferences for automation generation
     * e.g., {"safety_level": "high", "complexity": "medium"}
     */
    private Map<String, Object> userPreferences;
    
    /**
     * Specific requirements for the automation
     * e.g., {"devices": ["light.living_room"], "conditions": ["motion"]}
     */
    private Map<String, Object> requirements;
    
    /**
     * Priority level for the automation (LOW, MEDIUM, HIGH)
     */
    private String priority;
    
    /**
     * Whether to require explicit approval for this automation
     */
    private Boolean requireApproval;
    
    /**
     * Additional notes or constraints for the automation
     */
    private String notes;
}
