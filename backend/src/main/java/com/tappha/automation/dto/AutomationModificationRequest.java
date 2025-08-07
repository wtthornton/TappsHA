package com.tappha.automation.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for automation modification request with AI assistance
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationModificationRequest {

    @NotBlank(message = "Automation ID is required")
    private String automationId;

    @NotNull(message = "New configuration is required")
    private String newConfiguration;

    private String modificationReason;
    private String userPreferences;
    private Boolean aiAssisted;
    private String priority;
} 