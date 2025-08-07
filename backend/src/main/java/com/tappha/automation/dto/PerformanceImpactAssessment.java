package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for performance impact assessment of automation changes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceImpactAssessment {
    private String automationId;
    private LocalDateTime assessmentTime;
    private Double estimatedCpuImpact;
    private Double estimatedMemoryImpact;
    private Double estimatedResponseTimeImpact;
    private String riskLevel;
    private List<String> recommendations;
    private String assessmentNotes;
    private Boolean requiresApproval;
} 