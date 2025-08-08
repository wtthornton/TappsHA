package com.tappha.automation.entity;

import com.tappha.automation.dto.AutomationTemplate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Automation Template Entity
 * 
 * Stores automation templates with comprehensive metadata for template-based
 * automation generation. Supports 50+ templates for different scenarios.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "automation_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationTemplateEntity {
    
    /**
     * Unique identifier for the template
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    /**
     * Template name
     */
    @Column(name = "name", nullable = false)
    private String name;
    
    /**
     * Template description
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * Template content in YAML format
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    /**
     * Context categories this template applies to (JSON array)
     */
    @Column(name = "contexts", columnDefinition = "TEXT")
    private String contexts;
    
    /**
     * Template category (LIGHTING, SECURITY, CLIMATE, etc.)
     */
    @Column(name = "category", nullable = false)
    private String category;
    
    /**
     * Template complexity level (BASIC, INTERMEDIATE, ADVANCED)
     */
    @Column(name = "complexity", nullable = false)
    private String complexity;
    
    /**
     * Quality score for this template (0.0 to 1.0)
     */
    @Column(name = "quality_score", nullable = false)
    private Double qualityScore;
    
    /**
     * Usage count for popularity tracking
     */
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount;
    
    /**
     * Success rate for this template (0.0 to 1.0)
     */
    @Column(name = "success_rate", nullable = false)
    private Double successRate;
    
    /**
     * Whether this is a default template
     */
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;
    
    /**
     * Template version
     */
    @Column(name = "version", nullable = false)
    private String version;
    
    /**
     * When the template was created
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    /**
     * When the template was last updated
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * Template tags for search and filtering (JSON array)
     */
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;
    
    /**
     * Template parameters that can be customized (JSON array)
     */
    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;
    
    /**
     * Example usage scenarios (JSON array)
     */
    @Column(name = "examples", columnDefinition = "TEXT")
    private String examples;
    
    /**
     * Convert entity to DTO
     */
    public AutomationTemplate toDto() {
        return AutomationTemplate.builder()
                .id(this.id)
                .name(this.name)
                .description(this.description)
                .content(this.content)
                .contexts(parseJsonArray(this.contexts))
                .category(this.category)
                .complexity(this.complexity)
                .qualityScore(this.qualityScore)
                .usageCount(this.usageCount)
                .successRate(this.successRate)
                .isDefault(this.isDefault)
                .version(this.version)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .tags(parseJsonArray(this.tags))
                .parameters(parseJsonArray(this.parameters))
                .examples(parseJsonArray(this.examples))
                .build();
    }
    
    /**
     * Parse JSON array string to List<String>
     */
    private List<String> parseJsonArray(String jsonArray) {
        if (jsonArray == null || jsonArray.trim().isEmpty()) {
            return List.of();
        }
        
        try {
            // Simple JSON array parsing - in production, use proper JSON library
            String clean = jsonArray.replaceAll("[\\[\\]\"]", "");
            if (clean.trim().isEmpty()) {
                return List.of();
            }
            return List.of(clean.split(","));
        } catch (Exception e) {
            return List.of();
        }
    }
}
