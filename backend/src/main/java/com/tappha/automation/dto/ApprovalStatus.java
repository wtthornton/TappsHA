package com.tappha.automation.dto;

/**
 * Enum for approval workflow status
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
public enum ApprovalStatus {
    PENDING,    // Waiting for approval
    APPROVED,   // Approved by user
    REJECTED,   // Rejected by user
    EXPIRED,    // Approval request expired
    CANCELLED   // Approval request cancelled
} 