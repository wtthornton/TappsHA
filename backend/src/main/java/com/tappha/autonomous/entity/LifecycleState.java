package com.tappha.autonomous.entity;

/**
 * Enum representing the lifecycle states of automations in the autonomous management system.
 * 
 * States:
 * - ACTIVE: Automation is currently active and executing
 * - PENDING: Automation is waiting for approval or activation
 * - INACTIVE: Automation is temporarily disabled
 * - RETIRED: Automation has been permanently retired
 */
public enum LifecycleState {
    
    /**
     * Automation is currently active and executing normally
     */
    ACTIVE,
    
    /**
     * Automation is waiting for approval or activation
     */
    PENDING,
    
    /**
     * Automation is temporarily disabled
     */
    INACTIVE,
    
    /**
     * Automation has been permanently retired
     */
    RETIRED
}
