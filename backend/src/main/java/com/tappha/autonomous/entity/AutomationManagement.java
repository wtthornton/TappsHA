package com.tappha.autonomous.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing automation management in the autonomous management system.
 * 
 * This entity tracks:
 * - Automation metadata and lifecycle state
 * - Performance metrics and execution statistics
 * - User associations and audit trail
 * - Version control and active status
 */
@Entity
@Table(name = "automation_management", indexes = {
    @Index(name = "idx_automation_management_lifecycle_state", columnList = "lifecycle_state"),
    @Index(name = "idx_automation_management_performance_score", columnList = "performance_score"),
    @Index(name = "idx_automation_management_last_execution_time", columnList = "last_execution_time")
})
@EntityListeners(AuditingEntityListener.class)
public class AutomationManagement {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Size(max = 255)
    @Column(name = "home_assistant_automation_id", nullable = false, unique = true)
    private String homeAssistantAutomationId;

    @NotNull
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "lifecycle_state", nullable = false)
    private LifecycleState lifecycleState = LifecycleState.ACTIVE;

    @Column(name = "performance_score", precision = 5, scale = 2)
    private Double performanceScore;

    @Column(name = "last_execution_time")
    private Instant lastExecutionTime;

    @Column(name = "execution_count")
    private Integer executionCount = 0;

    @Column(name = "success_rate", precision = 5, scale = 2)
    private Double successRate;

    @Column(name = "average_execution_time_ms")
    private Integer averageExecutionTimeMs;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "modified_by")
    private UUID modifiedBy;

    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Default constructor
    public AutomationManagement() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Constructor with required fields
    public AutomationManagement(String homeAssistantAutomationId, String name) {
        this();
        this.homeAssistantAutomationId = homeAssistantAutomationId;
        this.name = name;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getHomeAssistantAutomationId() {
        return homeAssistantAutomationId;
    }

    public void setHomeAssistantAutomationId(String homeAssistantAutomationId) {
        this.homeAssistantAutomationId = homeAssistantAutomationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LifecycleState getLifecycleState() {
        return lifecycleState;
    }

    public void setLifecycleState(LifecycleState lifecycleState) {
        this.lifecycleState = lifecycleState;
    }

    public Double getPerformanceScore() {
        return performanceScore;
    }

    public void setPerformanceScore(Double performanceScore) {
        this.performanceScore = performanceScore;
    }

    public Instant getLastExecutionTime() {
        return lastExecutionTime;
    }

    public void setLastExecutionTime(Instant lastExecutionTime) {
        this.lastExecutionTime = lastExecutionTime;
    }

    public Integer getExecutionCount() {
        return executionCount;
    }

    public void setExecutionCount(Integer executionCount) {
        this.executionCount = executionCount;
    }

    public Double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(Double successRate) {
        this.successRate = successRate;
    }

    public Integer getAverageExecutionTimeMs() {
        return averageExecutionTimeMs;
    }

    public void setAverageExecutionTimeMs(Integer averageExecutionTimeMs) {
        this.averageExecutionTimeMs = averageExecutionTimeMs;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

    public UUID getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(UUID modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // Business Logic Methods
    /**
     * Increments the execution count and updates last execution time
     */
    public void incrementExecutionCount() {
        this.executionCount++;
        this.lastExecutionTime = Instant.now();
    }

    /**
     * Updates performance metrics
     */
    public void updatePerformanceMetrics(Double performanceScore, Double successRate, Integer averageExecutionTimeMs) {
        this.performanceScore = performanceScore;
        this.successRate = successRate;
        this.averageExecutionTimeMs = averageExecutionTimeMs;
    }

    /**
     * Transitions to a new lifecycle state
     */
    public void transitionToState(LifecycleState newState) {
        this.lifecycleState = newState;
        this.version++;
    }

    /**
     * Activates the automation
     */
    public void activate() {
        this.lifecycleState = LifecycleState.ACTIVE;
        this.isActive = true;
        this.version++;
    }

    /**
     * Deactivates the automation
     */
    public void deactivate() {
        this.lifecycleState = LifecycleState.INACTIVE;
        this.isActive = false;
        this.version++;
    }

    /**
     * Retires the automation
     */
    public void retire() {
        this.lifecycleState = LifecycleState.RETIRED;
        this.isActive = false;
        this.version++;
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AutomationManagement that = (AutomationManagement) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // ToString
    @Override
    public String toString() {
        return "AutomationManagement{" +
                "id=" + id +
                ", homeAssistantAutomationId='" + homeAssistantAutomationId + '\'' +
                ", name='" + name + '\'' +
                ", lifecycleState=" + lifecycleState +
                ", performanceScore=" + performanceScore +
                ", executionCount=" + executionCount +
                ", successRate=" + successRate +
                ", averageExecutionTimeMs=" + averageExecutionTimeMs +
                ", isActive=" + isActive +
                ", version=" + version +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
