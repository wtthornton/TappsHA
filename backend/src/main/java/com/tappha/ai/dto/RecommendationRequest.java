package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Recommendation Request DTO for Phase 2.3: AI Recommendation Engine
 * 
 * Represents a request for context-aware automation suggestions
 * Following Agent OS Standards with comprehensive request data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationRequest {

    private String userId;
    private String householdId;
    private LocalDateTime requestTime;
    private String context;
    private String userPreferences;
    private String privacyLevel;
    private String controlPreference;
    private List<String> deviceIds;
    private Map<String, Object> contextData;
    private String recommendationType; // "automation", "optimization", "safety", "energy"
    private Integer maxRecommendations;
    private String timeRange;
    private Map<String, Object> additionalParameters;
} 