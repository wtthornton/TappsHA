package com.tappha.approval.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for approval decisions
 * 
 * Represents approval decisions in the database with comprehensive
 * audit trail and decision tracking
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "approval_decisions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDecision {
    
    /**
     * Unique identifier for the approval decision
     */
    @Id
    private String id;
    
    /**
     * The approval request ID this decision relates to
     */
    @Column(name = "request_id", nullable = false)
    private String requestId;
    
    /**
     * The decision made (APPROVED, REJECTED)
     */
    @Column(name = "decision", nullable = false)
    private String decision;
    
    /**
     * Human-readable reason for the decision
     */
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    /**
     * User who made the decision
     */
    @Column(name = "decided_by", nullable = false)
    private String decidedBy;
    
    /**
     * Timestamp when the decision was made
     */
    @Column(name = "decided_at", nullable = false)
    private LocalDateTime decidedAt;
} 