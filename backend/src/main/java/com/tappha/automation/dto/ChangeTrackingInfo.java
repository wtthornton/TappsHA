package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for tracking automation changes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeTrackingInfo {
    private String automationId;
    private Integer versionNumber;
    private String changeDescription;
    private String changeType;
    private LocalDateTime changeTime;
    private String changedBy;
    private String changeReason;
} 