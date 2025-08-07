package com.tappha.automation.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for automation lifecycle statistics
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationLifecycleStats {

    private String automationId;
    private Integer totalVersions;
    private AutomationStatus currentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime lastModified;
    private LocalDateTime retiredAt;
    private Integer approvalCount;
    private Integer optimizationCount;
} 