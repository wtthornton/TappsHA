package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * AI Activity Log DTO for Phase 2.4: Transparency & Safety
 *
 * Represents comprehensive AI activity logging for transparency and monitoring
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIActivityLog {

    private String logId;
    private String activityType;
    private String userId;
    private String deviceId;
    private Object activityData;
    private Double confidenceScore;
    private LocalDateTime timestamp;
    private String sessionId;
    private String requestId;
    private Boolean success;
    private String errorMessage;
    private Long processingTimeMs;
    private String ipAddress;
    private String userAgent;
    private String environment;
    private String version;
} 