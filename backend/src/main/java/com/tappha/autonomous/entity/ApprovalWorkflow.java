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
 * Entity representing approval workflows for automation changes.
 *
 * This entity manages:
 * - Multi-level approval processes
 * - Emergency stop capabilities
 * - Approval/rejection tracking
 * - Safety mechanisms and audit trails
 */
@Entity
@Table(name = "approval_workflow", indexes = {
    @Index(name = "idx_approval_workflow_automation_id", columnList = "automation_management_id"),
    @Index(name = "idx_approval_workflow_status", columnList = "status"),
    @Index(name = "idx_approval_workflow_type", columnList = "workflow_type"),
    @Index(name = "idx_approval_workflow_requested_by", columnList = "requested_by"),
    @Index(name = "idx_approval_workflow_request_timestamp", columnList = "request_timestamp")
})
@EntityListeners(AuditingEntityListener.class)
public class ApprovalWorkflow {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "automation_management_id", nullable = false)
    private AutomationManagement automationManagement;

    @Enumerated(EnumType.STRING)
    @Column(name = "workflow_type", nullable = false)
    private WorkflowType workflowType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WorkflowStatus status = WorkflowStatus.PENDING;

    @NotNull
    @Column(name = "requested_by", nullable = false)
    private UUID requestedBy;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "rejected_by")
    private UUID rejectedBy;

    @CreatedDate
    @Column(name = "request_timestamp", nullable = false, updatable = false)
    private Instant requestTimestamp;

    @Column(name = "approval_timestamp")
    private Instant approvalTimestamp;

    @Column(name = "rejection_timestamp")
    private Instant rejectionTimestamp;

    @Size(min = 1, message = "Approval notes must not be empty if provided")
    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;

    @Size(min = 1, message = "Rejection reason must not be empty if provided")
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "emergency_stop_triggered")
    private Boolean emergencyStopTriggered = false;

    @Column(name = "emergency_stop_timestamp")
    private Instant emergencyStopTimestamp;

    @Size(min = 1, message = "Emergency stop reason must not be empty if provided")
    @Column(name = "emergency_stop_reason", columnDefinition = "TEXT")
    private String emergencyStopReason;

    // Default constructor
    public ApprovalWorkflow() {
        this.requestTimestamp = Instant.now();
    }

    // Constructor with required fields
    public ApprovalWorkflow(AutomationManagement automationManagement, WorkflowType workflowType, UUID requestedBy) {
        this();
        this.automationManagement = automationManagement;
        this.workflowType = workflowType;
        this.requestedBy = requestedBy;
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

    public WorkflowType getWorkflowType() {
        return workflowType;
    }

    public void setWorkflowType(WorkflowType workflowType) {
        this.workflowType = workflowType;
    }

    public WorkflowStatus getStatus() {
        return status;
    }

    public void setStatus(WorkflowStatus status) {
        this.status = status;
    }

    public UUID getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(UUID requestedBy) {
        this.requestedBy = requestedBy;
    }

    public UUID getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(UUID approvedBy) {
        this.approvedBy = approvedBy;
    }

    public UUID getRejectedBy() {
        return rejectedBy;
    }

    public void setRejectedBy(UUID rejectedBy) {
        this.rejectedBy = rejectedBy;
    }

    public Instant getRequestTimestamp() {
        return requestTimestamp;
    }

    public void setRequestTimestamp(Instant requestTimestamp) {
        this.requestTimestamp = requestTimestamp;
    }

    public Instant getApprovalTimestamp() {
        return approvalTimestamp;
    }

    public void setApprovalTimestamp(Instant approvalTimestamp) {
        this.approvalTimestamp = approvalTimestamp;
    }

    public Instant getRejectionTimestamp() {
        return rejectionTimestamp;
    }

    public void setRejectionTimestamp(Instant rejectionTimestamp) {
        this.rejectionTimestamp = rejectionTimestamp;
    }

    public String getApprovalNotes() {
        return approvalNotes;
    }

    public void setApprovalNotes(String approvalNotes) {
        this.approvalNotes = approvalNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Boolean getEmergencyStopTriggered() {
        return emergencyStopTriggered;
    }

    public void setEmergencyStopTriggered(Boolean emergencyStopTriggered) {
        this.emergencyStopTriggered = emergencyStopTriggered;
    }

    public Instant getEmergencyStopTimestamp() {
        return emergencyStopTimestamp;
    }

    public void setEmergencyStopTimestamp(Instant emergencyStopTimestamp) {
        this.emergencyStopTimestamp = emergencyStopTimestamp;
    }

    public String getEmergencyStopReason() {
        return emergencyStopReason;
    }

    public void setEmergencyStopReason(String emergencyStopReason) {
        this.emergencyStopReason = emergencyStopReason;
    }

    // Business Logic Methods
    /**
     * Approves the workflow
     */
    public void approve(UUID approvedBy, String notes) {
        this.status = WorkflowStatus.APPROVED;
        this.approvedBy = approvedBy;
        this.approvalTimestamp = Instant.now();
        this.approvalNotes = notes;
    }

    /**
     * Rejects the workflow
     */
    public void reject(UUID rejectedBy, String reason) {
        this.status = WorkflowStatus.REJECTED;
        this.rejectedBy = rejectedBy;
        this.rejectionTimestamp = Instant.now();
        this.rejectionReason = reason;
    }

    /**
     * Cancels the workflow
     */
    public void cancel() {
        this.status = WorkflowStatus.CANCELLED;
    }

    /**
     * Triggers emergency stop
     */
    public void triggerEmergencyStop(String reason) {
        this.emergencyStopTriggered = true;
        this.emergencyStopTimestamp = Instant.now();
        this.emergencyStopReason = reason;
        this.status = WorkflowStatus.CANCELLED;
    }

    /**
     * Checks if workflow is pending
     */
    public boolean isPending() {
        return WorkflowStatus.PENDING.equals(status);
    }

    /**
     * Checks if workflow is approved
     */
    public boolean isApproved() {
        return WorkflowStatus.APPROVED.equals(status);
    }

    /**
     * Checks if workflow is rejected
     */
    public boolean isRejected() {
        return WorkflowStatus.REJECTED.equals(status);
    }

    /**
     * Checks if workflow is cancelled
     */
    public boolean isCancelled() {
        return WorkflowStatus.CANCELLED.equals(status);
    }

    /**
     * Checks if emergency stop was triggered
     */
    public boolean isEmergencyStopTriggered() {
        return Boolean.TRUE.equals(emergencyStopTriggered);
    }

    /**
     * Gets the workflow duration in milliseconds
     */
    public Long getWorkflowDurationMs() {
        if (approvalTimestamp != null) {
            return approvalTimestamp.toEpochMilli() - requestTimestamp.toEpochMilli();
        } else if (rejectionTimestamp != null) {
            return rejectionTimestamp.toEpochMilli() - requestTimestamp.toEpochMilli();
        }
        return Instant.now().toEpochMilli() - requestTimestamp.toEpochMilli();
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ApprovalWorkflow that = (ApprovalWorkflow) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // ToString
    @Override
    public String toString() {
        return "ApprovalWorkflow{" +
                "id=" + id +
                ", automationManagementId=" + (automationManagement != null ? automationManagement.getId() : null) +
                ", workflowType=" + workflowType +
                ", status=" + status +
                ", requestedBy=" + requestedBy +
                ", approvedBy=" + approvedBy +
                ", rejectedBy=" + rejectedBy +
                ", requestTimestamp=" + requestTimestamp +
                ", approvalTimestamp=" + approvalTimestamp +
                ", rejectionTimestamp=" + rejectionTimestamp +
                ", emergencyStopTriggered=" + emergencyStopTriggered +
                '}';
    }
}
