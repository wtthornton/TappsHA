package com.tappha.homeassistant.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;

/**
 * DTO for automation creation requests.
 * 
 * Contains user requirements and preferences for automation creation.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationCreationRequest {

    @NotBlank(message = "User ID is required")
    @JsonProperty("userId")
    private String userId;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description must be less than 500 characters")
    @JsonProperty("description")
    private String description;

    @JsonProperty("naturalLanguagePrompt")
    private String naturalLanguagePrompt;

    @JsonProperty("devices")
    private List<String> devices;

    @JsonProperty("triggers")
    private List<AutomationTrigger> triggers;

    @JsonProperty("conditions")
    private List<AutomationCondition> conditions;

    @JsonProperty("actions")
    private List<AutomationAction> actions;

    @JsonProperty("preferences")
    private Map<String, Object> preferences;

    @JsonProperty("complexity")
    private AutomationComplexity complexity;

    @JsonProperty("priority")
    private AutomationPriority priority;

    @JsonProperty("feedback")
    private AutomationFeedback feedback;

    /**
     * Automation trigger configuration.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutomationTrigger {
        @NotBlank(message = "Trigger type is required")
        @JsonProperty("type")
        private String type;

        @JsonProperty("entityId")
        private String entityId;

        @JsonProperty("state")
        private String state;

        @JsonProperty("time")
        private String time;

        @JsonProperty("conditions")
        private Map<String, Object> conditions;
    }

    /**
     * Automation condition configuration.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutomationCondition {
        @NotBlank(message = "Condition type is required")
        @JsonProperty("type")
        private String type;

        @JsonProperty("entityId")
        private String entityId;

        @JsonProperty("state")
        private String state;

        @JsonProperty("operator")
        private String operator;

        @JsonProperty("value")
        private Object value;
    }

    /**
     * Automation action configuration.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutomationAction {
        @NotBlank(message = "Action type is required")
        @JsonProperty("type")
        private String type;

        @JsonProperty("entityId")
        private String entityId;

        @JsonProperty("service")
        private String service;

        @JsonProperty("data")
        private Map<String, Object> data;

        @JsonProperty("delay")
        private Integer delay;
    }

    /**
     * Automation complexity levels.
     */
    public enum AutomationComplexity {
        SIMPLE,
        MODERATE,
        COMPLEX,
        ADVANCED
    }

    /**
     * Automation priority levels.
     */
    public enum AutomationPriority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    /**
     * User feedback on automation suggestions.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AutomationFeedback {
        @NotNull(message = "Rating is required")
        @JsonProperty("rating")
        private Integer rating; // 1-5 scale

        @JsonProperty("comments")
        private String comments;

        @JsonProperty("useful")
        private Boolean useful;

        @JsonProperty("implemented")
        private Boolean implemented;

        @JsonProperty("modifications")
        private List<String> modifications;
    }
} 