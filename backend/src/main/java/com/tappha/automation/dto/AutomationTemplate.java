package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Automation Template DTO
 * 
 * Template for automation generation with predefined patterns and configurations.
 * Supports 50+ templates for different automation scenarios.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationTemplate {
    
    /**
     * Unique identifier for the template
     */
    private UUID id;
    
    /**
     * Template name
     */
    private String name;
    
    /**
     * Template description
     */
    private String description;
    
    /**
     * Template content in YAML format
     */
    private String content;
    
    /**
     * Context categories this template applies to
     */
    private List<String> contexts;
    
    /**
     * Template category (LIGHTING, SECURITY, CLIMATE, etc.)
     */
    private String category;
    
    /**
     * Template complexity level (BASIC, INTERMEDIATE, ADVANCED)
     */
    private String complexity;
    
    /**
     * Quality score for this template (0.0 to 1.0)
     */
    private Double qualityScore;
    
    /**
     * Usage count for popularity tracking
     */
    private Integer usageCount;
    
    /**
     * Success rate for this template (0.0 to 1.0)
     */
    private Double successRate;
    
    /**
     * Whether this is a default template
     */
    private Boolean isDefault;
    
    /**
     * Template version
     */
    private String version;
    
    /**
     * When the template was created
     */
    private LocalDateTime createdAt;
    
    /**
     * When the template was last updated
     */
    private LocalDateTime updatedAt;
    
    /**
     * Template tags for search and filtering
     */
    private List<String> tags;
    
    /**
     * Template parameters that can be customized
     */
    private List<String> parameters;
    
    /**
     * Example usage scenarios
     */
    private List<String> examples;
}
