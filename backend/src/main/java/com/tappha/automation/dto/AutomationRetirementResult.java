package com.tappha.automation.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for automation retirement result
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationRetirementResult {

    private String automationId;
    private AutomationStatus status;
    private LocalDateTime retiredAt;
    private String reason;
    private String message;
} 