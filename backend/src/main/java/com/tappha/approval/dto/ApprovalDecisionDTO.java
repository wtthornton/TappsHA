package com.tappha.approval.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for approval decision data
 * 
 * Contains comprehensive approval decision information including:
 * - Decision details and reasoning
 * - User who made the decision
 * - Timestamp for audit trail
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDecisionDTO {
    
    /**
     * Unique identifier for the approval decision
     */
    private String id;
    
    /**
     * The approval request ID this decision relates to
     */
    private String requestId;
    
    /**
     * The decision made (APPROVED, REJECTED)
     */
    private String decision;
    
    /**
     * Human-readable reason for the decision
     */
    private String reason;
    
    /**
     * User who made the decision
     */
    private String decidedBy;
    
    /**
     * Timestamp when the decision was made
     */
    private LocalDateTime decidedAt;
} 