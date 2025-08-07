package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI Explanation DTO for Phase 2.4: Transparency & Safety
 *
 * Represents explainable AI reasoning and transparency features
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIExplanation {

    private String explanationId;
    private String decisionId;
    private String decisionType;
    private String explanationType;
    private String reasoning;
    private String userFriendlyExplanation;
    private List<String> keyFactors;
    private Map<String, Double> factorWeights;
    private String confidenceExplanation;
    private String uncertaintyExplanation;
    private List<String> alternativeDecisions;
    private Map<String, Object> contextData;
    private String userId;
    private LocalDateTime timestamp;
    private String modelVersion;
    private String algorithmUsed;
    private Double confidenceScore;
    private Boolean success;
    private String errorMessage;
    private Long processingTimeMs;
    private String environment;
    private String version;
} 