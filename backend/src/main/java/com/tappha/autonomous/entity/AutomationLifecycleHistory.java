package com.tappha.autonomous.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing automation lifecycle history for audit trail.
 *
 * This entity tracks:
 * - State transitions with timestamps
 * - Transition reasons and metadata
 * - User who performed the transition
 * - Complete audit trail for compliance
 */
@Entity
@Table(name = "automation_lifecycle_history", indexes = {
    @Index(name = "idx_lifecycle_history_automation_id", columnList = "automation_management_id"),
    @Index(name = "idx_lifecycle_history_transition_timestamp", columnList = "transition_timestamp"),
    @Index(name = "idx_lifecycle_history_new_state", columnList = "new_state"),
    @Index(name = "idx_lifecycle_history_transitioned_by", columnList = "transitioned_by")
})
@EntityListeners(AuditingEntityListener.class)
public class AutomationLifecycleHistory {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "automation_management_id", nullable = false)
    private AutomationManagement automationManagement;

    @Column(name = "previous_state")
    private String previousState;

    @NotNull
    @Column(name = "new_state", nullable = false)
    private String newState;

    @Column(name = "transition_reason", columnDefinition = "TEXT")
    private String transitionReason;

    @CreatedDate
    @Column(name = "transition_timestamp", nullable = false, updatable = false)
    private Instant transitionTimestamp;

    @Column(name = "transitioned_by")
    private UUID transitionedBy;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    // Default constructor
    public AutomationLifecycleHistory() {
        this.transitionTimestamp = Instant.now();
    }

    // Constructor with required fields
    public AutomationLifecycleHistory(AutomationManagement automationManagement, String newState) {
        this();
        this.automationManagement = automationManagement;
        this.newState = newState;
    }

    // Constructor with previous state
    public AutomationLifecycleHistory(AutomationManagement automationManagement, String previousState, String newState) {
        this(automationManagement, newState);
        this.previousState = previousState;
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

    public String getPreviousState() {
        return previousState;
    }

    public void setPreviousState(String previousState) {
        this.previousState = previousState;
    }

    public String getNewState() {
        return newState;
    }

    public void setNewState(String newState) {
        this.newState = newState;
    }

    public String getTransitionReason() {
        return transitionReason;
    }

    public void setTransitionReason(String transitionReason) {
        this.transitionReason = transitionReason;
    }

    public Instant getTransitionTimestamp() {
        return transitionTimestamp;
    }

    public void setTransitionTimestamp(Instant transitionTimestamp) {
        this.transitionTimestamp = transitionTimestamp;
    }

    public UUID getTransitionedBy() {
        return transitionedBy;
    }

    public void setTransitionedBy(UUID transitionedBy) {
        this.transitionedBy = transitionedBy;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    // Business Logic Methods
    /**
     * Creates a lifecycle history entry for a state transition
     */
    public static AutomationLifecycleHistory createTransition(
            AutomationManagement automationManagement,
            String previousState,
            String newState,
            String reason,
            UUID transitionedBy) {
        
        AutomationLifecycleHistory history = new AutomationLifecycleHistory(automationManagement, previousState, newState);
        history.setTransitionReason(reason);
        history.setTransitionedBy(transitionedBy);
        return history;
    }

    /**
     * Creates a lifecycle history entry with metadata
     */
    public static AutomationLifecycleHistory createTransitionWithMetadata(
            AutomationManagement automationManagement,
            String previousState,
            String newState,
            String reason,
            UUID transitionedBy,
            String metadata) {
        
        AutomationLifecycleHistory history = createTransition(automationManagement, previousState, newState, reason, transitionedBy);
        history.setMetadata(metadata);
        return history;
    }

    /**
     * Checks if this transition represents an activation
     */
    public boolean isActivation() {
        return LifecycleState.ACTIVE.name().equals(newState) && 
               !LifecycleState.ACTIVE.name().equals(previousState);
    }

    /**
     * Checks if this transition represents a deactivation
     */
    public boolean isDeactivation() {
        return LifecycleState.INACTIVE.name().equals(newState) && 
               !LifecycleState.INACTIVE.name().equals(previousState);
    }

    /**
     * Checks if this transition represents retirement
     */
    public boolean isRetirement() {
        return LifecycleState.RETIRED.name().equals(newState);
    }

    /**
     * Checks if this transition represents a pending state
     */
    public boolean isPending() {
        return LifecycleState.PENDING.name().equals(newState);
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AutomationLifecycleHistory that = (AutomationLifecycleHistory) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // ToString
    @Override
    public String toString() {
        return "AutomationLifecycleHistory{" +
                "id=" + id +
                ", automationManagementId=" + (automationManagement != null ? automationManagement.getId() : null) +
                ", previousState='" + previousState + '\'' +
                ", newState='" + newState + '\'' +
                ", transitionReason='" + transitionReason + '\'' +
                ", transitionTimestamp=" + transitionTimestamp +
                ", transitionedBy=" + transitionedBy +
                '}';
    }
}
