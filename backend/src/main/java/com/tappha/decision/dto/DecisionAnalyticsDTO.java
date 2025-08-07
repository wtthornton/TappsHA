package com.tappha.decision.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Decision Analytics DTO for decision tracking system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionAnalyticsDTO {
    private String userId;
    private String timeRange;
    private Long totalDecisions;
    private Long approvedDecisions;
    private Long rejectedDecisions;
    private Long delegatedDecisions;
    private Double approvalRate;
    private Double averageConfidence;
    private Map<String, Long> decisionTypeDistribution;
    private Map<String, Long> contextTypeDistribution;
    private LocalDateTime generatedAt;
} 