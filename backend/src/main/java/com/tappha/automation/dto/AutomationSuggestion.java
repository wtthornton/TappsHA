package com.tappha.automation.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for AI-generated automation suggestions
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationSuggestion {

    private String suggestionId;
    private SuggestionType suggestionType;
    private Double confidence;
    private String reasoning;
    private String configuration;
    private LocalDateTime createdAt;
    private Boolean aiGenerated;
    private String modelVersion;
} 