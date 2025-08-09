package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for automation wizard step
 * Represents a single step in the automation creation wizard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationWizardStep {
    
    private int stepNumber;
    private String title;
    private String description;
    private String type; // template_selection, trigger_configuration, condition_configuration, action_configuration, review_and_create
    private boolean required;
    private Map<String, String> validationRules;
    private Map<String, Object> data; // Step-specific data
    private boolean completed;
    private String helpText;
    private Map<String, Object> options; // Step-specific options
}
