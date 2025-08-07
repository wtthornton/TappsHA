package com.tappha.ai.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * AI Recommendation Request DTO
 * 
 * Contains all necessary context for AI to generate automation suggestions
 * Following Agent OS Standards with privacy-first approach
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRecommendationRequest {

    /**
     * User ID for personalization and privacy controls
     */
    private String userId;

    /**
     * Household ID for context-aware suggestions
     */
    private String householdId;

    /**
     * Current context and environment data
     */
    private String context;

    /**
     * User control preferences (early adopter, cautious, skeptical, resistant)
     */
    private String userControlPreference;

    /**
     * List of device IDs to consider for suggestions
     */
    private List<String> deviceIds;

    /**
     * Time range for analysis (in hours)
     */
    private Integer timeRangeHours;

    /**
     * Additional parameters for AI processing
     */
    private Map<String, Object> additionalParams;

    /**
     * Privacy level (local-only, hybrid, cloud-augmented)
     */
    private String privacyLevel;

    /**
     * Safety thresholds for AI suggestions
     */
    private Double safetyThreshold;

    /**
     * Maximum number of suggestions to generate
     */
    private Integer maxSuggestions;
} 