package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Recommendation Accuracy DTO for Phase 2.3: AI Recommendation Engine
 * 
 * Represents accuracy assessment and validation results for recommendations
 * Following Agent OS Standards with comprehensive accuracy data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationAccuracy {

    private String recommendationId;
    private String userId;
    private LocalDateTime validatedAt;
    private Boolean success;
    private String errorMessage;
    private Double accuracyScore; // 0.0 to 1.0
    private Double confidenceScore; // 0.0 to 1.0
    private String accuracyLevel; // "high", "medium", "low"
    private List<AccuracyMetric> accuracyMetrics;
    private Map<String, Double> categoryAccuracy;
    private String validationMethod;
    private String modelVersion;
    private Long validationTimeMs;
    private Map<String, Object> additionalMetrics;

    /**
     * Individual accuracy metric
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccuracyMetric {
        private String metricName;
        private Double metricValue;
        private String metricUnit;
        private String metricDescription;
        private Boolean isPassing;
        private Double threshold;
        private Map<String, Object> additionalProperties;
    }
} 