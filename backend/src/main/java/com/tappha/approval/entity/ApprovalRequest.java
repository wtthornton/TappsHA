package com.tappha.approval.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for approval requests
 * 
 * Represents approval requests in the database with comprehensive
 * lifecycle management and status tracking
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "approval_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
    
    /**
     * Unique identifier for the approval request
     */
    @Id
    private String id;
    
    /**
     * The automation ID that requires approval
     */
    @Column(name = "automation_id", nullable = false)
    private String automationId;
    
    /**
     * Type of approval request (CREATE, MODIFY, DELETE, etc.)
     */
    @Column(name = "request_type", nullable = false)
    private String requestType;
    
    /**
     * Human-readable description of the approval request
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * User who requested the approval
     */
    @Column(name = "requested_by", nullable = false)
    private String requestedBy;
    
    /**
     * Priority level (LOW, MEDIUM, HIGH, CRITICAL)
     */
    @Column(name = "priority", nullable = false)
    private String priority;
    
    /**
     * Current status (PENDING, APPROVED, REJECTED, DELEGATED)
     */
    @Column(name = "status", nullable = false)
    private String status;
    
    /**
     * User to whom the approval was delegated (if applicable)
     */
    @Column(name = "delegated_to")
    private String delegatedTo;
    
    /**
     * Reason for delegation (if applicable)
     */
    @Column(name = "delegation_reason", columnDefinition = "TEXT")
    private String delegationReason;
    
    /**
     * Timestamp when the request was created
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when the request was last updated
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
} 