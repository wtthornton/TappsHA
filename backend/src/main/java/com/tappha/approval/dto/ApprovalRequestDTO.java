package com.tappha.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for approval request data
 * 
 * Contains comprehensive approval request information including:
 * - Request details and metadata
 * - Status tracking
 * - Delegation information
 * - Timestamps for lifecycle management
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequestDTO {
    
    /**
     * Unique identifier for the approval request
     */
    private String id;
    
    /**
     * The automation ID that requires approval
     */
    private String automationId;
    
    /**
     * Type of approval request (CREATE, MODIFY, DELETE, etc.)
     */
    private String requestType;
    
    /**
     * Human-readable description of the approval request
     */
    private String description;
    
    /**
     * User who requested the approval
     */
    private String requestedBy;
    
    /**
     * Priority level (LOW, MEDIUM, HIGH, CRITICAL)
     */
    private String priority;
    
    /**
     * Current status (PENDING, APPROVED, REJECTED, DELEGATED)
     */
    private String status;
    
    /**
     * User to whom the approval was delegated (if applicable)
     */
    private String delegatedTo;
    
    /**
     * Reason for delegation (if applicable)
     */
    private String delegationReason;
    
    /**
     * Timestamp when the request was created
     */
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when the request was last updated
     */
    private LocalDateTime updatedAt;
} 