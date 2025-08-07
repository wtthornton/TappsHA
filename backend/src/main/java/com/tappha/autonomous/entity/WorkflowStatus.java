package com.tappha.autonomous.entity;

/**
 * Enum representing the status of approval workflows in the autonomous management system.
 *
 * Workflow Status:
 * - PENDING: Waiting for approval
 * - APPROVED: Workflow has been approved
 * - REJECTED: Workflow has been rejected
 * - CANCELLED: Workflow has been cancelled
 */
public enum WorkflowStatus {

    /**
     * Workflow is waiting for approval
     */
    PENDING,

    /**
     * Workflow has been approved
     */
    APPROVED,

    /**
     * Workflow has been rejected
     */
    REJECTED,

    /**
     * Workflow has been cancelled
     */
    CANCELLED
}
