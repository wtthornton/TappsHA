package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI Safety Report DTO for Phase 2.4: Transparency & Safety
 *
 * Represents comprehensive safety validation and reporting
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AISafetyReport {

    private String reportId;
    private String decisionId;
    private String decisionType;
    private Double overallSafetyScore;
    private String safetyLevel;
    private List<String> safetyChecks;
    private Map<String, Double> safetyScores;
    private List<String> safetyWarnings;
    private List<String> safetyRecommendations;
    private String riskAssessment;
    private String mitigationStrategies;
    private Boolean requiresApproval;
    private String approvalWorkflow;
    private String userId;
    private String deviceId;
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