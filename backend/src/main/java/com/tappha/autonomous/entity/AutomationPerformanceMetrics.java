package com.tappha.autonomous.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing detailed performance metrics for automation executions.
 *
 * This entity tracks:
 * - Execution duration and success status
 * - Error messages and trigger sources
 * - Performance scores and resource usage
 * - Affected entities and metadata
 */
@Entity
@Table(name = "automation_performance_metrics", indexes = {
    @Index(name = "idx_performance_metrics_automation_id", columnList = "automation_management_id"),
    @Index(name = "idx_performance_metrics_execution_timestamp", columnList = "execution_timestamp"),
    @Index(name = "idx_performance_metrics_success", columnList = "success"),
    @Index(name = "idx_performance_metrics_performance_score", columnList = "performance_score")
})
@EntityListeners(AuditingEntityListener.class)
public class AutomationPerformanceMetrics {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "automation_management_id", nullable = false)
    private AutomationManagement automationManagement;

    @CreatedDate
    @Column(name = "execution_timestamp", nullable = false, updatable = false)
    private Instant executionTimestamp;

    @Min(value = 0, message = "Execution duration must be non-negative")
    @Column(name = "execution_duration_ms")
    private Integer executionDurationMs;

    @NotNull
    @Column(name = "success", nullable = false)
    private Boolean success;

    @Size(min = 1, message = "Error message must not be empty if provided")
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Size(min = 1, message = "Trigger source must not be empty if provided")
    @Column(name = "trigger_source")
    private String triggerSource;

    @Column(name = "affected_entities", columnDefinition = "JSONB")
    private String affectedEntities;

    @Min(value = 0, message = "Performance score must be at least 0")
    @Max(value = 100, message = "Performance score must be at most 100")
    @Column(name = "performance_score", precision = 5, scale = 2)
    private Double performanceScore;

    @Column(name = "resource_usage", columnDefinition = "JSONB")
    private String resourceUsage;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    // Default constructor
    public AutomationPerformanceMetrics() {
        this.executionTimestamp = Instant.now();
    }

    // Constructor with required fields
    public AutomationPerformanceMetrics(AutomationManagement automationManagement, Boolean success) {
        this();
        this.automationManagement = automationManagement;
        this.success = success;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AutomationManagement getAutomationManagement() {
        return automationManagement;
    }

    public void setAutomationManagement(AutomationManagement automationManagement) {
        this.automationManagement = automationManagement;
    }

    public Instant getExecutionTimestamp() {
        return executionTimestamp;
    }

    public void setExecutionTimestamp(Instant executionTimestamp) {
        this.executionTimestamp = executionTimestamp;
    }

    public Integer getExecutionDurationMs() {
        return executionDurationMs;
    }

    public void setExecutionDurationMs(Integer executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getTriggerSource() {
        return triggerSource;
    }

    public void setTriggerSource(String triggerSource) {
        this.triggerSource = triggerSource;
    }

    public String getAffectedEntities() {
        return affectedEntities;
    }

    public void setAffectedEntities(String affectedEntities) {
        this.affectedEntities = affectedEntities;
    }

    public Double getPerformanceScore() {
        return performanceScore;
    }

    public void setPerformanceScore(Double performanceScore) {
        this.performanceScore = performanceScore;
    }

    public String getResourceUsage() {
        return resourceUsage;
    }

    public void setResourceUsage(String resourceUsage) {
        this.resourceUsage = resourceUsage;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    // Business Logic Methods
    /**
     * Creates a successful execution metric
     */
    public static AutomationPerformanceMetrics createSuccessfulExecution(
            AutomationManagement automationManagement,
            Integer durationMs,
            String triggerSource,
            String affectedEntities,
            Double performanceScore,
            String resourceUsage) {
        
        AutomationPerformanceMetrics metrics = new AutomationPerformanceMetrics(automationManagement, true);
        metrics.setExecutionDurationMs(durationMs);
        metrics.setTriggerSource(triggerSource);
        metrics.setAffectedEntities(affectedEntities);
        metrics.setPerformanceScore(performanceScore);
        metrics.setResourceUsage(resourceUsage);
        return metrics;
    }

    /**
     * Creates a failed execution metric
     */
    public static AutomationPerformanceMetrics createFailedExecution(
            AutomationManagement automationManagement,
            Integer durationMs,
            String errorMessage,
            String triggerSource,
            String affectedEntities) {
        
        AutomationPerformanceMetrics metrics = new AutomationPerformanceMetrics(automationManagement, false);
        metrics.setExecutionDurationMs(durationMs);
        metrics.setErrorMessage(errorMessage);
        metrics.setTriggerSource(triggerSource);
        metrics.setAffectedEntities(affectedEntities);
        return metrics;
    }

    /**
     * Checks if execution was successful
     */
    public boolean isSuccessful() {
        return Boolean.TRUE.equals(success);
    }

    /**
     * Checks if execution failed
     */
    public boolean isFailed() {
        return Boolean.FALSE.equals(success);
    }

    /**
     * Gets execution duration in seconds
     */
    public Double getExecutionDurationSeconds() {
        return executionDurationMs != null ? executionDurationMs / 1000.0 : null;
    }

    /**
     * Checks if execution was fast (< 1 second)
     */
    public boolean isFastExecution() {
        return executionDurationMs != null && executionDurationMs < 1000;
    }

    /**
     * Checks if execution was slow (> 5 seconds)
     */
    public boolean isSlowExecution() {
        return executionDurationMs != null && executionDurationMs > 5000;
    }

    /**
     * Checks if performance score is high (>= 80)
     */
    public boolean isHighPerformance() {
        return performanceScore != null && performanceScore >= 80.0;
    }

    /**
     * Checks if performance score is low (< 50)
     */
    public boolean isLowPerformance() {
        return performanceScore != null && performanceScore < 50.0;
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AutomationPerformanceMetrics that = (AutomationPerformanceMetrics) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // ToString
    @Override
    public String toString() {
        return "AutomationPerformanceMetrics{" +
                "id=" + id +
                ", automationManagementId=" + (automationManagement != null ? automationManagement.getId() : null) +
                ", executionTimestamp=" + executionTimestamp +
                ", executionDurationMs=" + executionDurationMs +
                ", success=" + success +
                ", errorMessage='" + errorMessage + '\'' +
                ", triggerSource='" + triggerSource + '\'' +
                ", performanceScore=" + performanceScore +
                '}';
    }
}
