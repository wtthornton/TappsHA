package com.tappha.automation.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for automation modification result
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationModificationResult {

    private String automationId;
    private String versionId;
    private AutomationStatus status;
    private Boolean requiresApproval;
    private AutomationSuggestion aiSuggestion;
    private String message;
    private LocalDateTime modifiedAt;
} 