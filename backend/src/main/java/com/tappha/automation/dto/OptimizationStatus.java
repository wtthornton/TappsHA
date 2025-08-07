package com.tappha.automation.dto;

/**
 * Enum for optimization analysis status
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
public enum OptimizationStatus {
    PENDING,    // Waiting for analysis
    ANALYZING,  // Currently analyzing
    COMPLETED,  // Analysis completed
    FAILED,     // Analysis failed
    CANCELLED   // Analysis cancelled
} 