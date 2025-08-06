package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entity for storing user-defined event filtering rules
 * Enables customizable filtering logic for event processing
 */
@Entity
@Table(name = "event_filtering_rules", indexes = {
    @Index(name = "idx_event_filtering_rules_user_id", columnList = "user_id"),
    @Index(name = "idx_event_filtering_rules_connection_id", columnList = "connection_id"),
    @Index(name = "idx_event_filtering_rules_enabled", columnList = "enabled"),
    @Index(name = "idx_event_filtering_rules_rule_type", columnList = "ruleType"),
    @Index(name = "idx_event_filtering_rules_priority", columnList = "priority"),
    @Index(name = "idx_event_filtering_rules_created_at", columnList = "created_at")
})
public class EventFilteringRules {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id")
    private HomeAssistantConnection connection;
    
    @Column(name = "rule_name", nullable = false)
    private String ruleName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private Action action;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "conditions", nullable = false)
    private String conditions; // JSON containing filtering conditions
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_config")
    private String ruleConfig; // JSON containing rule-specific configuration
    
    @Column(name = "priority", nullable = false)
    private Integer priority = 100; // Lower number = higher priority
    
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "event_types")
    private String eventTypes; // Comma-separated list of event types
    
    @Column(name = "entity_patterns")
    private String entityPatterns; // Regex patterns for entity filtering
    
    @Column(name = "frequency_limit")
    private Integer frequencyLimit; // Max events per minute
    
    @Column(name = "time_window_minutes")
    private Integer timeWindowMinutes = 60; // Time window for frequency limit
    
    @Column(name = "match_count", nullable = false)
    private Long matchCount = 0L; // Number of times this rule matched
    
    @Column(name = "last_matched_at")
    private OffsetDateTime lastMatchedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
    
    public enum RuleType {
        INCLUDE,        // Include events matching conditions
        EXCLUDE,        // Exclude events matching conditions
        FREQUENCY,      // Frequency-based filtering
        PATTERN,        // Pattern-based filtering
        ENTITY,         // Entity-specific filtering
        STATE_CHANGE,   // State change filtering
        CUSTOM          // Custom filtering logic
    }
    
    public enum Action {
        ALLOW,          // Allow event to pass through
        BLOCK,          // Block event from processing
        THROTTLE,       // Apply throttling to event
        BATCH,          // Batch event for later processing
        PRIORITY,       // Mark as high priority
        LOG_ONLY        // Log but don't store
    }
    
    // Default constructor
    public EventFilteringRules() {}
    
    // Constructor with required fields
    public EventFilteringRules(User user, String ruleName, RuleType ruleType, Action action, String conditions) {
        this.user = user;
        this.ruleName = ruleName;
        this.ruleType = ruleType;
        this.action = action;
        this.conditions = conditions;
    }
    
    // Constructor with common fields
    public EventFilteringRules(User user, HomeAssistantConnection connection, String ruleName, 
                             RuleType ruleType, Action action, String conditions, Integer priority, 
                             Boolean enabled, String description) {
        this.user = user;
        this.connection = connection;
        this.ruleName = ruleName;
        this.ruleType = ruleType;
        this.action = action;
        this.conditions = conditions;
        this.priority = priority;
        this.enabled = enabled;
        this.description = description;
    }
    
    // Helper method to increment match count
    public void incrementMatchCount() {
        this.matchCount++;
        this.lastMatchedAt = OffsetDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public HomeAssistantConnection getConnection() {
        return connection;
    }
    
    public void setConnection(HomeAssistantConnection connection) {
        this.connection = connection;
    }
    
    public String getRuleName() {
        return ruleName;
    }
    
    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }
    
    public RuleType getRuleType() {
        return ruleType;
    }
    
    public void setRuleType(RuleType ruleType) {
        this.ruleType = ruleType;
    }
    
    public Action getAction() {
        return action;
    }
    
    public void setAction(Action action) {
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
        return "EventFilteringRules{" +
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
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EventFilteringRules)) return false;
        EventFilteringRules that = (EventFilteringRules) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}