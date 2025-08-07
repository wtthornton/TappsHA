package com.tappha.automation.dto;

/**
 * Enum for automation lifecycle status
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
public enum AutomationStatus {
    DRAFT,      // Initial state, not yet active
    PENDING,    // Waiting for approval
    ACTIVE,     // Running and operational
    PAUSED,     // Temporarily disabled
    RETIRED     // No longer in use
} 