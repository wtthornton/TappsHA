package com.tappha.homeassistant.dto;

import com.tappha.homeassistant.entity.EventFilteringRules;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for filtering rule responses
 */
public class FilteringRuleResponse {
    
    private UUID id;
    private String ruleName;
    private EventFilteringRules.RuleType ruleType;
    private EventFilteringRules.Action action;
    private String conditions;
    private String ruleConfig;
    private Integer priority;
    private Boolean enabled;
    private String description;
    private UUID connectionId;
    private String connectionName;
    private String eventTypes;
    private String entityPatterns;
    private Integer frequencyLimit;
    private Integer timeWindowMinutes;
    private Long matchCount;
    private OffsetDateTime lastMatchedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Default constructor
    public FilteringRuleResponse() {}
    
    // Constructor from entity
    public FilteringRuleResponse(EventFilteringRules rule) {
        this.id = rule.getId();
        this.ruleName = rule.getRuleName();
        this.ruleType = rule.getRuleType();
        this.action = rule.getAction();
        this.conditions = rule.getConditions();
        this.ruleConfig = rule.getRuleConfig();
        this.priority = rule.getPriority();
        this.enabled = rule.getEnabled();
        this.description = rule.getDescription();
        this.connectionId = rule.getConnection() != null ? rule.getConnection().getId() : null;
        this.connectionName = rule.getConnection() != null ? rule.getConnection().getName() : null;
        this.eventTypes = rule.getEventTypes();
        this.entityPatterns = rule.getEntityPatterns();
        this.frequencyLimit = rule.getFrequencyLimit();
        this.timeWindowMinutes = rule.getTimeWindowMinutes();
        this.matchCount = rule.getMatchCount();
        this.lastMatchedAt = rule.getLastMatchedAt();
        this.createdAt = rule.getCreatedAt();
        this.updatedAt = rule.getUpdatedAt();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
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
    
    public String getConnectionName() {
        return connectionName;
    }
    
    public void setConnectionName(String connectionName) {
        this.connectionName = connectionName;
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
    
    public Long getMatchCount() {
        return matchCount;
    }
    
    public void setMatchCount(Long matchCount) {
        this.matchCount = matchCount;
    }
    
    public OffsetDateTime getLastMatchedAt() {
        return lastMatchedAt;
    }
    
    public void setLastMatchedAt(OffsetDateTime lastMatchedAt) {
        this.lastMatchedAt = lastMatchedAt;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "FilteringRuleResponse{" +
                "id=" + id +
                ", ruleName='" + ruleName + '\'' +
                ", ruleType=" + ruleType +
                ", action=" + action +
                ", priority=" + priority +
                ", enabled=" + enabled +
                ", matchCount=" + matchCount +
                ", createdAt=" + createdAt +
                '}';
    }
}