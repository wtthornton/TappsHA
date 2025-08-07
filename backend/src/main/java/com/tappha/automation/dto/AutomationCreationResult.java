package com.tappha.automation.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for automation creation result with approval status
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationCreationResult {

    private String automationId;
    private AutomationStatus status;
    private Boolean requiresApproval;
    private AutomationSuggestion aiSuggestion;
    private String message;
    private LocalDateTime createdAt;
    private String versionId;
} 