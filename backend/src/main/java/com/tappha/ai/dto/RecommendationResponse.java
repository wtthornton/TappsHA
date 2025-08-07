package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Recommendation Response DTO for Phase 2.3: AI Recommendation Engine
 * 
 * Represents response with context-aware automation suggestions
 * Following Agent OS Standards with comprehensive response data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private String requestId;
    private String userId;
    private LocalDateTime generatedAt;
    private Boolean success;
    private String errorMessage;
    private List<Recommendation> recommendations;
    private RecommendationStats stats;
    private String modelUsed;
    private Double overallConfidence;
    private Long processingTimeMs;
    private String privacyLevel;
    private Boolean requiresApproval;

    /**
     * Individual recommendation with details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String recommendationId;
        private String title;
        private String description;
        private String category; // "automation", "optimization", "safety", "energy"
        private Double confidenceScore;
        private String explanation;
        private List<String> affectedDevices;
        private Map<String, Object> implementationDetails;
        private String estimatedImpact;
        private String timeToImplement;
        private Boolean requiresApproval;
        private String approvalStatus; // "pending", "approved", "rejected"
        private LocalDateTime createdAt;
        private Map<String, Object> additionalProperties;
    }

    /**
     * Recommendation statistics and performance metrics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationStats {
        private String userId;
        private String timeRange;
        private Integer totalRecommendations;
        private Integer approvedRecommendations;
        private Integer rejectedRecommendations;
        private Integer pendingRecommendations;
        private Double averageConfidence;
        private Double approvalRate;
        private Double implementationRate;
        private Map<String, Integer> categoryBreakdown;
        private Map<String, Double> performanceMetrics;
        private LocalDateTime lastUpdated;
    }
} 