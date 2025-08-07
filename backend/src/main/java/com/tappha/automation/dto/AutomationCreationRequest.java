package com.tappha.automation.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for automation creation request with AI assistance
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationCreationRequest {

    @NotBlank(message = "Automation name is required")
    @Size(max = 100, message = "Automation name must be less than 100 characters")
    private String automationName;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private String triggerType;
    private String conditionType;
    private String actionType;
    private String targetDevice;
    private String schedule;
    private String userPreferences;
    private Boolean aiAssisted;
    private String priority;
} 