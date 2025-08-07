package com.tappha.autonomous.entity;

/**
 * Enum representing the types of approval workflows in the autonomous management system.
 *
 * Workflow Types:
 * - CREATION: New automation creation approval
 * - MODIFICATION: Existing automation modification approval
 * - RETIREMENT: Automation retirement approval
 */
public enum WorkflowType {

    /**
     * New automation creation approval workflow
     */
    CREATION,

    /**
     * Existing automation modification approval workflow
     */
    MODIFICATION,

    /**
     * Automation retirement approval workflow
     */
    RETIREMENT
}
