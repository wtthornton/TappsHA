package com.tappha.homeassistant.dto;

import com.tappha.homeassistant.entity.EventFilteringRules;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.util.UUID;

/**
 * DTO for creating or updating filtering rules
 */
public class FilteringRuleRequest {
    
    @NotBlank(message = "Rule name is required")
    private String ruleName;
    
    @NotNull(message = "Rule type is required")
    private EventFilteringRules.RuleType ruleType;
    
    @NotNull(message = "Action is required")
    private EventFilteringRules.Action action;
    
    @NotBlank(message = "Conditions are required")
    private String conditions; // JSON string
    
    private String ruleConfig; // JSON string
    
    @Min(value = 1, message = "Priority must be at least 1")
    @Max(value = 1000, message = "Priority must not exceed 1000")
    private Integer priority = 100;
    
    private Boolean enabled = true;
    
    private String description;
    
    private UUID connectionId;
    
    private String eventTypes; // Comma-separated
    
    private String entityPatterns;
    
    @Min(value = 1, message = "Frequency limit must be positive")
    private Integer frequencyLimit;
    
    @Min(value = 1, message = "Time window must be positive")
    @Max(value = 1440, message = "Time window must not exceed 1440 minutes (24 hours)")
    private Integer timeWindowMinutes = 60;
    
    // Default constructor
    public FilteringRuleRequest() {}
    
    // Constructor with required fields
    public FilteringRuleRequest(String ruleName, EventFilteringRules.RuleType ruleType, 
                              EventFilteringRules.Action action, String conditions) {
        this.ruleName = ruleName;
        this.ruleType = ruleType;
        this.action = action;
        this.conditions = conditions;
    }
    
    // Getters and Setters
    public String getRuleName() {
        return ruleName;
    }
    
    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }
    
    public EventFilteringRules.RuleType getRuleType() {
        return ruleType;
    }
    
    public void setRuleType(EventFilteringRules.RuleType ruleType) {
        this.ruleType = ruleType;
    }
    
    public EventFilteringRules.Action getAction() {
        return action;
    }
    
    public void setAction(EventFilteringRules.Action action) {
        this.action = action;
    }
    
    public String getConditions() {
        return conditions;
    }
    
    public void setConditions(String conditions) {
        this.conditions = conditions;
    }
    
    public String getRuleConfig() {
        return ruleConfig;
    }
    
    public void setRuleConfig(String ruleConfig) {
        this.ruleConfig = ruleConfig;
    }
    
    public Integer getPriority() {
        return priority;
    }
    
    public void setPriority(Integer priority) {
        this.priority = priority;
    }
    
    public Boolean getEnabled() {
        return enabled;
    }
    
    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public UUID getConnectionId() {
        return connectionId;
    }
    
    public void setConnectionId(UUID connectionId) {
        this.connectionId = connectionId;
    }
    
    public String getEventTypes() {
        return eventTypes;
    }
    
    public void setEventTypes(String eventTypes) {
        this.eventTypes = eventTypes;
    }
    
    public String getEntityPatterns() {
        return entityPatterns;
    }
    
    public void setEntityPatterns(String entityPatterns) {
        this.entityPatterns = entityPatterns;
    }
    
    public Integer getFrequencyLimit() {
        return frequencyLimit;
    }
    
    public void setFrequencyLimit(Integer frequencyLimit) {
        this.frequencyLimit = frequencyLimit;
    }
    
    public Integer getTimeWindowMinutes() {
        return timeWindowMinutes;
    }
    
    public void setTimeWindowMinutes(Integer timeWindowMinutes) {
        this.timeWindowMinutes = timeWindowMinutes;
    }
    
    @Override
    public String toString() {
        return "FilteringRuleRequest{" +
                "ruleName='" + ruleName + '\'' +
                ", ruleType=" + ruleType +
                ", action=" + action +
                ", priority=" + priority +
                ", enabled=" + enabled +
                ", connectionId=" + connectionId +
                '}';
    }
}