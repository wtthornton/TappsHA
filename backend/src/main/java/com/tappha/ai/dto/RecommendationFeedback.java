package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Recommendation Feedback DTO for Phase 2.3: AI Recommendation Engine
 * 
 * Represents user feedback for recommendations to improve model performance
 * Following Agent OS Standards with comprehensive feedback data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationFeedback {

    private String feedbackId;
    private String recommendationId;
    private String userId;
    private LocalDateTime feedbackTime;
    private String feedbackType; // "approval", "rejection", "implementation", "rating"
    private String feedbackValue; // "approved", "rejected", "implemented", "1-5 rating"
    private String feedbackReason;
    private String feedbackComment;
    private Double rating; // 1.0 to 5.0 scale
    private Boolean wasImplemented;
    private String implementationNotes;
    private Map<String, Object> additionalFeedback;
    private String modelVersion;
    private String processingStatus; // "pending", "processed", "error"
    private LocalDateTime processedAt;
} 