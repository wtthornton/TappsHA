package com.tappha.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for tracking automation state transitions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationStateTransition {
    private String automationId;
    private AutomationStatus previousStatus;
    private AutomationStatus newStatus;
    private LocalDateTime transitionTime;
    private String reason;
    private String initiatedBy;
} 