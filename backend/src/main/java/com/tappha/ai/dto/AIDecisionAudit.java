package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * AI Decision Audit DTO for Phase 2.4: Transparency & Safety
 *
 * Represents comprehensive audit trail for AI decisions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIDecisionAudit {

    private String auditId;
    private String decisionId;
    private String decisionType;
    private Object inputData;
    private Object outputData;
    private String reasoning;
    private Double safetyScore;
    private String userId;
    private String deviceId;
    private LocalDateTime timestamp;
    private String modelVersion;
    private String algorithmUsed;
    private Double confidenceScore;
    private String approvalStatus;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private Boolean success;
    private String errorMessage;
    private Long processingTimeMs;
    private String environment;
    private String version;
} 