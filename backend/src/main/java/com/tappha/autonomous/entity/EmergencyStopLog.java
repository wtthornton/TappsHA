package com.tappha.autonomous.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing emergency stop logs for safety monitoring.
 *
 * This entity tracks:
 * - Emergency stop triggers and reasons
 * - Affected automations and recovery actions
 * - Safety monitoring and compliance
 * - User tracking and audit trails
 */
@Entity
@Table(name = "emergency_stop_log", indexes = {
    @Index(name = "idx_emergency_stop_automation_id", columnList = "automation_management_id"),
    @Index(name = "idx_emergency_stop_trigger_timestamp", columnList = "trigger_timestamp"),
    @Index(name = "idx_emergency_stop_triggered_by", columnList = "triggered_by")
})
@EntityListeners(AuditingEntityListener.class)
public class EmergencyStopLog {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "automation_management_id")
    private AutomationManagement automationManagement;

    @NotNull
    @Column(name = "stop_type", nullable = false)
    private String stopType; // 'MANUAL', 'AUTOMATIC', 'SYSTEM', 'EMERGENCY'

    @NotNull
    @Column(name = "triggered_by", nullable = false)
    private UUID triggeredBy;

    @CreatedDate
    @Column(name = "trigger_timestamp", nullable = false, updatable = false)
    private Instant triggerTimestamp;

    @NotNull
    @Size(min = 1, message = "Stop reason must not be empty")
    @Column(name = "stop_reason", columnDefinition = "TEXT", nullable = false)
    private String stopReason;

    @Column(name = "trigger_source")
    private String triggerSource; // 'MANUAL', 'AUTOMATIC', 'SYSTEM'

    @Column(name = "recovery_status")
    private String recoveryStatus; // 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'

    @Column(name = "recovery_timestamp")
    private Instant recoveryTimestamp;

    @Column(name = "affected_automations", columnDefinition = "JSONB")
    private String affectedAutomations;

    @Column(name = "recovery_actions", columnDefinition = "JSONB")
    private String recoveryActions;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    // Default constructor
    public EmergencyStopLog() {
        this.triggerTimestamp = Instant.now();
    }

    // Constructor with required fields
    public EmergencyStopLog(UUID triggeredBy, String stopReason) {
        this();
        this.triggeredBy = triggeredBy;
        this.stopReason = stopReason;
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

    public UUID getTriggeredBy() {
        return triggeredBy;
    }

    public void setTriggeredBy(UUID triggeredBy) {
        this.triggeredBy = triggeredBy;
    }

    public Instant getTriggerTimestamp() {
        return triggerTimestamp;
    }

    public void setTriggerTimestamp(Instant triggerTimestamp) {
        this.triggerTimestamp = triggerTimestamp;
    }

    public String getStopReason() {
        return stopReason;
    }

    public void setStopReason(String stopReason) {
        this.stopReason = stopReason;
    }

    public String getTriggerSource() {
        return triggerSource;
    }

    public void setTriggerSource(String triggerSource) {
        this.triggerSource = triggerSource;
    }

    public String getAffectedAutomations() {
        return affectedAutomations;
    }

    public void setAffectedAutomations(String affectedAutomations) {
        this.affectedAutomations = affectedAutomations;
    }

    public String getRecoveryActions() {
        return recoveryActions;
    }

    public void setRecoveryActions(String recoveryActions) {
        this.recoveryActions = recoveryActions;
    }

    public String getStopType() {
        return stopType;
    }

    public void setStopType(String stopType) {
        this.stopType = stopType;
    }

    public String getRecoveryStatus() {
        return recoveryStatus;
    }

    public void setRecoveryStatus(String recoveryStatus) {
        this.recoveryStatus = recoveryStatus;
    }

    public Instant getRecoveryTimestamp() {
        return recoveryTimestamp;
    }

    public void setRecoveryTimestamp(Instant recoveryTimestamp) {
        this.recoveryTimestamp = recoveryTimestamp;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    // Business Logic Methods
    /**
     * Creates a manual emergency stop
     */
    public static EmergencyStopLog createManualEmergencyStop(
            UUID triggeredBy,
            String stopReason,
            String affectedAutomations) {
        
        EmergencyStopLog log = new EmergencyStopLog(triggeredBy, stopReason);
        log.setStopType("MANUAL");
        log.setTriggerSource("MANUAL");
        log.setAffectedAutomations(affectedAutomations);
        return log;
    }

    /**
     * Creates an automatic emergency stop
     */
    public static EmergencyStopLog createAutomaticEmergencyStop(
            UUID triggeredBy,
            String stopReason,
            String affectedAutomations,
            String recoveryActions) {
        
        EmergencyStopLog log = new EmergencyStopLog(triggeredBy, stopReason);
        log.setStopType("AUTOMATIC");
        log.setTriggerSource("AUTOMATIC");
        log.setAffectedAutomations(affectedAutomations);
        log.setRecoveryActions(recoveryActions);
        return log;
    }

    /**
     * Creates a system emergency stop
     */
    public static EmergencyStopLog createSystemEmergencyStop(
            UUID triggeredBy,
            String stopReason,
            String affectedAutomations,
            String recoveryActions) {
        
        EmergencyStopLog log = new EmergencyStopLog(triggeredBy, stopReason);
        log.setStopType("SYSTEM");
        log.setTriggerSource("SYSTEM");
        log.setAffectedAutomations(affectedAutomations);
        log.setRecoveryActions(recoveryActions);
        return log;
    }

    /**
     * Checks if this is a manual emergency stop
     */
    public boolean isManualEmergencyStop() {
        return "MANUAL".equals(triggerSource);
    }

    /**
     * Checks if this is an automatic emergency stop
     */
    public boolean isAutomaticEmergencyStop() {
        return "AUTOMATIC".equals(triggerSource);
    }

    /**
     * Checks if this is a system emergency stop
     */
    public boolean isSystemEmergencyStop() {
        return "SYSTEM".equals(triggerSource);
    }

    /**
     * Gets emergency stop age in milliseconds
     */
    public Long getEmergencyStopAgeMs() {
        return Instant.now().toEpochMilli() - triggerTimestamp.toEpochMilli();
    }

    /**
     * Gets emergency stop age in minutes
     */
    public Long getEmergencyStopAgeMinutes() {
        return getEmergencyStopAgeMs() / (60 * 1000);
    }

    /**
     * Checks if emergency stop is recent (< 1 hour old)
     */
    public boolean isRecentEmergencyStop() {
        return getEmergencyStopAgeMs() < (60 * 60 * 1000);
    }

    /**
     * Checks if emergency stop is old (> 24 hours old)
     */
    public boolean isOldEmergencyStop() {
        return getEmergencyStopAgeMs() > (24L * 60 * 60 * 1000);
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmergencyStopLog that = (EmergencyStopLog) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // ToString
    @Override
    public String toString() {
        return "EmergencyStopLog{" +
                "id=" + id +
                ", automationManagementId=" + (automationManagement != null ? automationManagement.getId() : null) +
                ", stopType='" + stopType + '\'' +
                ", triggeredBy=" + triggeredBy +
                ", triggerTimestamp=" + triggerTimestamp +
                ", stopReason='" + stopReason + '\'' +
                ", triggerSource='" + triggerSource + '\'' +
                ", recoveryStatus='" + recoveryStatus + '\'' +
                '}';
    }
}
