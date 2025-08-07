package com.tappha.ai.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AI Recommendation Response DTO
 * 
 * Contains AI-generated suggestions with confidence scores and explanations
 * Following Agent OS Standards with transparency and safety
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRecommendationResponse {

    /**
     * Request ID for tracking and correlation
     */
    private String requestId;

    /**
     * User ID for personalization
     */
    private String userId;

    /**
     * Timestamp of the AI response
     */
    private LocalDateTime timestamp;

    /**
     * List of automation suggestions
     */
    private List<AutomationSuggestion> suggestions;

    /**
     * Overall confidence score for the recommendations
     */
    private Double overallConfidence;

    /**
     * AI model used for generation
     */
    private String modelUsed;

    /**
     * Processing time in milliseconds
     */
    private Long processingTimeMs;

    /**
     * Privacy level used (local-only, hybrid, cloud-augmented)
     */
    private String privacyLevel;

    /**
     * Safety validation results
     */
    private Boolean safetyValidated;

    /**
     * Transparency information for user dashboard
     */
    private String transparencyInfo;

    /**
     * Error message if any issues occurred
     */
    private String errorMessage;

    /**
     * Success status of the AI processing
     */
    private Boolean success;
} 