package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI Transparency Config DTO for Phase 2.4: Transparency & Safety
 *
 * Represents transparency configuration and settings
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AITransparencyConfig {

    private String configId;
    private Boolean enableActivityLogging;
    private Boolean enableDecisionAuditing;
    private Boolean enableExplanations;
    private Boolean enableSafetyValidation;
    private Boolean enablePrivacyControls;
    private Integer logRetentionDays;
    private Integer auditRetentionDays;
    private Double minConfidenceThreshold;
    private Double minSafetyThreshold;
    private List<String> requiredApprovalTypes;
    private Map<String, String> privacySettings;
    private Map<String, String> transparencySettings;
    private String defaultExplanationType;
    private String defaultSafetyLevel;
    private Boolean enableRealTimeMonitoring;
    private Boolean enableComplianceReporting;
    private String userId;
    private LocalDateTime timestamp;
    private String environment;
    private String version;
    private Boolean success;
    private String errorMessage;
} 