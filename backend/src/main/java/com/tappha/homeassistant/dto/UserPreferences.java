package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * User preferences for AI features
 * Contains user settings for AI behavior and safety
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    
    private String userId;
    private Boolean aiEnabled;
    private String safetyLevel; // 'low', 'medium', 'high'
    private Boolean approvalRequired;
    private Integer maxSuggestionsPerDay;
    private String preferredModel; // 'gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'
    private Double confidenceThreshold; // 0.0 to 1.0
    private Double safetyThreshold; // 0.0 to 1.0
    private Map<String, Object> customPreferences;
    private Boolean privacyMode; // Enable privacy-preserving features
    private Boolean localProcessing; // Prefer local processing when possible
} 