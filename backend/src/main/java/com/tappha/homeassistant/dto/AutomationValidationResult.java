package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for automation validation result
 * Represents the result of validating automation configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationValidationResult {
    
    private boolean isValid;
    private List<String> errors;
    private List<String> warnings;
    private Map<String, Object> validationData;
    private long validationTimestamp;
    private String validationType; // step_validation, complete_validation, etc.
}
