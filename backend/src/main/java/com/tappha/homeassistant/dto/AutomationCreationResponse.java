package com.tappha.homeassistant.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for automation creation responses.
 * 
 * Contains automation suggestions, validation results, and creation status.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationCreationResponse {

    @JsonProperty("suggestions")
    private List<AutomationSuggestion> suggestions;

    @JsonProperty("totalSuggestions")
    private Integer totalSuggestions;

    @JsonProperty("confidenceThreshold")
    private Double confidenceThreshold;

    @JsonProperty("createdAutomation")
    private CreatedAutomation createdAutomation;

    @JsonProperty("validationResult")
    private ValidationResult validationResult;

    @JsonProperty("history")
    private List<AutomationHistory> history;

    @JsonProperty("templates")
    private List<AutomationTemplate> templates;

    @JsonProperty("status")
    private String status;

    @JsonProperty("message")
    private String message;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    /**
     * Created automation details.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatedAutomation {
        @JsonProperty("automationId")
        private String automationId;

        @JsonProperty("name")
        private String name;

        @JsonProperty("description")
        private String description;

        @JsonProperty("triggers")
        private List<AutomationCreationRequest.AutomationTrigger> triggers;

        @JsonProperty("conditions")
        private List<AutomationCreationRequest.AutomationCondition> conditions;

        @JsonProperty("actions")
        private List<AutomationCreationRequest.AutomationAction> actions;

        @JsonProperty("createdAt")
        private LocalDateTime createdAt;

        @JsonProperty("status")
        private String status;

        @JsonProperty("homeAssistantId")
        private String homeAssistantId;
    }

    /**
     * Validation result for automation configuration.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationResult {
        @JsonProperty("isValid")
        private Boolean isValid;

        @JsonProperty("issues")
        private List<ValidationIssue> issues;

        @JsonProperty("warnings")
        private List<ValidationWarning> warnings;

        @JsonProperty("recommendations")
        private List<String> recommendations;

        @JsonProperty("estimatedComplexity")
        private String estimatedComplexity;

        @JsonProperty("estimatedPerformance")
        private String estimatedPerformance;
    }

    /**
     * Validation issue details.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationIssue {
        @JsonProperty("type")
        private String type;

        @JsonProperty("severity")
        private String severity;

        @JsonProperty("message")
        private String message;

        @JsonProperty("suggestion")
        private String suggestion;

        @JsonProperty("lineNumber")
        private Integer lineNumber;
    }

    /**
     * Validation warning details.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationWarning {
        @JsonProperty("type")
        private String type;

        @JsonProperty("message")
        private String message;

        @JsonProperty("suggestion")
        private String suggestion;
    }

    /**
     * Automation creation history item.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutomationHistory {
        @JsonProperty("id")
        private String id;

        @JsonProperty("automationId")
        private String automationId;

        @JsonProperty("name")
        private String name;

        @JsonProperty("description")
        private String description;

        @JsonProperty("createdAt")
        private LocalDateTime createdAt;

        @JsonProperty("status")
        private String status;

        @JsonProperty("suggestionId")
        private String suggestionId;

        @JsonProperty("confidence")
        private Double confidence;

        @JsonProperty("feedback")
        private AutomationCreationRequest.AutomationFeedback feedback;
    }
} 